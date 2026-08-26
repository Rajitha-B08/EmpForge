import { prisma } from "@/lib/db";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({
    include: {
      applications: {
        include: { job: true },
        orderBy: { appliedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Candidates" description="Everyone who has applied to a role." />
      {candidates.length === 0 ? (
        <EmptyState title="No candidates yet" description="Candidates appear here once they apply to a job." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Latest job</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Applied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((c) => {
              const latest = c.applications[0];
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/candidates/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{latest?.job.title || "-"}</TableCell>
                  <TableCell>{latest ? <StatusBadge status={latest.stage} /> : "-"}</TableCell>
                  <TableCell>{formatDate(latest?.appliedAt || c.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
