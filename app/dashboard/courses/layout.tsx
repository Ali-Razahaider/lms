import Link from "next/link";

export default function TeacherCoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">
          Teacher studio
        </p>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Back to dashboard
        </Link>
      </div>
      {children}
    </div>
  );
}
