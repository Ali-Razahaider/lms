"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, {
    error: undefined,
  });

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl text-white">
            L
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted">
            Log in to continue your learning.
          </p>
        </div>

        <form
          action={formAction}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          {state.error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link className="font-medium text-primary hover:underline" href="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}