import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";
import { moduleSchema } from "@/validations/course";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = moduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const module = await prisma.courseModule.create({
    data: { ...parsed.data, courseId: params.id },
  });
  return NextResponse.json(module, { status: 201 });
}
