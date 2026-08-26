import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applicationSubmitSchema } from "@/validations/candidate";
import { saveFile, FileValidationError } from "@/lib/storage";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";

// Public endpoint - anyone can apply to an open job.
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const parsed = applicationSubmitSchema.safeParse({
    jobId: formData.get("jobId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!job || job.status !== "OPEN") {
    return NextResponse.json({ error: "This job is not accepting applications" }, { status: 400 });
  }

  let resumeUrl: string | undefined;
  const resumeFile = formData.get("resume");
  if (resumeFile instanceof File && resumeFile.size > 0) {
    try {
      resumeUrl = await saveFile(resumeFile, "resumes");
    } catch (err) {
      if (err instanceof FileValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  }

  const candidate = await prisma.candidate.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      resumeUrl,
    },
  });

  const application = await prisma.application.create({
    data: {
      candidateId: candidate.id,
      jobId: job.id,
      stage: "APPLIED",
    },
  });

  return NextResponse.json(application, { status: 201 });
}

// Recruiter/Admin listing with search + filter + pagination
export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");
  const jobId = searchParams.get("jobId");
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 20;

  const where = {
    ...(stage ? { stage: stage as any } : {}),
    ...(jobId ? { jobId } : {}),
  };

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: { candidate: true, job: true },
      orderBy: { appliedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.application.count({ where }),
  ]);

  return NextResponse.json({ applications, total, page, pageSize });
}
