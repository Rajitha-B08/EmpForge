import { prisma } from "@/lib/db";

export async function createPost(authorId: string, body: string) {
  return prisma.post.create({ data: { authorId, body } });
}

export async function togglePostLike(postId: string, userId: string) {
  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  await prisma.like.create({ data: { postId, userId } });
  return { liked: true };
}

export async function createComment(postId: string, authorId: string, body: string) {
  return prisma.comment.create({ data: { postId, authorId, body } });
}

export async function deleteComment(commentId: string, requestingUserId: string, isAdmin: boolean) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Comment not found");
  if (comment.authorId !== requestingUserId && !isAdmin) {
    throw new Error("You can only delete your own comments");
  }
  return prisma.comment.delete({ where: { id: commentId } });
}
