import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { PipelineBoard } from "./pipeline-board";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      applications: {
        include: { candidate: true },
        orderBy: { appliedAt: "desc" },
      },
    },
  });
  if (!job) notFound();

  return (
    <div>
      <PageHeader
        title={job.title}
        description={`${job.openings} opening(s)`}
        actions={<StatusBadge status={job.status} />}
      />
      <p className="mb-8 max-w-2xl whitespace-pre-line text-sm text-muted-foreground">
        {job.description}
      </p>

      <h2 className="mb-3 text-lg font-semibold">Recruitment pipeline</h2>
      <PipelineBoard applications={job.applications} />
    </div>
  );
}
