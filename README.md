# LMS

A learning management system built with Next.js, Prisma, and PostgreSQL. Students browse courses, enroll, read lessons, track progress, and take quizzes. Instructors create and manage courses, lessons, and quizzes.

This project is built to maximize learning and produce production-quality software — see `MISSION.md` for the teaching goals and `TEACHING-NOTES.md` for accumulated lessons.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** (theme in CSS, no `tailwind.config.*`)
- **Prisma 7** ORM + **PostgreSQL** (driver adapter `@prisma/adapter-pg`)
- **Auth.js v5** (email/password, Credentials provider) + `bcryptjs`
- **Zod** for input validation, **react-markdown** for lesson content

## Package manager

Use **pnpm**. Never npm/yarn.

```bash
pnpm install
```

`postinstall` runs `prisma generate` automatically.

## Getting started

1. Install dependencies: `pnpm install`
2. Set up `.env` (see `.env.example` if you add one):
   - `DATABASE_URL` — PostgreSQL connection string
   - `AUTH_SECRET` — Auth.js signing secret
   - `AUTH_TRUST_HOST` — set `true` in dev
3. (Re)create the schema in your DB:
   ```bash
   pnpm exec prisma migrate dev
   ```
4. Run the dev server:
   ```bash
   pnpm dev
   ```
   Open http://localhost:3000

## Scripts

- `pnpm dev` — development server
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint (Next 16 removed `next lint`; do not use it)
- `pnpm exec tsc --noEmit` — type check (no dedicated script)
- `pnpm exec prisma migrate dev` — apply schema changes to the DB

## Project structure

```
app/                  # Routes (file-based routing)
  page.tsx            # Home / course catalog  (WIP)
  about/              # About page
  dashboard/          # Placeholder dashboard
components/           # React components (dashboard/ etc.)
lib/
  prisma.ts           # Shared Prisma client (singleton)
  actions/            # Server Actions (all mutations)
prisma/
  schema.prisma       # DB schema (single source of truth)
  migrations/         # Version-controlled DB changes
generated/prisma/     # Generated Prisma client (git-ignored)
types/                # Shared domain types + validation
```