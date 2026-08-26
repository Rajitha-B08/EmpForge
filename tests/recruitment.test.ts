import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  application: { findUnique: vi.fn(), update: vi.fn() },
};
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

const { moveCandidateToStage, nextPossibleStages } = await import("@/services/recruitment");

describe("moveCandidateToStage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("moves an application forward through the pipeline", async () => {
    mockPrisma.application.findUnique.mockResolvedValue({ id: "a1", stage: "APPLIED", feedback: null });
    mockPrisma.application.update.mockResolvedValue({ id: "a1", stage: "SCREENING" });

    const result = await moveCandidateToStage("a1", "SCREENING");
    expect(result.stage).toBe("SCREENING");
  });

  it("throws when trying to move a hired candidate back into the pipeline", async () => {
    mockPrisma.application.findUnique.mockResolvedValue({ id: "a1", stage: "HIRED", feedback: null });

    await expect(moveCandidateToStage("a1", "SCREENING")).rejects.toThrow(
      "Cannot move a hired candidate"
    );
  });
});

describe("nextPossibleStages", () => {
  it("returns forward stage plus rejection for an active stage", () => {
    expect(nextPossibleStages("APPLIED")).toEqual(["SCREENING", "REJECTED"]);
  });

  it("returns no options for a terminal stage", () => {
    expect(nextPossibleStages("HIRED")).toEqual([]);
    expect(nextPossibleStages("REJECTED")).toEqual([]);
  });
});
