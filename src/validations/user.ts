import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "RECRUITER", "EMPLOYEE", "INTERN"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
