import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";
import { interviewSchema } from "@/validations/interview";
import { scheduleInterview } from "@/services/recruitment";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const interviews = await prisma.interview.findMany({
    include: { application: { include: { candidate: true, job: true } }, interviewer: true },
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json(interviews);
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = interviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const interview = await scheduleInterview({
    applicationId: parsed.data.applicationId,
    scheduledAt: new Date(parsed.data.scheduledAt),
    interviewerId: parsed.data.interviewerId,
    notes: parsed.data.notes,
  });

  return NextResponse.json(interview, { status: 201 });
}
