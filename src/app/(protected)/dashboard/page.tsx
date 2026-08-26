import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

async function AdminDashboard() {
  const [employees, interns, openJobs, candidates, courses, pendingAssignments, attempts, badgesAwarded] =
    await Promise.all([
      prisma.employee.count({ where: { type: "FULL_TIME" } }),
      prisma.employee.count({ where: { type: "INTERN", status: "ACTIVE" } }),
      prisma.job.count({ where: { status: "OPEN" } }),
      prisma.candidate.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.assignment.count({ where: { status: { not: "COMPLETED" } } }),
      prisma.attempt.count(),
      prisma.userBadge.count(),
    ]);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Full-time employees" value={employees} />
      <StatCard label="Active interns" value={interns} />
      <StatCard label="Open jobs" value={openJobs} />
      <StatCard label="Total candidates" value={candidates} />
      <StatCard label="Published courses" value={courses} />
      <StatCard label="Pending assignments" value={pendingAssignments} />
      <StatCard label="Exam attempts" value={attempts} />
      <StatCard label="Badges awarded" value={badgesAwarded} />
    </div>
  );
}

async function RecruiterDashboard() {
  const [openJobs, newApplications, hired, upcomingInterviews] = await Promise.all([
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.application.count({ where: { stage: "APPLIED" } }),
    prisma.application.count({ where: { stage: "HIRED" } }),
    prisma.interview.count({ where: { scheduledAt: { gte: new Date() } } }),
  ]);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Open jobs" value={openJobs} />
      <StatCard label="New applications" value={newApplications} />
      <StatCard label="Hired this period" value={hired} />
      <StatCard label="Upcoming interviews" value={upcomingInterviews} />
    </div>
  );
}

async function LearnerDashboard(userId: string) {
  const [assigned, completedAssignments, attempts, badges] = await Promise.all([
    prisma.assignment.count({ where: { userId } }),
    prisma.assignment.count({ where: { userId, status: "COMPLETED" } }),
    prisma.attempt.count({ where: { userId, submittedAt: { not: null } } }),
    prisma.userBadge.count({ where: { userId } }),
  ]);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Assigned courses" value={assigned} />
      <StatCard label="Completed courses" value={completedAssignments} />
      <StatCard label="Exam attempts" value={attempts} />
      <StatCard label="Badges earned" value={badges} />
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { role, id, name } = session.user;

  return (
    <div>
      <PageHeader title={`Welcome back, ${name?.split(" ")[0]}`} description="Here's what's happening." />
      {role === "ADMIN" && <AdminDashboard />}
      {role === "RECRUITER" && <RecruiterDashboard />}
      {(role === "EMPLOYEE" || role === "INTERN") && (await LearnerDashboard(id))}
    </div>
  );
}
