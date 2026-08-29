import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";
import { questionSchema } from "@/validations/exam";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const question = await prisma.$transaction(async (tx) => {
    await tx.questionOption.deleteMany({ where: { questionId: params.id } });
    return tx.question.update({
      where: { id: params.id },
      data: {
        questionText: parsed.data.questionText,
        marks: parsed.data.marks,
        displayOrder: parsed.data.displayOrder,
        options: { create: parsed.data.options },
      },
      include: { options: true },
    });
  });

  return NextResponse.json(question);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  await prisma.question.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
