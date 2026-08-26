"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";

type Option = { id: string; optionText: string };
type Question = { id: string; questionText: string; options: Option[] };

type Result = { score: number; percentage: number; passed: boolean };

export function TakeExamForm({ examId, questions }: { examId: string; questions: Question[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function submit() {
    if (Object.keys(answers).length < questions.length) {
      push("Answer every question before submitting", "destructive");
      return;
    }
    setSubmitting(true);

    // Start an attempt, then submit answers - scoring happens entirely server-side.
    const startRes = await fetch(`/api/exams/${examId}/attempts`, { method: "POST" });
    if (!startRes.ok) {
      setSubmitting(false);
      return push("Could not start attempt", "destructive");
    }
    const attempt = await startRes.json();

    const submitRes = await fetch(`/api/attempts/${attempt.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      }),
    });
    setSubmitting(false);

    if (!submitRes.ok) {
      return push("Could not submit exam", "destructive");
    }
    const data = await submitRes.json();
    setResult(data);
    router.refresh();
  }

  if (result) {
    return (
      <div className="rounded-lg border border-border p-6 text-center">
        <p className="mb-2 text-2xl font-bold">{result.percentage}%</p>
        <StatusBadge status={result.passed ? "PASSED" : "FAILED"} />
        <p className="mt-4 text-sm text-muted-foreground">Score: {result.score}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-lg border border-border p-4">
          <p className="mb-3 font-medium">
            {i + 1}. {q.questionText}
          </p>
          <div className="flex flex-col gap-2">
            {q.options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => selectOption(q.id, opt.id)}
                />
                {opt.optionText}
              </label>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={submit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit exam"}
      </Button>
    </div>
  );
}
