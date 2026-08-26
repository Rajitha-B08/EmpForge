"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { examSchema, type ExamInput } from "@/validations/exam";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { useToast } from "@/components/ui/toast";

type Course = { id: string; title: string };

export default function NewExamPage() {
  const router = useRouter();
  const { push } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then(setCourses);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExamInput>({
    resolver: zodResolver(examSchema),
    defaultValues: { passingPercentage: 60, active: true },
  });

  async function onSubmit(data: ExamInput) {
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return push("Failed to create exam", "destructive");
    const exam = await res.json();
    push("Exam created");
    router.push(`/exams/${exam.id}/manage`);
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="New exam" />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Label>Course</Label>
          <Select {...register("courseId")}>
            <option value="">Select a course...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          {errors.courseId && <p className="text-xs text-destructive">{errors.courseId.message}</p>}
        </div>
        <div>
          <Label>Title</Label>
          <Input {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...register("description")} />
        </div>
        <div>
          <Label>Passing percentage</Label>
          <Input type="number" min={1} max={100} {...register("passingPercentage")} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create exam"}
        </Button>
      </form>
    </div>
  );
}
