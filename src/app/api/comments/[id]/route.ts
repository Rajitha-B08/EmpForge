import { NextRequest, NextResponse } from "next/server";
import { requireUser, permissionErrorResponse } from "@/lib/permissions";
import { deleteComment } from "@/services/community";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  try {
    await deleteComment(params.id, user.id, user.role === "ADMIN");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 403 });
  }
}
