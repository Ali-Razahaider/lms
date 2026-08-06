import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCourseOwnership } from "@/lib/teacher";
import {
  deleteCourse,
  deleteLesson,
  togglePublish,
} from "@/lib/actions/teacher";
import { ConfirmButton } from "@/components/confirm-button";

export const dynamic = "force-dynamic";

export default async function ManageCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Auth + ownership in one call.
  const { course } = await requireCourseOwnership(id);

  const category = course.categoryId
    ? await prisma.category.findUnique({
        where: { id: course.categoryId },
        select: { name: true },
      })
    : null;

  // Lessons with two extra facts per lesson: whether it has a quiz,
  // and how many students completed it.
  const lessons = await prisma.lesson.findMany({
    where: { courseId: id },
    select: {
      id: true,
      title: true,
      videoStatus: true,
      quiz: { select: { id: true } },
      _count: { select: { lessonProgress: true } },
    },
    orderBy: { order: "asc" },
  });

  const studentCount = await prisma.enrollment.count({
    where: { courseId: id },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {course.title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted">{course.description}</p>
          <div className="mt-3 flex items-center gap-3 text-sm text-muted">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                course.published
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {course.published ? "Published" : "Draft"}
            </span>
            {category && (
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                {category.name}
              </span>
            )}
            <span>
              {course.price > 0
                ? `$${(course.price / 100).toFixed(2)}`
                : "Free"}
            </span>
            <span>·</span>
            <span>
              {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
            </span>
            <span>·</span>
            <span>
              {studentCount} student{studentCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {course.published && (
            <Link
              href={`/courses/${course.id}`}
              className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-primary-soft"
            >
              View
            </Link>
          )}
          <form action={togglePublish.bind(null, course.id)}>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-primary-soft"
            >
              {course.published ? "Unpublish" : "Publish"}
            </button>
          </form>
          <Link
            href={`/dashboard/courses/${course.id}/edit`}
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-primary-soft"
          >
            Edit
          </Link>
          <ConfirmButton
            action={deleteCourse.bind(null, course.id)}
            message={`Delete "${course.title}"? This also removes its lessons and student progress.`}
            className="inline-flex h-10 items-center rounded-lg border border-red-200 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Delete
          </ConfirmButton>
        </div>
      </div>

      {/* Lessons */}
      <div className="mt-12 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Lessons</h2>
        <Link
          href={`/dashboard/courses/${course.id}/lessons/new`}
          className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          Add lesson
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
          <p className="text-lg font-medium">No lessons yet</p>
          <p className="mt-1 text-sm text-muted">
            Add your first lesson to start building the course.
          </p>
        </div>
      ) : (
        <ol className="mt-4 space-y-3">
          {lessons.map((lesson, index) => (
            <li
              key={lesson.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{lesson.title}</p>
                <p className="text-xs text-muted">
                  {lesson.quiz ? "Has quiz" : "No quiz"}
                  {lesson.videoStatus === "READY" ? " · Has video" : ""} ·{" "}
                  {lesson._count.lessonProgress} completed
                </p>
              </div>

              <Link
                href={`/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                className="shrink-0 rounded-lg bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-soft/70"
              >
                Preview
              </Link>
              <Link
                href={`/dashboard/courses/${course.id}/lessons/${lesson.id}/edit`}
                className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary-soft"
              >
                Edit
              </Link>
              <ConfirmButton
                action={deleteLesson.bind(null, course.id, lesson.id)}
                message={`Delete "${lesson.title}"? This also removes its quiz and student progress.`}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                Delete
              </ConfirmButton>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
