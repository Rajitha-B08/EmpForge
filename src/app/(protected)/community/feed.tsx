"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

type Comment = { id: string; body: string; createdAt: string; authorId: string; author: { name: string } };
type Post = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string };
  authorId: string;
  likedByMe: boolean;
  likeCount: number;
  comments: Comment[];
};

export function Feed({
  initialPosts,
  currentUserId,
  isAdmin,
}: {
  initialPosts: Post[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const { push } = useToast();
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [posting, setPosting] = useState(false);

  async function createPost() {
    if (!newPost.trim()) return;
    setPosting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newPost }),
    });
    setPosting(false);
    if (!res.ok) return push("Could not post", "destructive");
    const created = await res.json();
    setPosts((prev) => [
      {
        ...created,
        createdAt: created.createdAt,
        author: { name: "You" },
        likedByMe: false,
        likeCount: 0,
        comments: [],
      },
      ...prev,
    ]);
    setNewPost("");
  }

  async function toggleLike(postId: string) {
    const res = await fetch(`/api/posts/${postId}/likes`, { method: "POST" });
    if (!res.ok) return push("Could not update like", "destructive");
    const { liked } = await res.json();
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likedByMe: liked, likeCount: p.likeCount + (liked ? 1 : -1) } : p
      )
    );
  }

  async function addComment(postId: string) {
    const body = commentDrafts[postId];
    if (!body?.trim()) return;
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) return push("Could not add comment", "destructive");
    const comment = await res.json();
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, { ...comment, author: { name: "You" } }] }
          : p
      )
    );
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  }

  async function deleteComment(postId: string, commentId: string) {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (!res.ok) return push("Could not delete comment", "destructive");
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p
      )
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-2 pt-4">
          <Textarea
            placeholder="Share something with the team..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <Button size="sm" className="self-end" onClick={createPost} disabled={posting}>
            {posting ? "Posting..." : "Post"}
          </Button>
        </CardContent>
      </Card>

      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="flex flex-col gap-3 pt-4">
            <div>
              <p className="text-sm font-medium">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</p>
            </div>
            <p className="whitespace-pre-line text-sm">{post.body}</p>

            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={() => toggleLike(post.id)}
                className={post.likedByMe ? "font-medium text-primary" : "text-muted-foreground"}
              >
                {post.likedByMe ? "Liked" : "Like"} ({post.likeCount})
              </button>
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-2">
              {post.comments.map((c) => (
                <div key={c.id} className="flex items-start justify-between text-sm">
                  <div>
                    <span className="font-medium">{c.author.name}: </span>
                    {c.body}
                  </div>
                  {(c.authorId === currentUserId || isAdmin) && (
                    <button
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => deleteComment(post.id, c.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-md border border-border px-2 py-1 text-sm"
                  placeholder="Write a comment..."
                  value={commentDrafts[post.id] ?? ""}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                />
                <Button size="sm" variant="outline" onClick={() => addComment(post.id)}>
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
