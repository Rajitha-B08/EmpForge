"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Lesson = { id: string; title: string; content: string | null; externalUrl: string | null };
type Module = { id: string; title: string; lessons: Lesson[] };

export function LessonList({ modules, completedIds }: { modules: Module[]; completedIds: string[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [completed, setCompleted] = useState(new Set(completedIds));
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function markComplete(lessonId: string) {
    setLoadingId(lessonId);
    const res = await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" });
    setLoadingId(null);
    if (!res.ok) {
      push("Could not mark lesson complete", "destructive");
      return;
    }
    setCompleted((prev) => new Set(prev).add(lessonId));
    push("Lesson completed");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {modules.map((module) => (
        <div key={module.id}>
          <h3 className="mb-2 font-semibold">{module.title}</h3>
          <div className="flex flex-col gap-2">
            {module.lessons.map((lesson) => {
              const isDone = completed.has(lesson.id);
              return (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{lesson.title}</p>
                    {lesson.externalUrl && (
                      <a href={lesson.externalUrl} target="_blank" className="text-xs text-primary underline">
                        Open material
                      </a>
                    )}
                  </div>
                  {isDone ? (
                    <span className="text-xs font-medium text-green-700">Completed</span>
                  ) : (
                    <Button size="sm" disabled={loadingId === lesson.id} onClick={() => markComplete(lesson.id)}>
                      Mark complete
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
