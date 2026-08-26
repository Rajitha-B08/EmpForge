import { NextRequest, NextResponse } from "next/server";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";
import { stageUpdateSchema } from "@/validations/application";
import { moveCandidateToStage } from "@/services/recruitment";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = stageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const application = await moveCandidateToStage(params.id, parsed.data.stage, parsed.data.feedback);
    return NextResponse.json(application);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
