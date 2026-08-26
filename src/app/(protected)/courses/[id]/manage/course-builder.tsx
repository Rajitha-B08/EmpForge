"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";

type Lesson = { id: string; title: string; content: string | null; externalUrl: string | null };
type Module = { id: string; title: string; lessons: Lesson[] };
type Course = { id: string; title: string; published: boolean; modules: Module[] };

export function CourseBuilder({ course }: { course: Course }) {
  const router = useRouter();
  const { push } = useToast();
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [lessonForms, setLessonForms] = useState<Record<string, { title: string; content: string; externalUrl: string }>>({});

  async function togglePublish() {
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !course.published }),
    });
    if (!res.ok) return push("Failed to update", "destructive");
    push(course.published ? "Course unpublished" : "Course published");
    router.refresh();
  }

  async function addModule() {
    if (!newModuleTitle.trim()) return;
    const res = await fetch(`/api/courses/${course.id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModuleTitle, displayOrder: course.modules.length }),
    });
    if (!res.ok) return push("Failed to add module", "destructive");
    setNewModuleTitle("");
    push("Module added");
    router.refresh();
  }

  async function addLesson(moduleId: string) {
    const form = lessonForms[moduleId];
    if (!form?.title.trim()) return;
    const module = course.modules.find((m) => m.id === moduleId);
    const res = await fetch(`/api/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        externalUrl: form.externalUrl || undefined,
        displayOrder: module?.lessons.length ?? 0,
      }),
    });
    if (!res.ok) return push("Failed to add lesson", "destructive");
    setLessonForms((prev) => ({ ...prev, [moduleId]: { title: "", content: "", externalUrl: "" } }));
    push("Lesson added");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <StatusBadge status={course.published ? "PUBLISHED" : "DRAFT"} />
        <Button size="sm" variant="outline" onClick={togglePublish}>
          {course.published ? "Unpublish" : "Publish"}
        </Button>
      </div>

      {course.modules.map((module) => (
        <div key={module.id} className="rounded-lg border border-border p-4">
          <h3 className="mb-3 font-semibold">{module.title}</h3>

          <div className="mb-3 flex flex-col gap-2">
            {module.lessons.map((lesson) => (
              <div key={lesson.id} className="rounded-md bg-muted p-2 text-sm">
                {lesson.title}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 rounded-md border border-dashed border-border p-3">
            <Input
              placeholder="Lesson title"
              value={lessonForms[module.id]?.title ?? ""}
              onChange={(e) =>
                setLessonForms((prev) => ({
                  ...prev,
                  [module.id]: { ...prev[module.id], title: e.target.value, content: prev[module.id]?.content ?? "", externalUrl: prev[module.id]?.externalUrl ?? "" },
                }))
              }
            />
            <Textarea
              placeholder="Lesson content"
              value={lessonForms[module.id]?.content ?? ""}
              onChange={(e) =>
                setLessonForms((prev) => ({
                  ...prev,
                  [module.id]: { ...prev[module.id], content: e.target.value, title: prev[module.id]?.title ?? "", externalUrl: prev[module.id]?.externalUrl ?? "" },
                }))
              }
            />
            <Input
              placeholder="External link (optional)"
              value={lessonForms[module.id]?.externalUrl ?? ""}
              onChange={(e) =>
                setLessonForms((prev) => ({
                  ...prev,
                  [module.id]: { ...prev[module.id], externalUrl: e.target.value, title: prev[module.id]?.title ?? "", content: prev[module.id]?.content ?? "" },
                }))
              }
            />
            <Button size="sm" onClick={() => addLesson(module.id)}>
              Add lesson
            </Button>
          </div>
        </div>
      ))}

      <div className="flex gap-2 rounded-lg border border-dashed border-border p-4">
        <Input
          placeholder="New module title"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
        />
        <Button onClick={addModule}>Add module</Button>
      </div>
    </div>
  );
}
