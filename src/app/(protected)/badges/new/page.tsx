"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { badgeSchema, type BadgeInput } from "@/validations/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { useToast } from "@/components/ui/toast";

type Course = { id: string; title: string };
type Exam = { id: string; title: string };

export default function NewBadgePage() {
  const router = useRouter();
  const { push } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json()).then(setCourses);
    fetch("/api/exams").then((r) => r.json()).then(setExams);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BadgeInput>({ resolver: zodResolver(badgeSchema), defaultValues: { icon: "award", active: true } });

  async function onSubmit(data: BadgeInput) {
    const res = await fetch("/api/badges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return push("Failed to create badge", "destructive");
    push("Badge created");
    router.push("/badges");
    router.refresh();
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="New badge" description="Badges are auto-awarded when their criteria is met." />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Label>Name</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...register("description")} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
        <div>
          <Label>Award when this exam is passed</Label>
          <Select onChange={(e) => setValue("criteria", e.target.value ? `exam:${e.target.value}` : "")}>
            <option value="">None</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Or when this course is completed</Label>
          <Select onChange={(e) => setValue("criteria", e.target.value ? `course:${e.target.value}` : "")}>
            <option value="">None</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          {errors.criteria && <p className="text-xs text-destructive">{errors.criteria.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create badge"}
        </Button>
      </form>
    </div>
  );
}
