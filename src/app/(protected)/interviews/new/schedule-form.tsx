"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { interviewSchema, type InterviewInput } from "@/validations/interview";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Application = { id: string; candidate: { name: string }; job: { title: string } };
type Interviewer = { id: string; name: string };

export function ScheduleForm({
  applications,
  interviewers,
}: {
  applications: Application[];
  interviewers: Interviewer[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InterviewInput>({ resolver: zodResolver(interviewSchema) });

  async function onSubmit(data: InterviewInput) {
    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      push("Could not schedule interview", "destructive");
      return;
    }
    push("Interview scheduled");
    router.push("/interviews");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label>Candidate / application</Label>
        <Select {...register("applicationId")}>
          <option value="">Select...</option>
          {applications.map((a) => (
            <option key={a.id} value={a.id}>
              {a.candidate.name} — {a.job.title}
            </option>
          ))}
        </Select>
        {errors.applicationId && <p className="text-xs text-destructive">{errors.applicationId.message}</p>}
      </div>
      <div>
        <Label>Interviewer</Label>
        <Select {...register("interviewerId")}>
          <option value="">Select...</option>
          {interviewers.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </Select>
        {errors.interviewerId && <p className="text-xs text-destructive">{errors.interviewerId.message}</p>}
      </div>
      <div>
        <Label>Date/time</Label>
        <Input type="datetime-local" {...register("scheduledAt")} />
        {errors.scheduledAt && <p className="text-xs text-destructive">{errors.scheduledAt.message}</p>}
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea {...register("notes")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Scheduling..." : "Schedule interview"}
      </Button>
    </form>
  );
}
