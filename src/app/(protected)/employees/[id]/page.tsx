import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: { user: true, mentor: { include: { user: true } }, application: { include: { job: true } } },
  });
  if (!employee) notFound();

  return (
    <div className="max-w-xl">
      <PageHeader
        title={employee.user.name}
        description={employee.user.email}
        actions={<StatusBadge status={employee.status} />}
      />
      <Card>
        <CardHeader>
          <CardTitle>Onboarding details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p>Type: {employee.type === "INTERN" ? "Intern" : "Full-time"}</p>
          <p>Mentor: {employee.mentor?.user.name || "Unassigned"}</p>
          <p>Join date: {formatDate(employee.joinDate)}</p>
          {employee.type === "INTERN" && (
            <>
              <p>Internship start: {formatDate(employee.internStartDate)}</p>
              <p>Internship end: {formatDate(employee.internEndDate)}</p>
            </>
          )}
          {employee.application && <p>Hired for: {employee.application.job.title}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
