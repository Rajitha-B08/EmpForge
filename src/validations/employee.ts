import { z } from "zod";

export const convertToEmployeeSchema = z.object({
  applicationId: z.string().min(1),
  type: z.enum(["INTERN", "FULL_TIME"]),
  mentorId: z.string().optional(),
  joinDate: z.string().min(1),
  internStartDate: z.string().optional(),
  internEndDate: z.string().optional(),
  password: z.string().min(8, "Temporary password must be at least 8 characters"),
});

export type ConvertToEmployeeInput = z.infer<typeof convertToEmployeeSchema>;

export const employeeUpdateSchema = z.object({
  mentorId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "COMPLETED", "EXTENDED"]).optional(),
  internEndDate: z.string().optional().nullable(),
});

export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
