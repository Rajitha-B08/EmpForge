import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default async function CoursesPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const courses = await prisma.course.findMany({
    where: isAdmin ? {} : { published: true },
    include: { modules: { include: { lessons: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Browse available training."
        actions={
          isAdmin ? (
            <Link href="/courses/new">
              <Button>New course</Button>
            </Link>
          ) : undefined
        }
      />

      {courses.length === 0 ? (
        <EmptyState title="No courses yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const lessonCount = c.modules.reduce((sum, m) => sum + m.lessons.length, 0);
            return (
              <Link key={c.id} href={isAdmin ? `/courses/${c.id}/manage` : `/courses/${c.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/30">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {c.title}
                      {isAdmin && <StatusBadge status={c.published ? "PUBLISHED" : "DRAFT"} />}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{c.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {c.modules.length} modules · {lessonCount} lessons
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
