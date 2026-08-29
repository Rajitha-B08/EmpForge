import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";
import { employeeUpdateSchema } from "@/validations/employee";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: { user: true, mentor: { include: { user: true } }, application: { include: { job: true } } },
  });
  if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  return NextResponse.json(employee);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = employeeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { internEndDate, ...rest } = parsed.data;
  const employee = await prisma.employee.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(internEndDate !== undefined ? { internEndDate: internEndDate ? new Date(internEndDate) : null } : {}),
    },
  });
  return NextResponse.json(employee);
}
