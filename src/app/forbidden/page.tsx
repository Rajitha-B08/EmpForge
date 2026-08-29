import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold">403 — Forbidden</h1>
      <p className="text-muted-foreground">You don't have permission to view this page.</p>
      <Link href="/dashboard" className="text-sm underline">
        Back to dashboard
      </Link>
    </main>
  );
}
