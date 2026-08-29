import { NextRequest, NextResponse } from "next/server";
import { requireUser, permissionErrorResponse } from "@/lib/permissions";
import { commentSchema } from "@/validations/post";
import { createComment } from "@/services/community";

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
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const comment = await createComment(params.id, user.id, parsed.data.body);
  return NextResponse.json(comment, { status: 201 });
}
