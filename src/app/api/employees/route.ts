import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = searchParams.get("q");

  const employees = await prisma.employee.findMany({
    where: {
      ...(type ? { type: type as any } : {}),
      ...(status ? { status: status as any } : {}),
      ...(search ? { user: { name: { contains: search } } } : {}),
    },
    include: { user: true, mentor: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(employees);
}
