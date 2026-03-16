# ProshnoBank

A lightweight, open-source online exam platform built with React, TypeScript, Vite and Supabase. ProshnoBank provides tools for creating and taking timed exams, managing question banks, live exam sessions, leaderboards, and an admin/teacher interface.

**Project Summary**

- **Purpose:** Provide schools, tutors, and learners a simple web-based system to host practice and live exams, manage question banks, and view performance analytics.
- **Core features:** question bank management, exam setup, live exam taking, auto-timed sessions, leaderboards, admin/teacher dashboards, and user authentication.
- **Tech stack:** React + TypeScript, Vite, Tailwind CSS, Supabase (auth, database, serverless functions), Vitest for tests.

**Key Pages & Components**

- `Index` / Landing page with features and hero section
- `Login` / `Register` / `Profile` pages for user authentication
- `ExamSetup`, `ExamBatches`, `ExamDetails`, `ExamTake` for full exam lifecycle
- `QuestionBank`, `QuestionList`, `QuestionForm` for question management
- `AdminPanel`, `TeacherDashboard` for privileged user flows

**Getting Started (Development)**

Prerequisites:

- Node.js (v16+ recommended) or Bun
- A Supabase project with API keys (for local development create a .env file and set env vars as shown below)

Install dependencies:

```
npm install
```

Run the dev server:

```
npm run dev
```

Build for production:

```
npm run build
```

Run tests:

```
npm run test
```

Environment variables (create a `.env` file in project root):

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key
- Any other secrets referenced in `supabase/config.toml` or `src/integrations/supabase/client.ts`

**Project Structure (high level)**

- `src/components` — UI and page components
- `src/pages` — route pages (Admin, Dashboard, Exams, Auth, etc.)
- `src/integrations/supabase` — Supabase client + types
- `src/lib` — API helpers and utilities
- `supabase/functions` — serverless edge functions for backend logic

**Contributing**

See `CONTRIBUTING.md` for setup, workflow, and PR guidelines.

**License**

This project is licensed under the MIT License — see the `LICENSE` file for details.

**Where to look next**

- API helpers: `src/lib/api.ts`
- Supabase integration: `src/integrations/supabase/client.ts`
- Admin & question management: `src/components/admin` and `src/pages/QuestionBank.tsx`
- Exam taking flow: `src/pages/ExamTake.tsx` and related components
