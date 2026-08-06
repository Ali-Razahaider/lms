import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enroll } from "@/lib/actions/enroll";
import { checkoutCourse } from "@/lib/actions/checkout";
import { PurchaseButton } from "@/components/purchase-button";
import { formatPrice } from "@/lib/format";

// Lessons/progress change constantly → always query the DB fresh.
export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ purchase?: string }>;
}) {
  // `params` is a Promise in App Router — await it for the id.
  const { id } = await params;
  const { purchase } = await searchParams;

  // ── 1. Load the course with everything we need to render ────
  const course = await prisma.course.findFirst({
    where: { id, published: true }, // unpublished courses stay hidden
    include: {
      teacher: { select: { name: true } },
      category: { select: { name: true } },
      lessons: {
        // `quiz: { select: { id: true } }` returns the quiz object
        // when the lesson has one, or `null` when it doesn't — so
        // `lesson.quiz !== null` tells us whether a quiz exists.
        select: { id: true, title: true, order: true, videoStatus: true, quiz: { select: { id: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) notFound();

  // ── 2. Who's viewing? (read-only; never trust URL params) ───
  const session = await auth();
  const user = session?.user;
  const isStudent = user?.role === "STUDENT";

  // ── 3. Enrollment + progress (only relevant for students) ───
  let enrolled = false;
  let completedLessonIds = new Set<string>();

  if (isStudent) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    enrolled = Boolean(enrollment);

    if (enrolled) {
      const progress = await prisma.lessonProgress.findMany({
        where: { userId: user.id },
        select: { lessonId: true },
      });
      completedLessonIds = new Set(progress.map((p) => p.lessonId));
    }
  }

  const totalLessons = course.lessons.length;
  const completedCount = course.lessons.filter((l) =>
    completedLessonIds.has(l.id)
  ).length;
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  // ── 4. Render ───────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link
        href="/courses"
        className="text-sm font-medium text-muted hover:text-foreground"
      >
        ← Back to courses
      </Link>

      {/* Header */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            {course.title}
          </h1>
          {enrolled && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Enrolled
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {course.category && (
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
              {course.category.name}
            </span>
          )}
          <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
            {course.price > 0 ? formatPrice(course.price) : "Free"}
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
          {course.description}
        </p>
        <p className="mt-4 text-sm text-muted">
          by <span className="font-medium text-foreground">{course.teacher.name}</span> ·{" "}
          {totalLessons} lesson{totalLessons === 1 ? "" : "s"}
        </p>
      </div>

      {/* Post-purchase notice (Stripe returns here after payment) */}
      {purchase === "success" && (
        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
          <p className="font-semibold text-green-800">
            Payment received — thank you!
          </p>
          <p className="mt-1 text-sm text-green-700">
            {enrolled
              ? "You're now enrolled. Start learning below."
              : "Your access is being activated — this usually takes a few seconds."}
          </p>
        </div>
      )}

      {/* Enrollment gate: decides what the visitor can do */}
      {!enrolled && (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {!user ? (
            // State (a): guest
            <>
              <p className="font-medium">
                {course.price > 0
                  ? `Purchase this course for ${formatPrice(course.price)}`
                  : "Enroll to track your progress"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {course.price > 0
                  ? "Pay securely with a credit card."
                  : "Create a free account to mark lessons complete."}
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
              >
                Log in to {course.price > 0 ? "purchase" : "enroll"}
              </Link>
            </>
          ) : isStudent ? (
            // State (b): logged-in student, not enrolled
            // Free → the classic enroll form. Paid → Stripe checkout.
            course.price > 0 ? (
              <PurchaseButton
                action={checkoutCourse.bind(null, course.id)}
                price={course.price}
              />
            ) : (
              <form action={enroll.bind(null, course.id)}>
                <p className="font-medium">Ready to start learning?</p>
                <p className="mt-1 text-sm text-muted">
                  Enroll free to unlock progress tracking.
                </p>
                <button
                  type="submit"
                  className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Enroll in course
                </button>
              </form>
            )
          ) : (
            // State (b′): teacher logged in — read-only preview
            <p className="text-sm text-muted">
              You&apos;re viewing as a teacher.{" "}
              <Link
                href={`/dashboard/courses/${course.id}`}
                className="font-medium text-primary hover:underline"
              >
                Manage this course →
              </Link>
            </p>
          )}
        </div>
      )}

      {/* Enrolled students see their live progress bar */}
      {enrolled && (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {completedCount} of {totalLessons} lessons complete
            </span>
            <span className="font-semibold text-primary">{percent}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-primary-soft">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Lesson list */}
      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Lessons
        </h2>
        <ol className="mt-4 space-y-3">
          {course.lessons.map((lesson, index) => {
            const isComplete = completedLessonIds.has(lesson.id);
            const hasQuiz = lesson.quiz !== null;
            // Paid courses lock content until the student has enrolled.
            const locked = course.price > 0 && !enrolled;

            const row = (
              <span className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
                {/* Number badge — filled when this lesson is done */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                    isComplete
                      ? "bg-primary text-white"
                      : locked
                        ? "bg-bg-subtle text-muted"
                        : "bg-primary-soft text-primary"
                  }`}
                >
                  {isComplete ? "✓" : index + 1}
                </span>

                {/* Title */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate font-medium ${
                      isComplete ? "text-muted line-through" : ""
                    } ${locked ? "text-muted" : ""}`}
                  >
                    {lesson.title}
                  </p>
                  <span className="mt-0.5 inline-block text-xs text-muted">
                    {lesson.videoStatus === "READY" ? "Video · " : ""}
                    {hasQuiz ? "Quiz" : ""}
                  </span>
                </div>

                {/* Right side */}
                {locked ? (
                  <span
                    className="shrink-0 text-sm font-medium text-muted"
                    title="Enroll or purchase this course to unlock"
                  >
                    🔒
                  </span>
                ) : (
                  <span className="shrink-0 text-sm font-medium text-primary">
                    Open →
                  </span>
                )}
              </span>
            );

            return (
              <li key={lesson.id}>
                {locked ? (
                  row
                ) : (
                  <Link
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {row}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Helpful link once enrolled */}
      {enrolled && (
        <div className="mt-10 text-center">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to my dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
