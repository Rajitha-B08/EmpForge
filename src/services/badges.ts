import { prisma } from "@/lib/db";

type EligibilityEvent =
  | { type: "EXAM_PASSED"; examId: string }
  | { type: "COURSE_COMPLETED"; courseId: string };

/**
 * Badge matching here is intentionally simple: a badge's `criteria` field is
 * a short string like "exam:<examId>" or "course:<courseId>" that admins set
 * when creating the badge. This keeps the award logic in one place instead
 * of hardcoding badge names throughout the app.
 */
export async function checkBadgeEligibility(userId: string, event: EligibilityEvent) {
  const criteriaKey =
    event.type === "EXAM_PASSED" ? `exam:${event.examId}` : `course:${event.courseId}`;

  const matchingBadges = await prisma.badge.findMany({
    where: { active: true, criteria: criteriaKey },
  });

  for (const badge of matchingBadges) {
    await awardBadge(badge.id, userId);
  }

  return matchingBadges;
}

export async function awardBadge(badgeId: string, userId: string) {
  // upsert-style guard against duplicate awards
  const existing = await prisma.userBadge.findUnique({
    where: { badgeId_userId: { badgeId, userId } },
  });
  if (existing) return existing;

  return prisma.userBadge.create({
    data: { badgeId, userId },
  });
}
