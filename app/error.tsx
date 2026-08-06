"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Custom runtime error boundary (`error.tsx`).
 *
 * Catches any unexpected error thrown while rendering a route segment
 * (e.g. a database outage) and shows a friendly fallback instead of a
 * blank page or Next.js's default error screen.
 *
 * Two Next.js requirements in this version:
 * - MUST be a Client Component ("use client") because it uses hooks.
 * - The retry callback is `unstable_retry` (in older versions it was `reset`).
 *
 * `error.digest` is a unique ID Next generates for the error — useful when
 * reporting the failure to a logging service.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  // Log the error server-side; in production you'd send it to an error
  // tracking service (Sentry, etc.) here instead of console.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* aria-hidden: decorative — the h1 carries the meaning */}
        <p className="text-6xl font-semibold text-primary-soft" aria-hidden>
          500
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted">
          An unexpected error occurred. You can try again, or head back home.
        </p>
        {error.digest && (
          <p className="mt-4 text-xs text-muted">Error ID: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={unstable_retry}
            className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-5 text-sm font-medium transition-colors hover:bg-primary-soft"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}