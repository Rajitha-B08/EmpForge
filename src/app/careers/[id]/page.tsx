import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ApplyForm } from "./apply-form";

export default async function CareerJobPage({ params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job || job.status !== "OPEN") notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="mt-2 whitespace-pre-line text-muted-foreground">{job.description}</p>

      <div className="mt-10 rounded-lg border border-border p-6">
        <h2 className="mb-4 text-lg font-semibold">Apply for this role</h2>
        <ApplyForm jobId={job.id} />
      </div>
    </main>
  );
}
