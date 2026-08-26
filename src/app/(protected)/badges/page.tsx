import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function BadgesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    const badges = await prisma.badge.findMany({
      include: { _count: { select: { userBadges: true } } },
      orderBy: { createdAt: "desc" },
    });
    return (
      <div>
        <PageHeader
          title="Badges"
          actions={
            <Link href="/badges/new">
              <Button>New badge</Button>
            </Link>
          }
        />
        {badges.length === 0 ? (
          <EmptyState title="No badges yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((b) => (
              <Card key={b.id}>
                <CardHeader>
                  <CardTitle>{b.name}</CardTitle>
                  <CardDescription>{b.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Criteria: {b.criteria} · Awarded {b._count.userBadges} times
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const userBadges = await prisma.userBadge.findMany({
    where: { userId: session.user.id },
    include: { badge: true },
    orderBy: { awardedAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="My badges" />
      {userBadges.length === 0 ? (
        <EmptyState title="No badges earned yet" description="Complete courses and pass exams to earn badges." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userBadges.map((ub) => (
            <Card key={ub.id} className="border-t-4 border-t-accent-gold">
              <CardHeader>
                <CardTitle>{ub.badge.name}</CardTitle>
                <CardDescription>{ub.badge.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Awarded {formatDate(ub.awardedAt)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
