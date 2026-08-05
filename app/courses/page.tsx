import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-10">
        <span className="text-sm font-medium text-primary">Course catalog</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Browse courses
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Pick a course and start learning at your own pace.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
          <p className="text-lg font-medium">No courses yet</p>
          <p className="mt-1 text-sm text-muted">
            Check back soon — new courses are being added.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="inline-flex w-fit rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                {course._count.lessons} lesson
                {course._count.lessons === 1 ? "" : "s"}
              </span>
              <h2 className="mt-4 text-lg font-semibold leading-snug group-hover:text-primary">
                {course.title}
              </h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                {course.description}
              </p>
              <p className="mt-4 text-sm text-muted">
                by{" "}
                <span className="font-medium text-foreground">
                  {course.teacher.name}
                </span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}