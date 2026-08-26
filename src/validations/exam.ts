import { z } from "zod";

export const examSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(3, "Title is too short"),
  description: z.string().optional(),
  passingPercentage: z.coerce.number().int().min(1).max(100).default(60),
  active: z.boolean().default(true),
});
export type ExamInput = z.infer<typeof examSchema>;

export const questionOptionSchema = z.object({
  optionText: z.string().min(1, "Option text required"),
  isCorrect: z.boolean().default(false),
});

export const questionSchema = z.object({
  questionText: z.string().min(3, "Question text required"),
  marks: z.coerce.number().int().min(1).default(1),
  displayOrder: z.coerce.number().int().min(0).default(0),
  options: z
    .array(questionOptionSchema)
    .min(2, "At least two options required")
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: "Exactly one option must be marked correct",
    }),
});
export type QuestionInput = z.infer<typeof questionSchema>;

export const submitExamSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionId: z.string().min(1),
    })
  ),
});
export type SubmitExamInput = z.infer<typeof submitExamSchema>;
