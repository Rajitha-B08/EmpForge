import { z } from "zod";

export const badgeSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  description: z.string().min(5, "Description is too short"),
  icon: z.string().default("award"),
  criteria: z.string().min(3, "Describe the award criteria"),
  active: z.boolean().default(true),
});
export type BadgeInput = z.infer<typeof badgeSchema>;
