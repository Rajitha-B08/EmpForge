import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: { name: "Ava Admin", email: "admin@empforge.dev", passwordHash, role: "ADMIN" },
  });
  const recruiter = await prisma.user.create({
    data: { name: "Raj Recruiter", email: "recruiter@empforge.dev", passwordHash, role: "RECRUITER" },
  });
  const employeeUser = await prisma.user.create({
    data: { name: "Emma Employee", email: "employee@empforge.dev", passwordHash, role: "EMPLOYEE" },
  });
  const internUser = await prisma.user.create({
    data: { name: "Ian Intern", email: "intern@empforge.dev", passwordHash, role: "INTERN" },
  });

  const mentorEmployee = await prisma.employee.create({
    data: { userId: employeeUser.id, type: "FULL_TIME", status: "ACTIVE", joinDate: new Date("2023-01-15") },
  });
  await prisma.employee.create({
    data: {
      userId: internUser.id,
      type: "INTERN",
      status: "ACTIVE",
      mentorId: mentorEmployee.id,
      joinDate: new Date("2024-06-01"),
      internStartDate: new Date("2024-06-01"),
      internEndDate: new Date("2024-12-01"),
    },
  });

  const job1 = await prisma.job.create({
    data: {
      title: "Frontend Engineer",
      description: "Build delightful UI with React and TypeScript.",
      status: "OPEN",
      openings: 2,
    },
  });
  const job2 = await prisma.job.create({
    data: {
      title: "Backend Engineer Intern",
      description: "Work on our Node.js APIs over the summer.",
      status: "OPEN",
      openings: 3,
    },
  });
  await prisma.job.create({
    data: { title: "Product Designer", description: "Own the design system.", status: "DRAFT", openings: 1 },
  });

  const candidate1 = await prisma.candidate.create({
    data: { name: "Carlos Gomez", email: "carlos@example.com", phone: "555-0101" },
  });
  const candidate2 = await prisma.candidate.create({
    data: { name: "Priya Shah", email: "priya@example.com", phone: "555-0102" },
  });
  const candidate3 = await prisma.candidate.create({
    data: { name: "Wei Zhang", email: "wei@example.com", phone: "555-0103" },
  });

  const app1 = await prisma.application.create({
    data: { candidateId: candidate1.id, jobId: job1.id, stage: "INTERVIEW" },
  });
  await prisma.application.create({
    data: { candidateId: candidate2.id, jobId: job1.id, stage: "SCREENING" },
  });
  const app3 = await prisma.application.create({
    data: { candidateId: candidate3.id, jobId: job2.id, stage: "HIRED", feedback: "Great technical interview." },
  });

  await prisma.interview.create({
    data: {
      applicationId: app1.id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      interviewerId: recruiter.id,
      notes: "Focus on React fundamentals",
    },
  });

  // course + modules + lessons
  const course = await prisma.course.create({
    data: { title: "Onboarding Essentials", description: "Everything new hires need to know.", published: true },
  });
  const module1 = await prisma.courseModule.create({
    data: { courseId: course.id, title: "Company Basics", displayOrder: 0 },
  });
  const module2 = await prisma.courseModule.create({
    data: { courseId: course.id, title: "Engineering Practices", displayOrder: 1 },
  });
  const lesson1 = await prisma.lesson.create({
    data: { moduleId: module1.id, title: "Welcome to EmpForge", content: "Company mission and values.", displayOrder: 0 },
  });
  await prisma.lesson.create({
    data: { moduleId: module1.id, title: "Tools & Access", content: "Setting up your accounts.", displayOrder: 1 },
  });
  await prisma.lesson.create({
    data: { moduleId: module2.id, title: "Code Review Guidelines", content: "How we review PRs.", displayOrder: 0 },
  });

  await prisma.course.create({
    data: { title: "Advanced TypeScript", description: "Deep dive into TS generics and types.", published: true },
  });

  // exam
  const exam = await prisma.exam.create({
    data: { courseId: course.id, title: "Onboarding Quiz", passingPercentage: 70, active: true },
  });
  const q1 = await prisma.question.create({
    data: { examId: exam.id, questionText: "What does EmpForge primarily manage?", marks: 1, displayOrder: 0 },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: q1.id, optionText: "Employee lifecycle", isCorrect: true },
      { questionId: q1.id, optionText: "Grocery inventory", isCorrect: false },
      { questionId: q1.id, optionText: "Weather forecasts", isCorrect: false },
    ],
  });
  const q2 = await prisma.question.create({
    data: { examId: exam.id, questionText: "Who reviews your pull requests?", marks: 1, displayOrder: 1 },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: q2.id, optionText: "Teammates via code review", isCorrect: true },
      { questionId: q2.id, optionText: "Nobody", isCorrect: false },
    ],
  });

  // badges tied to the course/exam above
  await prisma.badge.create({
    data: {
      name: "Onboarding Champion",
      description: "Completed the Onboarding Essentials course.",
      criteria: `course:${course.id}`,
      icon: "graduation-cap",
    },
  });
  await prisma.badge.create({
    data: {
      name: "Quiz Whiz",
      description: "Passed the Onboarding Quiz.",
      criteria: `exam:${exam.id}`,
      icon: "award",
    },
  });

  // assignments
  await prisma.assignment.create({ data: { courseId: course.id, userId: employeeUser.id } });
  await prisma.assignment.create({ data: { courseId: course.id, userId: internUser.id } });

  // sample community post
  const post = await prisma.post.create({
    data: { authorId: employeeUser.id, body: "Excited to kick off the new onboarding course! 🎉" },
  });
  await prisma.comment.create({
    data: { postId: post.id, authorId: internUser.id, body: "Looking forward to it!" },
  });
  await prisma.like.create({ data: { postId: post.id, userId: internUser.id } });
  await prisma.like.create({ data: { postId: post.id, userId: admin.id } });

  console.log("Seed complete.");
  console.log("Demo logins (password: password123):");
  console.log("  admin@empforge.dev, recruiter@empforge.dev, employee@empforge.dev, intern@empforge.dev");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
