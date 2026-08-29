import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole, permissionErrorResponse } from "@/lib/permissions";
import { examSchema } from "@/validations/exam";

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const exams = await prisma.exam.findMany({
    where: user.role === "ADMIN" ? {} : { active: true },
    include: {
      course: true,
      _count: { select: { questions: true } },
      attempts: user.role === "ADMIN" ? true : { where: { userId: user.id } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(exams);
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
  const parsed = examSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const exam = await prisma.exam.create({ data: parsed.data });
  return NextResponse.json(exam, { status: 201 });
}
