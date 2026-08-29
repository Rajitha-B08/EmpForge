import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const openJobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">EmpForge</h1>
        <Link href="/login" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
          Sign in
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Open positions</h2>
        <p className="mt-1 text-muted-foreground">Browse and apply to open roles.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {openJobs.length === 0 && (
          <p className="text-sm text-muted-foreground">No open positions right now.</p>
        )}
        {openJobs.map((job) => (
          <Link
            key={job.id}
            href={`/careers/${job.id}`}
            className="rounded-lg border border-border p-5 transition-colors hover:bg-muted/40"
          >
            <h3 className="font-semibold">{job.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">{job.openings} opening(s)</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
