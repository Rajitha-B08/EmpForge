import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { sanitizeQuestionsForExamTaker } from "@/services/exams";
import { TakeExamForm } from "./take-exam-form";

export default async function TakeExamPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { displayOrder: "asc" }, include: { options: true } } },
  });
  if (!exam || !exam.active) notFound();

  const sanitizedQuestions = sanitizeQuestionsForExamTaker(exam.questions);

  return (
    <div className="max-w-2xl">
      <PageHeader title={exam.title} description={exam.description || undefined} />
      <TakeExamForm examId={exam.id} questions={sanitizedQuestions} />
    </div>
  );
}
