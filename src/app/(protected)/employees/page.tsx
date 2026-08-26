import { prisma } from "@/lib/db";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    include: { user: true, mentor: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Employees & interns" description="Full onboarding roster." />
      {employees.length === 0 ? (
        <EmptyState title="No employees yet" description="Convert a hired candidate to get started." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <Link href={`/employees/${e.id}`} className="font-medium hover:underline">
                    {e.user.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{e.user.email}</p>
                </TableCell>
                <TableCell>{e.type === "INTERN" ? "Intern" : "Full-time"}</TableCell>
                <TableCell>{e.mentor?.user.name || "-"}</TableCell>
                <TableCell>{formatDate(e.internStartDate || e.joinDate)}</TableCell>
                <TableCell>{formatDate(e.internEndDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={e.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
