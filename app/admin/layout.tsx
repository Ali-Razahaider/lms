import Link from "next/link";
import { requireTeacher } from "@/lib/teacher";

const adminNav = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/users", label: "Manage Users", icon: "👥" },
  { href: "/admin/courses", label: "Manage Courses", icon: "📚" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeacher();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:flex-row sm:px-6">
      {/* Sidebar Navigation */}
      <aside className="w-full shrink-0 sm:w-64">
        <div className="rounded-[2rem] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-6 px-2">
            <h1 className="text-xl font-bold tracking-tight">Admin Center</h1>
            <p className="mt-1 text-xs font-medium text-muted">Platform management</p>
          </div>
          <nav aria-label="Admin" className="space-y-1">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-primary-soft hover:text-primary"
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 border-t border-border px-2 pt-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
