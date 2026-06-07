# ProshnoBank
## Professional Project Proposal and Technical Report (Verified Implementation Edition)

Version: 2.0  
Date: 19 April 2026  
Prepared For: Product stakeholders, academic reviewers, and deployment partners

---

## 1. Executive Summary

ProshnoBank is a Bangla-first online assessment platform for exam preparation and managed assessment delivery. It combines student practice workflows, teacher content operations, and admin governance in one system. The application is implemented with React + TypeScript on the frontend and Supabase (Auth, PostgreSQL, Storage, Edge Functions, and RLS) on the backend.

This edition of the document is based on direct code and migration verification and includes:
- Role-wise A to Z feature inventory (User, Teacher, Admin).
- Verified backend function/action list.
- Implemented vs placeholder module status.
- Updated technical and deployment roadmap.

---

## 2. Project Proposal

### 2.1 Business Problem

Target learners in SSC, HSC, admission, and job preparation often struggle with fragmented content, irregular exam simulation, and weak performance feedback. Institutions and coaching providers also lack a role-governed system for content quality control and exam operations.

### 2.2 Proposed Product

ProshnoBank provides:
- Structured question bank with filters (subject, topic, difficulty, search).
- Custom and template-based timed exams.
- Attempt history, score computation, and progress statistics.
- Public leaderboard and live exam event discovery.
- Teacher workflow for question creation, template creation, scheduling, and paper upload.
- Admin operations for templates, events, categories, subjects, batches, user roles, and access control.

### 2.3 Vision

Build a scalable, secure, Bangla-first digital assessment ecosystem for learners and institutions, with clear role separation and measurable learning outcomes.

### 2.4 Verified Scope (Current Phase)

In scope:
- Multi-role auth and route guards.
- Student dashboard, profile, exam setup/take/results, leaderboard, live exams.
- Teacher dashboard with active content operations.
- Admin dashboard with extended management modules.
- Edge-function API layer for exam domains and administration.
- Migration-driven database and RLS security.

Out of scope (current phase):
- Native mobile apps.
- Integrated payment gateway.
- AI adaptive recommendation engine.
- Online proctoring/anti-cheat automation.

### 2.5 Role-Wise Feature Matrix (Verified)

#### User/Student
Implemented:
- Public pages: home, question bank, category exam pages, batches, legal pages.
- PDF library browse by category (`ssc`, `hsc`, `admission`, `chakri`).
- Exam setup with subject/topic selection, difficulty, question count, duration, marking and optional negative marking.
- Exam take UI: timer, progress, answer selection, flagging, question navigator, submit dialog, result summary.
- Exam details page from templates.
- Dashboard: recent attempts, aggregate accuracy, subject-wise progress.
- Leaderboard: period filters (`weekly`, `monthly`, `all`) and global stats.
- Live exams page with status badge (`upcoming`, `starting-soon`, `live`) and join flow.
- Profile update: metadata, password, avatar upload.
- Batch details and enrollment flow via enrollment function.

#### Teacher
Implemented:
- Teacher registration and login routes.
- Question creation and own-question listing/search.
- Question set/template builder from selected questions.
- PDF print/export from selected questions.
- Live exam scheduling from created templates.
- Teacher paper upload to secure storage and signed URL download.
- Teacher dashboard stats (question count, templates, events, uploads).

Visible but currently placeholder (`ComingSoonPanel`):
- Ready questions/suggestions.
- Detailed reports.
- Share utilities.
- Student management.
- Institution/subscription pages.
- OMR tools.
- Contact/feedback panels.

#### Admin
Implemented:
- Admin login with configured admin email and role-based guard.
- Admin workspace with tabs:
  - overview
  - analytics
  - questions
  - templates
  - live events
  - categories
  - subjects
  - batches
  - users/settings
- User role assignment and role removal.
- User restrict/suspend operations.
- Admin/moderator user creation.
- App setting: configurable `admin_access_role`.

### 2.6 Functional API Inventory

#### Edge Function: questions
- GET list/default with filters.
- GET groups (`action=groups`).
- GET mine (`action=mine`, teacher/admin only).
- GET by `id`.
- POST create question.
- PUT update question.
- DELETE question.

#### Edge Function: exams
- GET `action=live` (public).
- GET `action=details` (public).
- GET `action=catalog` (public).
- GET `action=generate` (auth required).
- GET `action=generate_template` (auth required).
- GET `action=attempts` (auth required).
- GET `action=attempt` (auth required).
- GET `action=stats` (auth required).
- POST submit attempt (auth required).

#### Edge Function: leaderboard
- GET `action=rankings`.
- GET `action=stats`.

#### Edge Function: admin
- GET `action=stats`.
- GET `action=users`.
- PUT `action=role`.
- PUT `action=restrict`.
- PUT `action=suspend`.
- POST `action=create-user`.
- CRUD `action=templates`.
- CRUD `action=live-exams`.
- GET `action=subjects`.

#### Edge Function: enrollments
- POST with payload `action=enroll` + `batch_id`.

### 2.7 Architecture and Security

Frontend:
- React 18 + TypeScript + Vite.
- React Router with shell-based segmentation.
- TanStack Query for async state.
- Tailwind + shadcn/radix component system.

Backend:
- Supabase Auth + PostgreSQL + Storage + Edge Functions.
- Service-role function layer for protected operations.
- Rate limiting in public/high-traffic functions.

Access control:
- Route guards: `ProtectedRoute`, `StudentRoute`, `TeacherRoute`, `AdminRoute`.
- Role checks from `user_roles` and `app_settings`.
- RLS policy enforcement in core tables.

### 2.8 Database Modules (Migration-Verified)

Core and exam:
- `question_bank`, `exam_attempts`, `exam_templates`, `live_exam_events`.

Role and settings:
- `user_roles` (includes `teacher` role in enum), `app_settings`.

Admin expansion:
- `exam_categories`, `subjects`, `exam_batches`.

Enrollment and content library:
- `exam_batch_enrollments`, `proshnobank_pdfs`, `teacher_papers`.

Storage buckets:
- `proshnobank-pdfs`, `teacher-papers`, plus profile avatar usage.

### 2.9 Delivery Status and Roadmap

Completed:
- Multi-role routing and authentication.
- Exam generation/attempt/statistics flows.
- Leaderboard and live event display.
- Teacher content operations (core set).
- Admin extended modules and governance actions.

In progress / hardening:
- Observability depth.
- Integration test expansion.
- Type-sync discipline after DB migrations.

Planned:
- Payment and subscription monetization.
- Advanced analytics and teacher reporting.
- Mobile extensions and institutional integrations.

### 2.10 Indicative Budget and Team Model

Lean launch hardening (3 months):
- 1 full-stack engineer, 1 part-time frontend, 1 part-time QA, 1 part-time ops.
- Estimated BDT 8.5L to 13L.

Scale-ready release (3-4 months):
- 2 full-stack engineers, 1 frontend, 1 QA, 1 part-time DevOps, 1 PM.
- Estimated BDT 18L to 30L.

Monthly ops estimate:
- Managed backend, storage, monitoring, support operations.
- Estimated BDT 25K to 120K.

### 2.11 Risks and Mitigation

1. Role/access misconfiguration.
- Mitigation: RLS test matrix and admin policy audits.

2. Peak exam traffic pressure.
- Mitigation: load testing, query optimization, staged rollout.

3. Content quality variance.
- Mitigation: moderation workflow and review checklist.

4. Schema drift and type mismatch.
- Mitigation: migration + generated-type refresh in release checklist.

5. Operational maturity gap.
- Mitigation: logging, alerting, incident runbook.

### 2.12 KPI Set

- Monthly active learners.
- Exam completion rate.
- Repeat attempt rate.
- Accuracy improvement trend.
- Teacher content publishing throughput.
- Admin response and moderation turnaround.
- API success rate and latency.

---

## 3. Technical Project Report (Current Verified State)

### 3.1 Codebase Snapshot

- Frontend modules are route-driven with dedicated shells.
- API calls are centralized in `src/lib/api.ts` and admin libraries.
- Database schema is migration-managed under `supabase/migrations`.
- Functions are domain segmented under `supabase/functions`.

### 3.2 Routing and Role Behavior

- Public, auth, student, teacher, and admin flows are segregated.
- Student route redirects teacher/admin-role users away from student dashboard.
- Teacher route allows `admin`, `moderator`, and `teacher` roles.
- Admin route validates auth + admin eligibility from settings/roles/email configuration.

### 3.3 Feature Status by Operational Readiness

Production-ready user flows:
- Question practice, exam taking, attempt persistence, leaderboard, profile operations.

Production-ready teacher flows:
- Question CRUD (own records), template creation, live exam scheduling, paper upload/download.

Production-ready admin flows:
- Content governance, user and role operations, category/subject/batch management.

UI-present but non-operational teacher blocks:
- Reporting, OMR, student/institution/share/contact/feedback modules.

### 3.4 Data and Policy Readiness

- RLS enabled in major content, exam, role, and settings tables.
- Teacher ownership model enforced in question/template/event/paper policies.
- Enrollment model enforces batch status and seat checks.
- App setting allows configurable admin access role.

### 3.5 Engineering Quality

- TypeScript-based typed frontend.
- Lint/test/build scripts configured.
- Domain API separation for maintainability.
- Migration-first schema evolution and rollback-friendly process.

### 3.6 Gaps and Action Items

1. Expand automated integration coverage for role-bound actions.
2. Add centralized operational telemetry and alerts.
3. Formalize schema-type synchronization process after migrations.
4. Finalize monetization stack (payment + entitlement lifecycle).
5. Convert teacher placeholder modules into deliverable features.

### 3.7 90-Day Execution Plan

Days 1-30:
- Security audit (RLS, route guards, admin actions).
- Test coverage uplift for exam and role-critical journeys.
- Production logging and alert baseline.

Days 31-60:
- Performance/load tests for live and leaderboard endpoints.
- Teacher dashboard enhancement priorities.
- Admin analytics quality and export support.

Days 61-90:
- Pilot rollout with controlled cohorts.
- KPI review and optimization iteration.
- Commercial readiness decision and release gate.

### 3.8 Technical Report Conclusion

ProshnoBank is in an advanced pre-production state with substantial role-based capabilities already implemented across user, teacher, and admin layers. The core architecture is scalable and security-conscious. The primary next requirement is operational hardening and feature-completion of currently marked placeholder teacher modules.

---

## 4. Appendix

### 4.1 Notes on Verification

This report is derived from direct inspection of application routes, frontend modules, API client actions, edge function handlers, and migration files in the repository.

### 4.2 Planning Disclaimer

Budget and timeline are indicative and should be finalized after resource confirmation, hosting tier selection, and pilot scope agreement.
