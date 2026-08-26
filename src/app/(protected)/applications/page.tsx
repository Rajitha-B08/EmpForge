import { prisma } from "@/lib/db";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    include: { candidate: true, job: true },
    orderBy: { appliedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader title="Applications" description="All candidate applications across jobs." />
      {applications.length === 0 ? (
        <EmptyState title="No applications yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Applied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <Link href={`/candidates/${app.candidate.id}`} className="font-medium hover:underline">
                    {app.candidate.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{app.candidate.email}</p>
                </TableCell>
                <TableCell>
                  <Link href={`/jobs/${app.job.id}`} className="hover:underline">
                    {app.job.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge status={app.stage} />
                </TableCell>
                <TableCell>{formatDate(app.appliedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
