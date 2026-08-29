import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, permissionErrorResponse } from "@/lib/permissions";
import { startExamAttempt } from "@/services/exams";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const attempts = await prisma.attempt.findMany({
    where: {
      examId: params.id,
      ...(user.role === "ADMIN" ? {} : { userId: user.id }),
    },
    include: user.role === "ADMIN" ? { user: true } : undefined,
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(attempts);
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  try {
    const attempt = await startExamAttempt(params.id, user.id);
    return NextResponse.json(attempt, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
