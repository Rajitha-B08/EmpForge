import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, permissionErrorResponse } from "@/lib/permissions";
import { postSchema } from "@/validations/post";
import { createPost } from "@/services/community";

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 15;

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      author: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      likes: true,
      _count: { select: { likes: true, comments: true } },
    },
  });

  const withLikedFlag = posts.map((p) => ({
    ...p,
    likedByMe: p.likes.some((l) => l.userId === user.id),
  }));

  return NextResponse.json(withLikedFlag);
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const post = await createPost(user.id, parsed.data.body);
  return NextResponse.json(post, { status: 201 });
}
