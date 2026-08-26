import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { CourseBuilder } from "./course-builder";

export default async function CourseManagePage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: { orderBy: { displayOrder: "asc" }, include: { lessons: { orderBy: { displayOrder: "asc" } } } },
    },
  });
  if (!course) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader title={`Manage: ${course.title}`} description="Build out modules and lessons." />
      <CourseBuilder course={course} />
    </div>
  );
}
