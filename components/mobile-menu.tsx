"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-primary-soft"
      >
        <span aria-hidden className="text-xl leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute left-0 right-0 top-full border-t border-border bg-surface shadow-sm"
        >
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3 sm:px-6">
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base text-foreground hover:bg-primary-soft"
            >
              About
            </Link>
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base text-foreground hover:bg-primary-soft"
            >
              Courses
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}