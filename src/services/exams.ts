import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { checkBadgeEligibility } from "@/services/badges";
import { markAssignmentStarted } from "@/services/courses";

export async function startExamAttempt(examId: string, userId: string) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || !exam.active) throw new Error("Exam is not available");

  await markAssignmentStarted(exam.courseId, userId);

  return prisma.attempt.create({
    data: { examId, userId, startedAt: new Date() },
  });
}

/**
 * Scores an exam attempt entirely from the database. The client only sends
 * which option it selected for each question - marks, correctness, and the
 * pass threshold all come from the exam/question records, never the request.
 */
export async function submitExamAttempt(
  attemptId: string,
  userId: string,
  answers: { questionId: string; selectedOptionId: string }[]
) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { questions: { include: { options: true } } } } },
  });
  if (!attempt) throw new Error("Attempt not found");
  if (attempt.userId !== userId) throw new Error("This attempt does not belong to you");
  if (attempt.submittedAt) throw new Error("This attempt was already submitted");

  const questionsById = new Map(attempt.exam.questions.map((q) => [q.id, q]));
  let totalMarks = 0;
  let scoredMarks = 0;

  const answerRows: Prisma.AttemptAnswerCreateManyInput[] = [];
  for (const question of attempt.exam.questions) {
    totalMarks += question.marks;
    const given = answers.find((a) => a.questionId === question.id);
    const selectedOption = given
      ? question.options.find((o) => o.id === given.selectedOptionId)
      : undefined;

    if (selectedOption?.isCorrect) {
      scoredMarks += question.marks;
    }

    answerRows.push({
      attemptId,
      questionId: question.id,
      selectedOptionId: selectedOption?.id ?? null,
    });
  }

  const percentage = totalMarks > 0 ? Math.round((scoredMarks / totalMarks) * 10000) / 100 : 0;
  const passed = percentage >= attempt.exam.passingPercentage;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.attemptAnswer.deleteMany({ where: { attemptId } });
    await tx.attemptAnswer.createMany({ data: answerRows });
    return tx.attempt.update({
      where: { id: attemptId },
      data: {
        score: scoredMarks,
        percentage,
        passed,
        submittedAt: new Date(),
      },
    });
  });

  if (passed) {
    await checkBadgeEligibility(userId, { type: "EXAM_PASSED", examId: attempt.examId });
  }

  return updated;
}

/** Strips isCorrect off options so exam-takers never see the answer key. */
export function sanitizeQuestionsForExamTaker<
  T extends { options: { id: string; optionText: string; isCorrect: boolean }[] }
>(questions: T[]) {
  return questions.map((q) => ({
    ...q,
    options: q.options.map(({ id, optionText }) => ({ id, optionText })),
  }));
}
