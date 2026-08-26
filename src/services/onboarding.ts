import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { EmployeeType } from "@prisma/client";

export async function convertCandidateToEmployee(input: {
  applicationId: string;
  type: EmployeeType;
  mentorId?: string;
  joinDate: Date;
  internStartDate?: Date;
  internEndDate?: Date;
  password: string;
}) {
  const application = await prisma.application.findUnique({
    where: { id: input.applicationId },
    include: { candidate: true, employee: true },
  });
  if (!application) throw new Error("Application not found");
  if (application.stage !== "HIRED") {
    throw new Error("Only hired candidates can be converted");
  }
  if (application.employee) {
    throw new Error("This candidate has already been converted");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: application.candidate.email },
  });
  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const role = input.type === "INTERN" ? "INTERN" : "EMPLOYEE";

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: application.candidate.name,
        email: application.candidate.email,
        passwordHash,
        role,
      },
    });

    const employee = await tx.employee.create({
      data: {
        userId: user.id,
        applicationId: application.id,
        type: input.type,
        mentorId: input.mentorId,
        joinDate: input.joinDate,
        internStartDate: input.internStartDate,
        internEndDate: input.internEndDate,
        status: "ACTIVE",
      },
    });

    return { user, employee };
  });
}
