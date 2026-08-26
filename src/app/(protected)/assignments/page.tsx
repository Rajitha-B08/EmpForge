import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { AssignForm } from "./assign-form";

export default async function AssignmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isAdmin = session.user.role === "ADMIN";

  const assignments = await prisma.assignment.findMany({
    where: isAdmin ? {} : { userId: session.user.id },
    include: { course: true, user: true },
    orderBy: { assignedAt: "desc" },
  });

  let courses, users;
  if (isAdmin) {
    [courses, users] = await Promise.all([
      prisma.course.findMany({ where: { published: true } }),
      prisma.user.findMany({ where: { role: { in: ["EMPLOYEE", "INTERN"] } } }),
    ]);
  }

  return (
    <div>
      <PageHeader title={isAdmin ? "Training assignments" : "My Training"} />

      {isAdmin && courses && users && (
        <div className="mb-8">
          <AssignForm courses={courses} users={users} />
        </div>
      )}

      {assignments.length === 0 ? (
        <EmptyState title="No training assigned yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>Employee</TableHead>}
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a) => (
              <TableRow key={a.id}>
                {isAdmin && <TableCell>{a.user.name}</TableCell>}
                <TableCell>
                  <Link href={`/courses/${a.course.id}`} className="hover:underline">
                    {a.course.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge status={a.status} />
                </TableCell>
                <TableCell>{formatDate(a.assignedAt)}</TableCell>
                <TableCell>{formatDate(a.completionDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
