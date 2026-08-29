import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireRole, permissionErrorResponse } from "@/lib/permissions";
import { courseSchema } from "@/validations/course";
import { calculateCourseProgress, markAssignmentStarted } from "@/services/courses";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { displayOrder: "asc" },
        include: { lessons: { orderBy: { displayOrder: "asc" } } },
      },
    },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (!course.published && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const progress = await calculateCourseProgress(params.id, user.id);
  if (user.role !== "ADMIN") {
    await markAssignmentStarted(params.id, user.id);
  }

  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId: user.id, completed: true, lesson: { module: { courseId: params.id } } },
    select: { lessonId: true },
  });

  return NextResponse.json({
    ...course,
    progress,
    completedLessonIds: completedLessons.map((l) => l.lessonId),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = courseSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const course = await prisma.course.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(course);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
