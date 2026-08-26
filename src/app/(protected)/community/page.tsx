import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Feed } from "./feed";

export default async function CommunityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
    include: {
      author: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      likes: true,
    },
  });

  const initialPosts = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    likedByMe: p.likes.some((l) => l.userId === session.user.id),
    likeCount: p.likes.length,
    comments: p.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
  }));

  return (
    <div className="max-w-2xl">
      <PageHeader title="Community" description="Share updates with the whole team." />
      <Feed initialPosts={initialPosts} currentUserId={session.user.id} isAdmin={session.user.role === "ADMIN"} />
    </div>
  );
}
