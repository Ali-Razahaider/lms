import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await prisma.course.findFirst({
    where: { id, published: true },
    include: {
      teacher: { select: { name: true } },
      lessons: {
        select: { id: true, title: true, order: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link
        href="/courses"
        className="text-sm font-medium text-muted hover:text-foreground"
      >
        ← Back to courses
      </Link>

      <div className="mt-6">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          {course.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
          {course.description}
        </p>
        <p className="mt-4 text-sm text-muted">
          by <span className="font-medium text-foreground">{course.teacher.name}</span> ·{" "}
          {course.lessons.length} lesson
          {course.lessons.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Lessons
        </h2>
        <ol className="mt-4 space-y-3">
          {course.lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="font-medium">{lesson.title}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}