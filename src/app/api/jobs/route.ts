import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";
import { jobSchema } from "@/validations/job";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("q");

  const jobs = await prisma.job.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      // MySQL's default collation is already case-insensitive, so no `mode` option here
      // (unlike the Postgres provider, which needs it explicitly).
      ...(search ? { title: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const job = await prisma.job.create({ data: parsed.data });
  return NextResponse.json(job, { status: 201 });
}
