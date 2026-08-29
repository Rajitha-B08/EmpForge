import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";
import { moduleSchema } from "@/validations/course";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = moduleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const module = await prisma.courseModule.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(module);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  await prisma.courseModule.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
