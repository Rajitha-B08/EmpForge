import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole, permissionErrorResponse } from "@/lib/permissions";
import { assignCourseSchema } from "@/validations/assignment";
import { assignCourse } from "@/services/courses";

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const isStaff = user.role === "ADMIN";

  const assignments = await prisma.assignment.findMany({
    where: {
      ...(isStaff ? {} : { userId: user.id }),
      ...(status ? { status: status as any } : {}),
    },
    include: { course: true, user: true },
    orderBy: { assignedAt: "desc" },
  });

  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = assignCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const assignments = await assignCourse(parsed.data.courseId, parsed.data.userIds);
  return NextResponse.json(assignments, { status: 201 });
}
