import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function InterviewsPage() {
  const interviews = await prisma.interview.findMany({
    include: { application: { include: { candidate: true, job: true } }, interviewer: true },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Interviews"
        description="Scheduled interviews across the pipeline."
        actions={
          <Link href="/interviews/new">
            <Button>Schedule interview</Button>
          </Link>
        }
      />
      {interviews.length === 0 ? (
        <EmptyState title="No interviews scheduled" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Date/time</TableHead>
              <TableHead>Interviewer</TableHead>
              <TableHead>Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((i) => (
              <TableRow key={i.id}>
                <TableCell>
                  <Link href={`/candidates/${i.application.candidate.id}`} className="hover:underline">
                    {i.application.candidate.name}
                  </Link>
                </TableCell>
                <TableCell>{i.application.job.title}</TableCell>
                <TableCell>{formatDateTime(i.scheduledAt)}</TableCell>
                <TableCell>{i.interviewer.name}</TableCell>
                <TableCell>{i.rating ? `${i.rating}/5` : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
