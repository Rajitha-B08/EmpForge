import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole, permissionErrorResponse } from "@/lib/permissions";
import { examSchema } from "@/validations/exam";
import { sanitizeQuestionsForExamTaker } from "@/services/exams";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        orderBy: { displayOrder: "asc" },
        include: { options: true },
      },
    },
  });
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  if (user.role === "ADMIN") {
    return NextResponse.json(exam);
  }

  // learners never see isCorrect on options
  return NextResponse.json({
    ...exam,
    questions: sanitizeQuestionsForExamTaker(exam.questions),
  });
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
  const parsed = examSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const exam = await prisma.exam.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(exam);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  await prisma.exam.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
