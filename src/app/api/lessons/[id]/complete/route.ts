import { NextRequest, NextResponse } from "next/server";
import { requireUser, permissionErrorResponse } from "@/lib/permissions";
import { completeLesson } from "@/services/courses";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  try {
    const progress = await completeLesson(params.id, user.id);
    return NextResponse.json({ progress });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
