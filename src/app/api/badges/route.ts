import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole, permissionErrorResponse } from "@/lib/permissions";
import { badgeSchema } from "@/validations/badge";

export async function GET() {
  try {
    await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const badges = await prisma.badge.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(badges);
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
  const parsed = badgeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const badge = await prisma.badge.create({ data: parsed.data });
  return NextResponse.json(badge, { status: 201 });
}
