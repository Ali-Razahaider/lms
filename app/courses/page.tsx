import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // All categories → the filter pills.
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const courses = await prisma.course.findMany({
    where: {
      published: true,
      ...(category
        ? { category: { slug: category } }
        : {}),
    },
    include: {
      teacher: { select: { name: true } },
      category: { select: { name: true } },
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

      {/* Category filter pills */}
      <div className="mb-10 flex flex-wrap items-center gap-2">
        <Link
          href="/courses"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !category
              ? "bg-primary text-white"
              : "border border-border bg-surface text-muted hover:bg-primary-soft"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/courses?category=${cat.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat.slug
                ? "bg-primary text-white"
                : "border border-border bg-surface text-muted hover:bg-primary-soft"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
          <p className="text-lg font-medium">No courses here yet</p>
          <p className="mt-1 text-sm text-muted">
            {category
              ? "Nothing in this category yet — check back soon."
              : "Check back soon — new courses are being added."}
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
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                  {course._count.lessons} lesson
                  {course._count.lessons === 1 ? "" : "s"}
                </span>
                <span className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold">
                  {formatPrice(course.price)}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold leading-snug group-hover:text-primary">
                {course.title}
              </h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                {course.description}
              </p>
              <div className="mt-4 flex items-center justify-between gap-2 text-sm text-muted">
                <p className="truncate">
                  by{" "}
                  <span className="font-medium text-foreground">
                    {course.teacher.name}
                  </span>
                </p>
                {course.category && (
                  <span className="shrink-0 text-xs font-medium text-primary">
                    {course.category.name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
