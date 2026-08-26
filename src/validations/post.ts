import { z } from "zod";

export const postSchema = z.object({
  body: z.string().min(1, "Say something first").max(2000),
});
export type PostInput = z.infer<typeof postSchema>;

export const commentSchema = z.object({
  body: z.string().min(1, "Comment can't be empty").max(1000),
});
export type CommentInput = z.infer<typeof commentSchema>;
