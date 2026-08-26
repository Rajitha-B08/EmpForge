import { NextRequest, NextResponse } from "next/server";
import { requireUser, permissionErrorResponse } from "@/lib/permissions";
import { submitExamAttempt } from "@/services/exams";
import { submitExamSchema } from "@/validations/exam";

// Server calculates score/percentage/passed from the DB - the client only
// ever sends which option it picked per question. See services/exams.ts.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = submitExamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const attempt = await submitExamAttempt(params.id, user.id, parsed.data.answers);
    return NextResponse.json(attempt);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
