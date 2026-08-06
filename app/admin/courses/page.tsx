import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacher";
import {
  adminDeleteCourse,
  adminToggleCoursePublish,
} from "@/lib/actions/admin";
import { ConfirmButton } from "@/components/confirm-button";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  await requireTeacher();

  const courses = await prisma.course.findMany({
    include: {
      teacher: { select: { name: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">All courses</h2>
        <span className="text-sm text-muted">{courses.length} total</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <ul className="divide-y divide-border">
          {courses.map((course) => (
            <li
              key={course.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{course.title}</p>
                <p className="truncate text-sm text-muted">
                  by {course.teacher.name} · {formatPrice(course.price)} ·{" "}
                  {course._count.lessons} lessons · {course._count.enrollments}{" "}
                  enrolled
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    course.published
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {course.published ? "Published" : "Draft"}
                </span>
                <Link
                  href={`/courses/${course.id}`}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary-soft"
                >
                  View
                </Link>
                <form action={adminToggleCoursePublish.bind(null, course.id)}>
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary-soft"
                  >
                    {course.published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <ConfirmButton
                  action={adminDeleteCourse.bind(null, course.id)}
                  message={`Delete "${course.title}"? This removes its lessons and student progress.`}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                >
                  Delete
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
