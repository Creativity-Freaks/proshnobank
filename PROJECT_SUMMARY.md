# ProshnoBank — Project Summary

ProshnoBank is a web-based exam and practice platform designed for Bangla-first learners and educators. It combines a modern React UI with Supabase (Auth + Postgres + Edge Functions) to deliver question-bank management, exam generation, timed exam-taking, attempt history, and leaderboards.

## At a Glance

| Category | Details |
|---|---|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui + Radix |
| Data & Auth | Supabase (Postgres, Auth, RLS policies) |
| Backend API | Supabase Edge Functions: `questions`, `exams`, `leaderboard` |
| State/Fetching | TanStack Query (`@tanstack/react-query`) |
| Testing | Vitest |

## Product Scope

### Core Features

- **Question Bank**: store MCQ questions with subject, topic, difficulty, options, correct answer, explanation.
- **Exam Generation**: generate a randomized set of questions filtered by subject(s), topic, and difficulty.
- **Exam Taking**: timed exam UI, answer selection, progress bar, flagged questions, scoring with optional negative marking.
- **Attempts & Stats**: save attempts, view history, per-user performance stats (accuracy, avg score, study time).
- **Leaderboard**: rankings by time period and subject, plus global stats.
- **Role-based Admin**: admin-only CRUD for questions using role checks (`user_roles`).

### Primary User Flows

- **Learner**: Register/Login → choose category/subjects → start exam → submit → results → history/stats → leaderboard.
- **Admin/Teacher**: Login → question bank CRUD → manage exam content quality.

## Frontend Architecture

### Entry + Providers

- App entry is [src/main.tsx](src/main.tsx)
- Global providers are configured in [src/App.tsx](src/App.tsx):
  - `QueryClientProvider` (TanStack Query)
  - `AuthProvider` (Supabase auth state)
  - UI providers: tooltip + toaster

### Routing (high level)

Routes are declared in [src/App.tsx](src/App.tsx):

- **Auth**: `/login`, `/register`, `/forgot-password`, `/reset-password`
- **User**: `/dashboard`, `/profile`
- **Exams**: `/exam/setup`, `/exam/:id`, `/exam/:id/take`, `/batches`, `/live-exams`
- **Leaderboard**: `/leaderboard`
- **Question bank**: `/question-bank`
- **Categories**: `/category/ssc`, `/category/hsc`, `/category/medical`, `/category/engineering`, `/category/university`, `/category/job`
- **Admin**: `/admin`

## Backend (Supabase Edge Functions)

All frontend API calls are funneled through [src/lib/api.ts](src/lib/api.ts), which talks to Supabase Edge Functions under `/functions/v1/*`.

### Questions API (`/functions/v1/questions`)

- `GET` list/search questions (supports `subject`, `topic`, `difficulty`, `search`, `limit`, `offset`)
- `GET ?id=...` fetch a single question
- `POST`, `PUT`, `DELETE` are **admin-only**, validated via `user_roles`

Implementation: [supabase/functions/questions/index.ts](supabase/functions/questions/index.ts)

### Exams API (`/functions/v1/exams`)

- `GET ?action=generate` returns randomized questions (supports `subjects` CSV, `subject`, `topic`, `difficulty`, `count`)
- `GET ?action=attempts` lists current user’s attempts
- `GET ?action=attempt&id=...` fetches a single attempt
- `GET ?action=stats` computes user stats
- `POST` submits an attempt

Implementation: [supabase/functions/exams/index.ts](supabase/functions/exams/index.ts)

### Leaderboard API (`/functions/v1/leaderboard`)

- `GET ?action=rankings&period=...&subject=...&limit=...` aggregates attempts into rankings
- `GET ?action=stats` returns global aggregates

Implementation: [supabase/functions/leaderboard/index.ts](supabase/functions/leaderboard/index.ts)

## Database Model (Supabase Postgres)

Defined in SQL migrations under [supabase/migrations](supabase/migrations).

### Tables

- `question_bank`
  - `subject`, `topic`, `difficulty` (`difficulty_level` enum), `question_text`, `options` (jsonb), `correct_answer`, `explanation`
- `exam_attempts`
  - belongs to `auth.users` via `user_id`
  - scoring fields (`score`, `max_score`, correct/wrong/skipped)
  - metadata fields (`duration_minutes`, `time_taken_seconds`, negative marking)
  - `answers` (jsonb)
- `user_roles`
  - connects `auth.users` to `app_role` enum (`admin`, `moderator`, `user`)

### Security (RLS)

- `question_bank`
  - authenticated users can **read**
  - admins can **create/update/delete**
- `exam_attempts`
  - authenticated users can only access **their own** attempts
- `user_roles`
  - users can view their own roles
  - admins can view/manage all roles (via `has_role()` security definer function)

## Configuration

### Environment variables

The API client in [src/lib/api.ts](src/lib/api.ts) expects:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Note: The generated Supabase client in [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts) currently contains generated constants (URL + anon key). For production-quality setups, it’s common to switch that to `import.meta.env` as well.

## Developer Experience

Common scripts (see `package.json`):

```bash
npm run dev
npm run build
npm run lint
npm run test
```

Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)

## Credits / Contact

- Website: https://hcsarker.me
- GitHub: https://github.com/hcsarker
