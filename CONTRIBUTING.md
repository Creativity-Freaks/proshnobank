# Contributing to ProshnoBank

Thanks for contributing! This project is a React + TypeScript (Vite) app with Supabase.

## Quick Start

### 1) Install

Using npm:

```bash
npm install --no-package-lock
```

Or using Bun (recommended if you use the included `bun.lockb`):

```bash
bun install
```

### 2) Environment variables

Create a `.env` file in the project root:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If you don’t have a Supabase project yet, create one first and copy the URL + anon key.

### 3) Run locally

```bash
npm run dev
```

## Development Workflow

### Branch naming

- Features: `feat/short-description`
- Fixes: `fix/short-description`
- Chores: `chore/short-description`

### Code style

- Keep changes small and focused.
- Follow existing patterns for components, hooks, and Tailwind classes.
- Prefer TypeScript-safe changes (avoid `any` unless unavoidable).

### Testing

Run unit tests:

```bash
npm run test
```

Run lint (if you changed code):

```bash
npm run lint
```

## Pull Requests

When opening a PR:

- Explain **what** changed and **why**.
- Include screenshots/GIFs for UI changes.
- Confirm tests pass.
- Mention any Supabase migration/function changes.

## Supabase Notes

- Edge functions live under `supabase/functions`.
- Migrations live under `supabase/migrations`.

If your change requires a schema update, add a migration and describe how to apply it in the PR.
