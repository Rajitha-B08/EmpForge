import { prisma } from "@/lib/db";
import { checkBadgeEligibility } from "@/services/badges";

export async function calculateCourseProgress(courseId: string, userId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { id: true },
  });
  if (lessons.length === 0) return 0;

  const completed = await prisma.lessonProgress.count({
    where: {
      userId,
      completed: true,
      lessonId: { in: lessons.map((l) => l.id) },
    },
  });

  return Math.round((completed / lessons.length) * 100);
}

export async function completeLesson(lessonId: string, userId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });
  if (!lesson) throw new Error("Lesson not found");

  await prisma.lessonProgress.upsert({
    where: { lessonId_userId: { lessonId, userId } },
    update: { completed: true, completedAt: new Date() },
    create: { lessonId, userId, completed: true, completedAt: new Date() },
  });

  const progress = await calculateCourseProgress(lesson.module.courseId, userId);

  if (progress === 100) {
    await markCourseAssignmentCompleted(lesson.module.courseId, userId);
    await checkBadgeEligibility(userId, {
      type: "COURSE_COMPLETED",
      courseId: lesson.module.courseId,
    });
  }

  return progress;
}

async function markCourseAssignmentCompleted(courseId: string, userId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { courseId_userId: { courseId, userId } },
  });
  if (!assignment || assignment.status === "COMPLETED") return;

  await prisma.assignment.update({
    where: { id: assignment.id },
    data: { status: "COMPLETED", completionDate: new Date() },
  });
}

export async function assignCourse(courseId: string, userIds: string[]) {
  const results = [];
  for (const userId of userIds) {
    const existing = await prisma.assignment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (existing) {
      results.push(existing);
      continue;
    }
    results.push(
      await prisma.assignment.create({
        data: { courseId, userId, status: "ASSIGNED" },
      })
    );
  }
  return results;
}

export async function markAssignmentStarted(courseId: string, userId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { courseId_userId: { courseId, userId } },
  });
  if (!assignment || assignment.status !== "ASSIGNED") return assignment;

  return prisma.assignment.update({
    where: { id: assignment.id },
    data: { status: "IN_PROGRESS", startedAt: new Date() },
  });
}
