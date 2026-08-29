import { NextRequest, NextResponse } from "next/server";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";
import { recordInterviewFeedback } from "@/services/recruitment";
import { z } from "zod";

const feedbackSchema = z.object({
  notes: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const interview = await recordInterviewFeedback(params.id, parsed.data.notes, parsed.data.rating);
  return NextResponse.json(interview);
}
