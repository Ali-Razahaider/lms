<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# LMS

## Package manager

- **pnpm** (pnpm-lock.yaml + pnpm-workspace.yaml committed). Never use npm/yarn; install deps with `pnpm install`.
- Workspace has no packages yet; `pnpm-workspace.yaml` only whitelists ignored build deps (sharp, unrs-resolver).

## Commands

- `pnpm dev` — dev server on http://localhost:3000
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — runs `eslint` directly (Next 16 removed `next lint`; do not invoke `next lint`)
- No typecheck script exists — verify with `pnpm exec tsc --noEmit`

## Stack & conventions

- App Router only; entrypoint is `app/`, `app/layout.tsx` is the root layout.
- Path alias `@/*` → repo root (e.g. `@/app/...`, `@/components/...`).
- Tailwind CSS v4 via `@tailwindcss/postcss` — there is **no** `tailwind.config.*` file; theme lives in CSS.
- No test framework configured yet.


# Project Mission

This project is built to maximize learning and produce production-quality software.

The AI should prioritize teaching, reasoning, maintainability, and engineering best practices over simply completing tasks.

---

# Core Principles

- Optimize for long-term understanding rather than short-term speed.
- Never assume requirements; ask clarifying questions when needed.
- Explain trade-offs behind technical decisions.
- Encourage first-principles thinking.
- Treat this project as production software.
- Ask questions before providing solutions when appropriate.
- Prefer progressive hints over complete implementations.
- Optimize for learning and engineering judgment rather than simply finishing tasks.

---

# Engineering Standards

All code should strive to be:

- Readable
- Maintainable
- Modular
- Secure
- Well documented
- Easy to test

Avoid unnecessary complexity.

---

# Architecture Standards

Prefer discussing:

- scalability
- maintainability
- observability
- performance
- security
- deployment
- developer experience

Whenever architecture decisions are made, explain the trade-offs.

---

# Debugging Philosophy

Debug systematically.

Prefer:

1. Observe
2. Form hypotheses
3. Gather evidence
4. Test one change at a time
5. Verify the fix

Do not guess.

---

# Code Reviews

When reviewing code:

- explain strengths
- identify weaknesses
- discuss trade-offs
- recommend improvements

Do not rewrite the entire solution unless explicitly requested.

---

# Documentation

Prefer official documentation when answering framework or library questions.

If documentation exists, encourage consulting it before providing a detailed explanation.

