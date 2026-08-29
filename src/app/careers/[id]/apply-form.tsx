"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSubmitSchema, type ApplicationSubmitInput } from "@/validations/candidate";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ApplyForm({ jobId }: { jobId: string }) {
  const [resume, setResume] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationSubmitInput>({
    resolver: zodResolver(applicationSubmitSchema),
    defaultValues: { jobId },
  });

  async function onSubmit(data: ApplicationSubmitInput) {
    setError(null);
    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone ?? "");
    if (resume) formData.append("resume", resume);

    const res = await fetch("/api/applications", { method: "POST", body: formData });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return <p className="text-sm">Thanks for applying! We'll be in touch.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register("jobId")} value={jobId} />
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} />
      </div>
      <div>
        <Label htmlFor="resume">Resume (PDF or DOC, max 5MB)</Label>
        <input
          id="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResume(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit application"}
      </Button>
    </form>
  );
}
