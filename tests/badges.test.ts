import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  badge: { findMany: vi.fn() },
  userBadge: { findUnique: vi.fn(), create: vi.fn() },
};

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

const { awardBadge, checkBadgeEligibility } = await import("@/services/badges");

describe("awardBadge", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a new user badge when none exists", async () => {
    mockPrisma.userBadge.findUnique.mockResolvedValue(null);
    mockPrisma.userBadge.create.mockResolvedValue({ id: "ub1", badgeId: "b1", userId: "u1" });

    const result = await awardBadge("b1", "u1");

    expect(mockPrisma.userBadge.create).toHaveBeenCalledOnce();
    expect(result).toEqual({ id: "ub1", badgeId: "b1", userId: "u1" });
  });

  it("does not create a duplicate badge award", async () => {
    mockPrisma.userBadge.findUnique.mockResolvedValue({ id: "existing" });

    const result = await awardBadge("b1", "u1");

    expect(mockPrisma.userBadge.create).not.toHaveBeenCalled();
    expect(result).toEqual({ id: "existing" });
  });
});

describe("checkBadgeEligibility", () => {
  beforeEach(() => vi.clearAllMocks());

  it("matches badges by exam criteria key", async () => {
    mockPrisma.badge.findMany.mockResolvedValue([{ id: "b1", criteria: "exam:e1" }]);
    mockPrisma.userBadge.findUnique.mockResolvedValue(null);
    mockPrisma.userBadge.create.mockResolvedValue({});

    await checkBadgeEligibility("u1", { type: "EXAM_PASSED", examId: "e1" });

    expect(mockPrisma.badge.findMany).toHaveBeenCalledWith({
      where: { active: true, criteria: "exam:e1" },
    });
  });

  it("matches badges by course criteria key", async () => {
    mockPrisma.badge.findMany.mockResolvedValue([]);

    await checkBadgeEligibility("u1", { type: "COURSE_COMPLETED", courseId: "c1" });

    expect(mockPrisma.badge.findMany).toHaveBeenCalledWith({
      where: { active: true, criteria: "course:c1" },
    });
  });
});
