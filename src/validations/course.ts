import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  description: z.string().min(10, "Description is too short"),
  published: z.boolean().default(false),
});
export type CourseInput = z.infer<typeof courseSchema>;

export const moduleSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
});
export type ModuleInput = z.infer<typeof moduleSchema>;

export const lessonSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  content: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).default(0),
});
export type LessonInput = z.infer<typeof lessonSchema>;
