# EmpForge

EmpForge is an internal employee-lifecycle platform that brings **recruitment, intern onboarding, courses and training, assignments, exams, badges, and an internal community feed** into a single Next.js application backed by MySQL.

---

## Features

### Recruitment

- Create and manage job postings.
- Public job application form with resume upload.
- Track candidates through a Kanban-style recruitment pipeline:
  - Applied
  - Screening
  - Interview
  - Offer
  - Hired
- Schedule interviews.
- Record interview feedback.
- Convert hired candidates into employees or interns.

### Intern & Employee Onboarding

- Convert hired candidates into Employee/Intern records.
- Assign mentors.
- Track employee and intern roster status.
- Role-based access to employee functionality.

### Courses & Training

- Create courses, modules, and lessons.
- Publish or unpublish courses.
- Assign training to employees or interns.
- Track lesson completion.
- Display live course progress.

### Assignments & Exams

- Assign courses to one or multiple users.
- Create MCQ-based exams.
- Allow employees and interns to take assigned exams.
- Calculate exam scores securely on the server.
- Prevent clients from manipulating scores or pass/fail status.

### Badges

- Automatically award badges when users:
  - Pass a linked exam.
  - Complete a required course.
- Prevent duplicate badge awards using server-side validation and database constraints.

### Community

- Internal community feed.
- Create posts.
- Like posts.
- Prevent duplicate likes.
- Add comments.
- Users can delete their own comments.
- Administrators can moderate comments.

### Role-Based Access Control

The application supports four roles:

- **ADMIN**
- **RECRUITER**
- **EMPLOYEE**
- **INTERN**

Permissions are enforced on the server for every protected API operation.

The UI hides unauthorized features for a better user experience, but the actual security boundary is enforced through server-side authorization.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | Full-stack web framework |
| React | Frontend UI |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| Prisma ORM | Database access |
| MySQL | Relational database |
| NextAuth / Auth.js | Authentication |
| bcrypt | Password hashing |
| React Hook Form | Form management |
| Zod | Client and server validation |
| Vitest | Business-logic testing |

---

## Architecture

```text
                    ┌─────────────────────┐
                    │       Users         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Next.js / React   │
                    │     App Router      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     API Routes      │
                    │     & Handlers      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Validation &        │
                    │ Authorization       │
                    │ Zod / Auth.js       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Service Layer    │
                    │   Business Logic    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Prisma ORM      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │        MySQL        │
                    └─────────────────────┘
