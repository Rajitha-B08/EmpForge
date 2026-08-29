import { NextRequest, NextResponse } from "next/server";
import { requireUser, permissionErrorResponse } from "@/lib/permissions";
import { togglePostLike } from "@/services/community";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const result = await togglePostLike(params.id, user.id);
  return NextResponse.json(result);
}
