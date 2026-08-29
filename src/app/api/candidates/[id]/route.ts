import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: params.id },
    include: {
      applications: {
        include: {
          job: true,
          interviews: { include: { interviewer: true }, orderBy: { scheduledAt: "asc" } },
          employee: true,
        },
      },
    },
  });
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  return NextResponse.json(candidate);
}
