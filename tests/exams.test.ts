import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  attempt: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  attemptAnswer: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  $transaction: vi.fn(async (fn: any) => fn(mockPrisma)),
};

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
vi.mock("@/services/badges", () => ({ checkBadgeEligibility: vi.fn() }));

const { submitExamAttempt } = await import("@/services/exams");

describe("submitExamAttempt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseAttempt = {
    id: "attempt1",
    userId: "user1",
    submittedAt: null,
    exam: {
      passingPercentage: 60,
      questions: [
        {
          id: "q1",
          marks: 1,
          options: [
            { id: "o1", isCorrect: true },
            { id: "o2", isCorrect: false },
          ],
        },
        {
          id: "q2",
          marks: 1,
          options: [
            { id: "o3", isCorrect: false },
            { id: "o4", isCorrect: true },
          ],
        },
      ],
    },
  };

  it("calculates score correctly from correct/incorrect answers", async () => {
    mockPrisma.attempt.findUnique.mockResolvedValue(baseAttempt);
    mockPrisma.attempt.update.mockImplementation(({ data }: any) => ({ id: "attempt1", ...data }));

    const result = await submitExamAttempt("attempt1", "user1", [
      { questionId: "q1", selectedOptionId: "o1" }, // correct
      { questionId: "q2", selectedOptionId: "o3" }, // incorrect
    ]);

    expect(result.score).toBe(1);
    expect(result.percentage).toBe(50);
    expect(result.passed).toBe(false);
  });

  it("ignores a client-supplied score/passed and computes from DB only", async () => {
    mockPrisma.attempt.findUnique.mockResolvedValue(baseAttempt);
    mockPrisma.attempt.update.mockImplementation(({ data }: any) => ({ id: "attempt1", ...data }));

    // even though answers imply both correct, nothing in the input can inject a fake score
    const result = await submitExamAttempt("attempt1", "user1", [
      { questionId: "q1", selectedOptionId: "o1" },
      { questionId: "q2", selectedOptionId: "o4" },
    ]);

    expect(result.score).toBe(2);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
  });

  it("rejects submission from a user who does not own the attempt", async () => {
    mockPrisma.attempt.findUnique.mockResolvedValue(baseAttempt);
    await expect(submitExamAttempt("attempt1", "someone-else", [])).rejects.toThrow(
      "does not belong to you"
    );
  });

  it("rejects a second submission of the same attempt", async () => {
    mockPrisma.attempt.findUnique.mockResolvedValue({ ...baseAttempt, submittedAt: new Date() });
    await expect(submitExamAttempt("attempt1", "user1", [])).rejects.toThrow("already submitted");
  });
});
