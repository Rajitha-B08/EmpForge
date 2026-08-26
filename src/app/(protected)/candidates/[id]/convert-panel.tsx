"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { convertToEmployeeSchema, type ConvertToEmployeeInput } from "@/validations/employee";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Mentor = { id: string; user: { name: string } };

export function ConvertPanel({ applicationId, mentors }: { applicationId: string; mentors: Mentor[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConvertToEmployeeInput>({
    resolver: zodResolver(convertToEmployeeSchema),
    defaultValues: { applicationId, type: "FULL_TIME" },
  });

  async function onSubmit(data: ConvertToEmployeeInput) {
    const res = await fetch(`/api/employees/${applicationId}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      push(body.error || "Conversion failed", "destructive");
      return;
    }
    push("Converted to employee/intern");
    router.refresh();
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Convert to Employee/Intern
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-md border border-border p-3">
      <div>
        <Label>Type</Label>
        <Select {...register("type")}>
          <option value="FULL_TIME">Full-time</option>
          <option value="INTERN">Intern</option>
        </Select>
      </div>
      <div>
        <Label>Mentor</Label>
        <Select {...register("mentorId")}>
          <option value="">None</option>
          {mentors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.user.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Join date</Label>
        <Input type="date" {...register("joinDate")} />
        {errors.joinDate && <p className="text-xs text-destructive">{errors.joinDate.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Internship start</Label>
          <Input type="date" {...register("internStartDate")} />
        </div>
        <div>
          <Label>Internship end</Label>
          <Input type="date" {...register("internEndDate")} />
        </div>
      </div>
      <div>
        <Label>Temporary password</Label>
        <Input type="text" {...register("password")} placeholder="At least 8 characters" />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Converting..." : "Confirm conversion"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
