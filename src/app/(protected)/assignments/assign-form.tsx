"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

type Course = { id: string; title: string };
type UserOpt = { id: string; name: string };

export function AssignForm({ courses, users }: { courses: Course[]; users: UserOpt[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [courseId, setCourseId] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function toggleUser(id: string) {
    setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]));
  }

  async function submit() {
    if (!courseId || selectedUsers.length === 0) {
      push("Select a course and at least one person", "destructive");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, userIds: selectedUsers }),
    });
    setSubmitting(false);
    if (!res.ok) return push("Failed to assign course", "destructive");
    push("Course assigned");
    setSelectedUsers([]);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="mb-3 font-semibold">Assign a course</h3>
      <div className="mb-3">
        <Label>Course</Label>
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">Select a course...</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>
      <div className="mb-3">
        <Label>Assign to</Label>
        <div className="mt-1 flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border border-border p-2">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedUsers.includes(u.id)}
                onChange={() => toggleUser(u.id)}
              />
              {u.name}
            </label>
          ))}
        </div>
      </div>
      <Button onClick={submit} disabled={submitting}>
        {submitting ? "Assigning..." : "Assign"}
      </Button>
    </div>
  );
}
