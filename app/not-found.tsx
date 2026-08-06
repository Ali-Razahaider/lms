import Link from "next/link";

/**
 * Custom 404 page (App Router `not-found.tsx`).
 *
 * Rendered in two cases:
 * 1. A Server Component calls `notFound()` (e.g. a missing course in
 *    `app/courses/[id]/page.tsx`).
 * 2. The URL doesn't match any route at all.
 *
 * Unlike the default Next.js 404, this keeps the app's visual style and
 * offers useful recovery links instead of a dead end.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* aria-hidden: the "404" is decorative — the h1 carries the meaning */}
        <p className="text-6xl font-semibold text-primary-soft" aria-hidden>
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Go home
          </Link>
          <Link
            href="/courses"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-5 text-sm font-medium transition-colors hover:bg-primary-soft"
          >
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  );
}