import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Progress } from "@/components/ui/progress";
import { LessonList } from "./lesson-list";
import { calculateCourseProgress } from "@/services/courses";

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: { orderBy: { displayOrder: "asc" }, include: { lessons: { orderBy: { displayOrder: "asc" } } } },
    },
  });
  if (!course) notFound();
  if (!course.published && session.user.role !== "ADMIN") notFound();

  const progress = await calculateCourseProgress(course.id, session.user.id);
  const completed = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, completed: true, lesson: { module: { courseId: course.id } } },
    select: { lessonId: true },
  });
  const completedIds = new Set(completed.map((c) => c.lessonId));

  return (
    <div className="max-w-3xl">
      <PageHeader title={course.title} description={course.description} />

      <div className="mb-6">
        <div className="mb-1 flex justify-between text-sm">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <LessonList modules={course.modules} completedIds={[...completedIds]} />
    </div>
  );
}
