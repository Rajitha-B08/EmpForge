# EmpForge

EmpForge is an internal employee-lifecycle platform that brings **recruitment, intern onboarding, courses and training, assignments, exams, badges, and an internal community feed** into a single Next.js application backed by MySQL.


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
```

## Role Permissions

### ADMIN

Full access to:

- Users
- Jobs
- Candidates
- Employees
- Courses
- Assignments
- Exams
- Badges
- Reports
- Community moderation

### RECRUITER

Can manage:

- Job postings
- Applications
- Candidate pipeline
- Interviews
- Candidate conversion to employee/intern

### EMPLOYEE

Can access:

- Published courses
- Assigned training
- Exams
- Results
- Badges
- Community

### INTERN

Can access:

- Assigned training
- Exams
- Results
- Badges
- Community

All protected write operations are re-validated on the server using the authorization utilities in:

```text
src/lib/permissions.ts
```

## Security

EmpForge implements several server-side security measures.

### Password Security

Passwords are hashed using bcrypt.

Plain-text passwords are never stored in the database or sent to the client.

### Server-Side Authorization

Role permissions are verified on the server for protected API operations.

The frontend only controls the user interface; it is not treated as the security boundary.

### Secure Exam Scoring

Exam scores are calculated on the server.

The client cannot override:

- Score
- Pass/fail status

The correct answers are never exposed to the learner.

### Exam Answer Protection

Answer keys are removed before exam questions are returned to the exam-taking interface.

### Duplicate Badge Prevention

Badges are awarded only after server-side eligibility checks.

A database uniqueness constraint on:

```text
(badgeId, userId)
```

prevents duplicate badge awards.

### Validation

User input is validated using Zod on both the client and server where applicable.


## File Uploads

Resume uploads are handled through:

```text
src/lib/storage.ts
```

The current implementation validates the uploaded file and stores it locally under:

```text
public/uploads
```

The storage abstraction is designed so that the implementation can later be replaced with a cloud storage provider such as Amazon S3 or another object-storage service.

## Future Improvements

Potential future improvements include:

- Cloud-based resume storage
- Email notifications for recruitment and interview scheduling
- Advanced analytics and recruitment reports
- Real-time community notifications
- Employee performance tracking
- Calendar integration for interviews
- More comprehensive automated testing
- CI/CD pipeline for automated testing and deployment

## Project Highlights

EmpForge demonstrates the implementation of:

- Full-stack development with Next.js
- REST-style API route handlers
- Role-based access control
- Authentication and authorization
- Relational database design
- Prisma ORM
- Server-side validation
- Secure exam evaluation
- Business-logic service layers
- File upload handling
- Automated testing with Vitest
- Production deployment considerations
