# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive learning platform for an Information Security Testing (Pengujian Keamanan Informasi) university course at Universitas Bina Insani. Built with Google AI Studio and uses the Gemini API. Content is in Indonesian (Bahasa Indonesia).

## Commands

- `npm install` — install dependencies
- `npm run dev` — start dev server on port 3000
- `npm run build` — production build via Vite
- `npm run lint` — type-check with `tsc --noEmit`
- `npm run clean` — remove `dist/`

## Environment

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`. The key is injected at build time via `vite.config.ts` as `process.env.GEMINI_API_KEY`.

## Architecture

**Stack:** React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router v7, Motion (Framer Motion), Lucide icons.

**Routing & Auth:**
- `src/main.tsx` — entry point, wraps app in `BrowserRouter`
- `src/App.tsx` — defines routes with `ProtectedRoute` wrapper that redirects unauthenticated users to `/login`
- `src/context/AuthContext.tsx` — auth state via React Context + localStorage (`student_session` key). Login requires student ID + webcam photo capture. Login history stored in `login_history` localStorage key.

**Pages:**
- `src/pages/Login.tsx` — student ID input + webcam photo capture (uses `react-webcam`), requires camera permission
- `src/pages/Home.tsx` — course overview with module grid
- `src/pages/ModuleDetail.tsx` — tabbed view (Theory, Lab Exercise, Case Study, Quiz) for each module, found by URL param `/module/:id`

**Components:**
- `src/components/Layout.tsx` — sidebar navigation + responsive mobile menu
- `src/components/Quiz.tsx` — handles both multiple-choice (auto-graded) and essay (shows reference answer) question types

**Data:**
- `src/data/syllabus.tsx` — single large file containing all course content (modules, theory, labs, case studies, quizzes). This is the primary content file. Module type interfaces (`Module`, `QuizQuestion`, `LabStep`, etc.) are defined here.

## Key Patterns

- Path alias `@/` maps to the project root (configured in both `vite.config.ts` and `tsconfig.json`)
- Tailwind v4 uses the Vite plugin (`@tailwindcss/vite`), imported via `@import "tailwindcss"` in `index.css`
- Animations use `motion/react` (not `framer-motion`) — the `motion` package
- `clsx` + `tailwind-merge` for conditional class composition
- No test framework is configured
- No backend — all state is client-side via localStorage
- `metadata.json` declares camera permission for AI Studio hosting
