import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  lesson: { findMany: vi.fn() },
  lessonProgress: { count: vi.fn() },
  like: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
  comment: { findUnique: vi.fn(), delete: vi.fn() },
};
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

const { calculateCourseProgress } = await import("@/services/courses");
const { togglePostLike, deleteComment } = await import("@/services/community");

describe("calculateCourseProgress", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 0 when a course has no lessons", async () => {
    mockPrisma.lesson.findMany.mockResolvedValue([]);
    const progress = await calculateCourseProgress("c1", "u1");
    expect(progress).toBe(0);
  });

  it("calculates percentage of completed lessons", async () => {
    mockPrisma.lesson.findMany.mockResolvedValue([{ id: "l1" }, { id: "l2" }, { id: "l3" }, { id: "l4" }]);
    mockPrisma.lessonProgress.count.mockResolvedValue(1);
    const progress = await calculateCourseProgress("c1", "u1");
    expect(progress).toBe(25);
  });
});

describe("togglePostLike", () => {
  beforeEach(() => vi.clearAllMocks());

  it("likes a post that has not been liked yet", async () => {
    mockPrisma.like.findUnique.mockResolvedValue(null);
    const result = await togglePostLike("p1", "u1");
    expect(result.liked).toBe(true);
    expect(mockPrisma.like.create).toHaveBeenCalledOnce();
  });

  it("unlikes a post that was already liked, preventing duplicates", async () => {
    mockPrisma.like.findUnique.mockResolvedValue({ id: "like1" });
    const result = await togglePostLike("p1", "u1");
    expect(result.liked).toBe(false);
    expect(mockPrisma.like.delete).toHaveBeenCalledOnce();
    expect(mockPrisma.like.create).not.toHaveBeenCalled();
  });
});

describe("deleteComment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows the comment author to delete their own comment", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue({ id: "c1", authorId: "u1" });
    await expect(deleteComment("c1", "u1", false)).resolves.toBeDefined();
  });

  it("blocks a non-author, non-admin from deleting someone else's comment", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue({ id: "c1", authorId: "someone-else" });
    await expect(deleteComment("c1", "u1", false)).rejects.toThrow("only delete your own");
  });

  it("allows an admin to delete any comment", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue({ id: "c1", authorId: "someone-else" });
    await expect(deleteComment("c1", "u1", true)).resolves.toBeDefined();
  });
});
