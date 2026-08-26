# EmpForge

EmpForge is an internal employee-lifecycle platform: recruitment, intern onboarding,
courses & trainings, assignments & exams, badges, and an internal community feed —
all in one Next.js app backed by MySQL.

## Features

- **Recruitment** — job postings, a public application form with resume upload, a
  Kanban-style pipeline (Applied → Screening → Interview → Offer → Hired), interview
  scheduling and feedback.
- **Intern onboarding** — convert a hired candidate into an Employee/Intern record,
  assign a mentor, track roster status.
- **Courses & trainings** — course/module/lesson builder, publish/unpublish, lesson
  completion with live progress bars.
- **Assignments & exams** — assign courses to one or many people, an MCQ exam builder,
  and exam-taking with **server-side scoring only** (the client never sends a score).
- **Badges** — auto-awarded server-side when a linked exam is passed or course is
  completed, with duplicate-award prevention.
- **Community** — a simple internal feed with posts, likes (no duplicate likes), and
  comments (delete your own, or any as admin).
- Role-based access control (ADMIN / RECRUITER / EMPLOYEE / INTERN) enforced in every
  API route, not just hidden in the UI.

## Tech stack

- Next.js 14 (App Router) + TypeScript + React
- Tailwind CSS, hand-built shadcn-style UI primitives
- MySQL + Prisma ORM
- NextAuth (Auth.js) with credentials + bcrypt password hashing
- React Hook Form + Zod validation (client and server)
- Vitest for business-logic tests

## Requirements

- Node.js 20+
- A MySQL database (local, Docker, or a hosted instance like PlanetScale/Railway)

## Installation

```bash
npm install
cp .env.example .env
# edit .env with your DATABASE_URL and a random AUTH_SECRET
```

Generate a secret quickly with `openssl rand -base64 32`.

## Database setup

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

This creates all tables and seeds demo data (jobs, candidates, a course with modules
and lessons, an exam with questions, two badges, and a sample community post).

### Demo accounts (seeded, password: `password123`)

| Role      | Email                    |
|-----------|---------------------------|
| Admin     | admin@empforge.dev       |
| Recruiter | recruiter@empforge.dev   |
| Employee  | employee@empforge.dev    |
| Intern    | intern@empforge.dev      |

## Development

```bash
npm run dev
```

Visit `http://localhost:3000`. The homepage lists open jobs publicly; sign in at
`/login` to reach the dashboard.

## Testing

```bash
npm run test
```

Covers exam scoring (including that a client-supplied score/passed flag can never
override the server calculation), badge eligibility and duplicate-award prevention,
recruitment stage transitions, course progress calculation, and duplicate-like /
comment-ownership rules.

## Production build

```bash
npm run build
npm run start
```

Before shipping, also run:

```bash
npm run lint
npx tsc --noEmit
npx prisma validate
```

## Project structure

```
src/
  app/
    (auth)/login/          public login page
    (protected)/           everything behind auth: dashboard, jobs, candidates,
                            applications, interviews, employees, courses,
                            assignments, exams, badges, community
    careers/[id]/           public job application page
    api/                    route handlers, one folder per resource
  components/
    ui/                     button, input, table, dialog, toast, etc.
    layout/                 sidebar, navbar, page header
  lib/
    auth.ts                 NextAuth config
    db.ts                   Prisma client singleton
    permissions.ts          requireUser / requireRole guards used in every API route
    storage.ts               local file storage abstraction (swap for S3 later)
  services/                 business logic: recruitment, onboarding, courses,
                             exams, badges, community
  validations/               Zod schemas shared by forms and API routes
prisma/
  schema.prisma
  seed.ts
tests/                      Vitest specs for the services above
```

## Role permissions

- **ADMIN** — full access: users where applicable, jobs, candidates, employees,
  courses, assignments, exams, badges, reports, content moderation.
- **RECRUITER** — job postings, applications, pipeline, interviews, candidate
  conversion to employee/intern.
- **EMPLOYEE** — published courses, assigned training, exams, results, badges,
  community posting.
- **INTERN** — same learner-side access as Employee (assigned training, exams,
  results, badges, community).

Every write operation is re-checked server-side via `requireRole`/`requireUser` in
`src/lib/permissions.ts` — the sidebar hides links per role, but that's a UX nicety,
not the security boundary.

## Security notes

- Passwords are hashed with bcrypt; the hash is never sent to the client.
- Exam answer keys (`isCorrect`) are stripped before questions reach a learner
  (`sanitizeQuestionsForExamTaker`).
- Exam scores are always recomputed server-side from the database
  (`services/exams.ts` — `submitExamAttempt`), ignoring anything about score/pass
  status the client might send.
- Badges are awarded only through `checkBadgeEligibility`/`awardBadge`, called from
  server-side services after a real DB-verified event, with a unique constraint on
  `(badgeId, userId)` preventing duplicates.

## File uploads

Resumes are validated for type/size and saved via `src/lib/storage.ts`, which writes
to `public/uploads` locally. Swap the implementation in that one file for an S3/Blob
client to move to cloud storage — nothing else in the app needs to change.

## Deployment to Vercel

1. Push this repo to GitHub.
2. Create a MySQL database (PlanetScale, Railway, AWS RDS, etc.) and copy its
   connection string.
3. In the Vercel project settings, set the environment variables from `.env.example`
   (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` set to your deployed URL).
4. Vercel runs `npm install`, which triggers `prisma generate` via `postinstall`.
5. Run migrations against the production database once, from your machine or a
   one-off Vercel deployment hook:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed   # optional, for demo data
   ```
6. Set the build command to `npm run build` (Vercel's Next.js preset does this by
   default).

Local file storage (`public/uploads`) does not persist on Vercel's serverless
filesystem between deploys — swap `src/lib/storage.ts` for a cloud storage provider
before relying on resume uploads in production.
