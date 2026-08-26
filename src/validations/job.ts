import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(3, "Title is too short").max(200),
  description: z.string().min(10, "Description is too short"),
  status: z.enum(["OPEN", "CLOSED", "DRAFT"]).default("DRAFT"),
  openings: z.coerce.number().int().min(1).default(1),
});

export type JobInput = z.infer<typeof jobSchema>;
