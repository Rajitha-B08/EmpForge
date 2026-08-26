import { z } from "zod";

export const applicationSubmitSchema = z.object({
  jobId: z.string().min(1),
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number").optional().or(z.literal("")),
});

export type ApplicationSubmitInput = z.infer<typeof applicationSubmitSchema>;
