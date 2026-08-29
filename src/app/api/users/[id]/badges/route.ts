import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, permissionErrorResponse, ForbiddenError } from "@/lib/permissions";

// Users can see their own badges; admins can see anyone's.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
    if (user.id !== params.id && user.role !== "ADMIN") throw new ForbiddenError();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const badges = await prisma.userBadge.findMany({
    where: { userId: params.id },
    include: { badge: true },
    orderBy: { awardedAt: "desc" },
  });

  return NextResponse.json(badges);
}
