import { z } from "zod";

export const interviewSchema = z.object({
  applicationId: z.string().min(1),
  scheduledAt: z.string().min(1, "Pick a date/time"),
  interviewerId: z.string().min(1, "Pick an interviewer"),
  notes: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export type InterviewInput = z.infer<typeof interviewSchema>;
