import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { QuestionBuilder } from "./question-builder";

export default async function ExamManagePage({ params }: { params: { id: string } }) {
  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { displayOrder: "asc" }, include: { options: true } } },
  });
  if (!exam) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title={`Manage: ${exam.title}`} description={`Passing score: ${exam.passingPercentage}%`} />
      <QuestionBuilder examId={exam.id} questions={exam.questions} />
    </div>
  );
}
