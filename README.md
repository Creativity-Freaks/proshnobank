<!-- markdownlint-disable MD033 MD041 MD010 MD034 -->
<div align="center">

<!-- Animated title (SVG, GitHub-safe) -->
<svg width="720" height="70" viewBox="0 0 720 70" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ProshnoBank">
	<defs>
		<linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
			<stop offset="0%" stop-color="#3b82f6" />
			<stop offset="100%" stop-color="#8b5cf6" />
		</linearGradient>
	</defs>
	<text x="50%" y="48" text-anchor="middle" font-size="44" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" fill="url(#g)">
		ProshnoBank
		<animate attributeName="opacity" values="0.92;1;0.92" dur="2.8s" repeatCount="indefinite" />
	</text>
</svg>

<p>
	SaaS-ready online exam & practice platform (Bangla-first) — question bank, timed exams, attempt history, and leaderboard.
</p>

<p>
	<a href="PROJECT_SUMMARY.md">Project Summary</a> ·
	<a href="CONTRIBUTING.md">Contributing</a> ·
	<a href="LICENSE">License</a> ·
	<a href="https://hcsarker.me">hcsarker.me</a> ·
	<a href="https://github.com/hcsarker">GitHub</a>
</p>

</div>

---

## What is ProshnoBank?

ProshnoBank is a modern web app that helps students practice with exam-style MCQs and helps admins/teachers manage question content. It uses a React + TypeScript frontend and Supabase (Auth + Postgres + Edge Functions) as the backend.

## Feature Cards

<table>
	<tr>
		<td width="33%" valign="top">
			<h3>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-3px; margin-right:6px">
					<path d="M4 19.5V6.5C4 5.12 5.12 4 6.5 4H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<path d="M8 4H17.5C18.88 4 20 5.12 20 6.5V19.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<path d="M8 20H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
				Question Bank
			</h3>
			<p>MCQ storage by subject/topic/difficulty with options, answer index, and explanation.</p>
		</td>
		<td width="33%" valign="top">
			<h3>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-3px; margin-right:6px">
					<path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z" stroke="currentColor" stroke-width="2"/>
				</svg>
				Timed Exams
			</h3>
			<p>Real exam UX: timer, progress, navigation, flagged questions, and scoring (incl. negative marking).</p>
		</td>
		<td width="33%" valign="top">
			<h3>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-3px; margin-right:6px">
					<path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<path d="M7 15L10 12L13 14L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				Attempts & Leaderboard
			</h3>
			<p>Persist attempts + stats and generate rankings by period/subject.</p>
		</td>
	</tr>
</table>

## Key Modules

- Frontend routing: `src/App.tsx`
- Auth context: `src/contexts/AuthContext.tsx`
- API client (Edge Functions): `src/lib/api.ts`
- Supabase functions: `supabase/functions/*`
- DB migrations: `supabase/migrations/*`

## Quick Start (Local)

```bash
npm install
npm run dev
```

Create `.env` in the project root:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Docs

- Technical overview: `PROJECT_SUMMARY.md`
- Contribution guide: `CONTRIBUTING.md`
- License: `LICENSE`

## Author / Contact

- Website: [hcsarker.me](https://hcsarker.me)
- GitHub: [https://github.com/hcsarker](https://github.com/hcsarker)

## License

MIT — see `LICENSE`.
