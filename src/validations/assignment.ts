import { z } from "zod";

export const assignCourseSchema = z.object({
  courseId: z.string().min(1),
  userIds: z.array(z.string().min(1)).min(1, "Select at least one person"),
});
export type AssignCourseInput = z.infer<typeof assignCourseSchema>;
