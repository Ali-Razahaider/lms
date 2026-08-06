import Link from "next/link";
import { requireTeacher } from "@/lib/teacher";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/courses", label: "Courses" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeacher();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Platform-wide user and course management.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Back to dashboard
        </Link>
      </div>

      <nav
        aria-label="Admin"
        className="mb-8 flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-sm"
      >
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium text-muted transition-colors hover:bg-primary-soft hover:text-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
