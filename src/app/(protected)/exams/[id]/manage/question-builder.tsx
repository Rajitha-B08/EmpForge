"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type Option = { id: string; optionText: string; isCorrect: boolean };
type Question = { id: string; questionText: string; marks: number; options: Option[] };

export function QuestionBuilder({ examId, questions }: { examId: string; questions: Question[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  function updateOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  async function submit() {
    const cleanOptions = options.filter((o) => o.trim());
    if (!questionText.trim() || cleanOptions.length < 2) {
      push("Add a question and at least two options", "destructive");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/exams/${examId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionText,
        marks,
        displayOrder: questions.length,
        options: cleanOptions.map((text, i) => ({ optionText: text, isCorrect: i === correctIndex })),
      }),
    });
    setSubmitting(false);
    if (!res.ok) return push("Failed to add question", "destructive");
    setQuestionText("");
    setOptions(["", ""]);
    setCorrectIndex(0);
    push("Question added");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-lg border border-border p-4">
          <p className="mb-2 font-medium">
            {i + 1}. {q.questionText} <span className="text-xs text-muted-foreground">({q.marks} marks)</span>
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {q.options.map((o) => (
              <li key={o.id} className={o.isCorrect ? "font-medium text-green-700" : ""}>
                {o.isCorrect ? "✓ " : "· "}
                {o.optionText}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="rounded-lg border border-dashed border-border p-4">
        <h3 className="mb-3 font-semibold">Add question</h3>
        <Input
          placeholder="Question text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="mb-2"
        />
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm">Marks</label>
          <Input
            type="number"
            min={1}
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
            className="w-20"
          />
        </div>

        <div className="mb-3 flex flex-col gap-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
              />
              <Input
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            Add option
          </Button>
          <Button type="button" size="sm" onClick={submit} disabled={submitting}>
            {submitting ? "Adding..." : "Add question"}
          </Button>
        </div>
      </div>
    </div>
  );
}
