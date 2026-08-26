import { z } from "zod";

export const stageUpdateSchema = z.object({
  stage: z.enum(["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"]),
  feedback: z.string().optional(),
});

export type StageUpdateInput = z.infer<typeof stageUpdateSchema>;
