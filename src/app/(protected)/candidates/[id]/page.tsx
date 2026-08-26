import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ConvertPanel } from "./convert-panel";

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: params.id },
    include: {
      applications: {
        include: {
          job: true,
          interviews: { include: { interviewer: true }, orderBy: { scheduledAt: "asc" } },
          employee: true,
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });
  if (!candidate) notFound();

  const mentors = await prisma.employee.findMany({ include: { user: true } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={candidate.name} description={candidate.email} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Candidate info</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p>Email: {candidate.email}</p>
            <p>Phone: {candidate.phone || "-"}</p>
            {candidate.resumeUrl && (
              <a href={candidate.resumeUrl} target="_blank" className="text-primary underline">
                View resume
              </a>
            )}
          </CardContent>
        </Card>

        {candidate.applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {app.job.title}
                <StatusBadge status={app.stage} />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <p className="text-muted-foreground">Applied {formatDate(app.appliedAt)}</p>
              {app.feedback && <p>Feedback: {app.feedback}</p>}

              {app.interviews.length > 0 && (
                <div>
                  <p className="mb-1 font-medium">Interviews</p>
                  <ul className="flex flex-col gap-1">
                    {app.interviews.map((i) => (
                      <li key={i.id} className="rounded-md bg-muted p-2">
                        <p>{formatDateTime(i.scheduledAt)} with {i.interviewer.name}</p>
                        {i.rating && <p>Rating: {i.rating}/5</p>}
                        {i.notes && <p className="text-muted-foreground">{i.notes}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {app.stage === "HIRED" && !app.employee && (
                <ConvertPanel applicationId={app.id} mentors={mentors} />
              )}
              {app.employee && (
                <p className="text-sm text-green-700">
                  Converted to {app.employee.type === "INTERN" ? "intern" : "employee"} on{" "}
                  {formatDate(app.employee.joinDate)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
