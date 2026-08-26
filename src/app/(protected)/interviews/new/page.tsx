import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { ScheduleForm } from "./schedule-form";

export default async function NewInterviewPage() {
  const [applications, staff] = await Promise.all([
    prisma.application.findMany({
      where: { stage: { in: ["SCREENING", "INTERVIEW"] } },
      include: { candidate: true, job: true },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.user.findMany({ where: { role: { in: ["ADMIN", "RECRUITER"] } } }),
  ]);

  return (
    <div className="max-w-xl">
      <PageHeader title="Schedule interview" />
      <ScheduleForm applications={applications} interviewers={staff} />
    </div>
  );
}
