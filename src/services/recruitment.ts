import { prisma } from "@/lib/db";
import type { ApplicationStage } from "@prisma/client";

const STAGE_ORDER: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
];

/**
 * Moves a candidate's application to a new stage. Rejection can happen from
 * any stage, otherwise we don't allow skipping backwards past HIRED since
 * that's a terminal state handled by the onboarding conversion flow.
 */
export async function moveCandidateToStage(
  applicationId: string,
  nextStage: ApplicationStage,
  feedback?: string
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!application) throw new Error("Application not found");

  if (application.stage === "HIRED" && nextStage !== "HIRED") {
    throw new Error("Cannot move a hired candidate back into the pipeline");
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: {
      stage: nextStage,
      feedback: feedback ?? application.feedback,
    },
  });
}

export function nextPossibleStages(current: ApplicationStage): ApplicationStage[] {
  if (current === "HIRED" || current === "REJECTED") return [];
  const idx = STAGE_ORDER.indexOf(current);
  const forward = idx >= 0 && idx < STAGE_ORDER.length - 1 ? [STAGE_ORDER[idx + 1]] : [];
  return [...forward, "REJECTED"];
}

export async function scheduleInterview(data: {
  applicationId: string;
  scheduledAt: Date;
  interviewerId: string;
  notes?: string;
}) {
  const interview = await prisma.interview.create({ data });
  // scheduling an interview implicitly means the candidate is being interviewed
  await prisma.application.update({
    where: { id: data.applicationId },
    data: { stage: "INTERVIEW" },
  });
  return interview;
}

export async function recordInterviewFeedback(
  interviewId: string,
  notes: string,
  rating: number
) {
  return prisma.interview.update({
    where: { id: interviewId },
    data: { notes, rating },
  });
}
