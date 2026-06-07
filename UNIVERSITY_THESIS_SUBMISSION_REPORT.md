# ProshnoBank
## University Thesis Submission Report (Verified A to Z System Analysis)

Date: 19 April 2026  
Project Type: Capstone/Thesis Project  
Department: CSE/ICT (Customize as needed)

---

## Title Page Template

Project Title: ProshnoBank - A Bangla-First Multi-Role Online Assessment Platform  
Student Name: ______________________________  
Student ID: ______________________________  
Program: ______________________________  
Department: ______________________________  
University: ______________________________  
Supervisor: ______________________________  
Co-Supervisor: ______________________________

---

## Declaration

I declare that this thesis project report titled ProshnoBank is my own work prepared under proper academic supervision. All external references are acknowledged in the references section.

Signature: ______________________________  
Date: ______________________________

---

## Abstract

ProshnoBank is a Bangla-first web platform for exam practice, question management, and role-based assessment operations. The system serves three primary roles: students, teachers, and administrators. It provides question bank browsing, custom exam setup, timed exam participation, attempt analytics, leaderboard ranking, teacher-led content workflows, and admin-level governance.

The frontend is implemented with React, TypeScript, and Vite. Backend services are built on Supabase, including PostgreSQL, Auth, Storage, Edge Functions, and Row Level Security (RLS). The architecture supports modular route segmentation, secure role checks, and migration-driven schema evolution.

Repository-level verification confirms functional implementation of major core modules across all roles, while a subset of teacher dashboard modules are currently visible as placeholders for future releases.

Keywords: Online Exam System, Bangla EdTech, Role-Based Access Control, Supabase, React

---

## Table of Contents

0. Project Snapshot  
1. Introduction  
2. Problem Statement and Objectives  
3. Scope and Research Significance  
4. Methodology  
5. System Design and Architecture  
6. Role-Wise Feature Implementation  
7. API and Backend Function Analysis  
8. Database and Security Model  
9. Testing and Validation  
10. Results, Limitations, and Discussion  
11. Deployment and Budget Proposal  
12. Conclusion and Future Work  
13. References  
14. Appendices

---

## Project Snapshot

### Project Description

ProshnoBank is a Bangla-first, multi-role online assessment platform designed for exam preparation and managed digital evaluation. It combines student-facing exam practice workflows, teacher-facing content creation workflows, and admin-facing governance workflows in a single web application.

Core value of the project:
- One platform for question bank, timed exams, and performance tracking.
- Role-based operational control for teachers and administrators.
- Scalable backend architecture with policy-driven data security.

### Current Progress

Current status: Advanced pre-production stage (core workflow complete, hardening ongoing).

Completed modules:
- Student flow: exam setup, exam participation, result summary, dashboard, leaderboard, profile.
- Teacher core flow: question creation, template builder, live exam scheduling, paper upload.
- Admin governance: users/roles, templates, live events, categories, subjects, batches, settings.
- Backend domains: questions, exams, leaderboard, admin, enrollments edge functions.
- Database evolution: migration-driven schema with RLS-enabled role policies.

In progress:
- Monitoring/observability improvements.
- Broader integration and role-sensitive automated tests.
- Performance hardening for high-concurrency exam windows.

Partially available (UI placeholder, full implementation pending):
- Teacher ready-question suggestions.
- Advanced teacher reports.
- OMR-related modules.
- Institution/subscription and communication views.

### Technology

Frontend:
- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS + shadcn/ui + Radix UI

Backend and data:
- Supabase Edge Functions (Deno runtime)
- PostgreSQL (Supabase)
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)

Quality and tooling:
- Vitest
- ESLint
- TypeScript compile-time checks

### Future Implementation Roadmap

Short-term (0-3 months):
- Complete teacher placeholder modules.
- Strengthen test coverage for role- and policy-critical paths.
- Add centralized logging and alerting.

Mid-term (3-6 months):
- Integrate payment/subscription lifecycle.
- Expand analytics dashboards and downloadable reports.
- Improve live exam scalability and operational runbooks.

Long-term (6+ months):
- AI-assisted personalized practice recommendations.
- Mobile application support.
- Proctoring and exam integrity enhancements.
- Institutional integration and partner onboarding features.

---

## Chapter 1: Introduction

### 1.1 Background

Exam-focused learners in Bangladesh often rely on fragmented resources and inconsistent evaluation tools. Digital preparation quality improves when learning content, assessment, and progress analytics are unified.

### 1.2 Project Overview

ProshnoBank is a role-based assessment system with:
- Student practice and exam workflows.
- Teacher content and scheduling workflows.
- Admin governance and system operations.

---

## Chapter 2: Problem Statement and Objectives

### 2.1 Problem Statement

Existing preparation ecosystems commonly face:
- Distributed and unstructured practice materials.
- Limited realistic timed exam simulation.
- Weak progress feedback mechanisms.
- Lack of secure multi-role governance.

### 2.2 Aim

To design and implement a secure, scalable, and practical Bangla-first digital assessment platform supporting student, teacher, and admin workflows.

### 2.3 Specific Objectives

1. Implement role-aware authentication and authorization.
2. Build searchable question-bank services.
3. Enable custom and template-driven timed exams.
4. Provide attempt history and performance stats.
5. Deliver leaderboard and live exam capabilities.
6. Establish teacher and admin operational toolsets.
7. Ensure secure access via RLS and policy controls.

---

## Chapter 3: Scope and Research Significance

### 3.1 In-Scope

- Student modules: setup, exam, result, dashboard, profile.
- Teacher modules: question creation, template creation, scheduling, paper upload.
- Admin modules: users/roles, templates, events, categories, subjects, batches, analytics.
- Edge-function based backend APIs.
- RLS-protected PostgreSQL schema and storage policies.

### 3.2 Out-of-Scope (Current Phase)

- Native mobile applications.
- Payment gateway integration.
- AI adaptive recommendation engine.
- Full proctoring/anti-cheat pipeline.

### 3.3 Significance

The project demonstrates an end-to-end, production-style implementation for role-based digital assessment in a Bangla-first context.

---

## Chapter 4: Methodology

### 4.1 Development Method

An iterative engineering process was used:
1. Requirement analysis by role.
2. Route and domain architecture design.
3. Migration-first schema implementation.
4. Module-by-module incremental implementation.
5. Testing, linting, and build validation.
6. Post-implementation verification and documentation.

### 4.2 Verification Basis

This report is based on direct inspection of routes, pages, teacher/admin dashboard logic, API client functions, edge-function handlers, and migrations.

---

## Chapter 5: System Design and Architecture

### 5.1 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui, Radix |
| Routing | React Router |
| State/Data Fetch | TanStack Query |
| Backend API | Supabase Edge Functions |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Security | RLS + role checks |
| Testing | Vitest |

### 5.2 Route and Role Guards

- ProtectedRoute: authenticated access.
- StudentRoute: redirects teacher/admin-role users away from student dashboard.
- TeacherRoute: allows admin/moderator/teacher roles.
- AdminRoute: checks auth plus admin eligibility via settings/roles/email config.

---

## Chapter 6: Role-Wise Feature Implementation

### 6.1 Student/User (Implemented)

- Public pages: home, category views, question bank, legal pages.
- PDF library browse by category.
- Exam setup: subject/topic/difficulty/count/duration/marking/negative marking.
- Exam taking: timer, progress, flagging, answer navigation, submission.
- Result summary and scoring display.
- Dashboard stats and recent attempts.
- Leaderboard with period filters.
- Live exams page with status labels.
- Profile update, password update, avatar upload.
- Batch details with enrollment action.

### 6.2 Teacher

Implemented:
- Teacher login/register.
- Question creation and own-question management.
- Template builder from selected questions.
- PDF print/export of selected questions.
- Live exam scheduling.
- Teacher paper upload and signed URL download.

Placeholder in UI:
- Ready questions.
- Reports.
- Share.
- Students.
- Institution/subscription.
- OMR modules.
- Contact/feedback.

### 6.3 Admin (Implemented)

- Secure admin login and admin route guard.
- Admin workspace tabs: overview, analytics, questions, templates, events, categories, subjects, batches, users/settings.
- Role assignment and removal.
- Restrict/suspend controls.
- Admin/moderator account creation.
- Configurable admin access role through app settings.

---

## Chapter 7: API and Backend Function Analysis

Questions function:
- list, groups, mine, get by id, create, update, delete.

Exams function:
- live, details, catalog, generate, generate_template, attempts, attempt, stats, submit.

Leaderboard function:
- rankings, stats.

Admin function:
- stats, users, role, restrict, suspend, create-user, templates CRUD, live-exams CRUD, subjects.

Enrollments function:
- enroll action with batch checks.

---

## Chapter 8: Database and Security Model

Core modules:
- question_bank, exam_attempts, user_roles, exam_templates, live_exam_events.

Teacher and content modules:
- teacher_papers, proshnobank_pdfs.

Admin and catalog modules:
- exam_categories, subjects, exam_batches, app_settings.

Enrollment module:
- exam_batch_enrollments.

Security:
- RLS enabled for major tables.
- Teacher ownership policies for own content.
- Admin policies for governance operations.
- Storage policies for controlled upload/read/delete.

---

## Chapter 9: Testing and Validation

Current practices:
- TypeScript compile-time checks.
- ESLint linting.
- Vitest baseline tests.
- Build command for release verification.

Recommended enhancements:
1. Role-sensitive integration test expansion.
2. RLS policy regression testing.
3. Load testing for exam/leaderboard peaks.

---

## Chapter 10: Results, Limitations, and Discussion

### 10.1 Outcomes

1. Multi-role assessment platform delivered.
2. Student exam lifecycle implemented end-to-end.
3. Teacher core content workflow implemented.
4. Admin governance suite implemented.
5. Secure access model established.

### 10.2 Limitations

- Several teacher modules remain placeholders.
- Payment/subscription is pending.
- Advanced analytics and adaptive learning are pending.

### 10.3 Discussion

The platform is beyond prototype stage and suitable for pilot deployment with operational hardening.

---

## Chapter 11: Deployment and Budget Proposal

Phases:
- Phase 1: hardening and observability.
- Phase 2: controlled pilot.
- Phase 3: scale and monetization.

Indicative budget:
- Lean 3-month launch hardening: BDT 8.5L to 13L.
- Scale-focused 3-4 month rollout: BDT 18L to 30L.
- Monthly infra/ops: BDT 25K to 120K.

---

## Chapter 12: Conclusion and Future Work

ProshnoBank is a verified, multi-role assessment system with strong architecture and practical deployment potential.

Future work:
1. Payment and subscription lifecycle.
2. Advanced reporting and analytics.
3. AI-assisted personalized recommendation.
4. Mobile clients.
5. Proctoring and integrity features.

---

## Chapter 13: References (IEEE Style)

[1] React Team, React Documentation, 2026.  
[2] TypeScript Team, TypeScript Handbook, 2026.  
[3] Vite Team, Vite Documentation, 2026.  
[4] Supabase, Supabase Documentation, 2026.  
[5] PostgreSQL Global Development Group, PostgreSQL Documentation, 2026.  
[6] TanStack, Query Documentation, 2026.  
[7] Vitest Team, Vitest Guide, 2026.  
[8] OWASP Foundation, OWASP Top 10, 2021.

---

## Chapter 14: Appendices

### Appendix A: Viva Questions

1. How does RLS enforce teacher-own content boundaries?
2. Why edge functions instead of direct frontend DB access?
3. How does admin access role fallback work?
4. What are peak traffic risks and mitigation?
5. Which modules are complete and which are placeholders?

### Appendix B: Suggested Figures

- High-level architecture diagram.
- Role and route guard flow.
- ER diagram.
- Exam submission and scoring sequence.
- Deployment pipeline.
