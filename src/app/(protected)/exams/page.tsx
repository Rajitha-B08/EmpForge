import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default async function ExamsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isAdmin = session.user.role === "ADMIN";

  const exams = await prisma.exam.findMany({
    where: isAdmin ? {} : { active: true },
    include: {
      course: true,
      _count: { select: { questions: true } },
      attempts: { where: isAdmin ? undefined : { userId: session.user.id } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Exams"
        actions={
          isAdmin ? (
            <Link href="/exams/new">
              <Button>New exam</Button>
            </Link>
          ) : undefined
        }
      />

      {exams.length === 0 ? (
        <EmptyState title="No exams yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const bestAttempt = exam.attempts
              .filter((a) => a.submittedAt)
              .sort((a, b) => b.percentage - a.percentage)[0];

            return (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {exam.title}
                    {!isAdmin && bestAttempt && (
                      <StatusBadge status={bestAttempt.passed ? "PASSED" : "FAILED"} />
                    )}
                  </CardTitle>
                  <CardDescription>{exam.course.title}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <p className="text-muted-foreground">
                    {exam._count.questions} questions · pass at {exam.passingPercentage}%
                  </p>
                  {isAdmin ? (
                    <Link href={`/exams/${exam.id}/manage`} className="text-primary hover:underline">
                      Manage questions
                    </Link>
                  ) : (
                    <Link href={`/exams/${exam.id}/take`}>
                      <Button size="sm">{bestAttempt ? "Retake exam" : "Take exam"}</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
