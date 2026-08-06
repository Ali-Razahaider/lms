import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toggleLessonComplete } from "@/lib/actions/lessons";
import { LessonVideoPlayer } from "@/components/lesson-video-player";

// Progress changes constantly → always read the DB fresh.
export const dynamic = "force-dynamic";

// Rough reading-time estimate: average reader does ~200 words/min.
function readingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function LessonPlayerPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;

  // ── 1. Course (published only) — title + the ordered lesson list ──
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

  // ── 2. The lesson itself (full content + optional quiz) ────────
  // `quiz: { select: { questions: true } }` → null if no quiz,
  // otherwise carries the question array so we can count them.
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId: course.id },
    include: {
      quiz: { select: { questions: true } },
    },
  });

  if (!lesson) notFound();

  // ── 2b. Who's reading? ─────────────────────────────────────────
  const session = await auth();
  const user = session?.user;
  const isStudent = user?.role === "STUDENT";

  // Enrolled check — one query, only for students.
  const enrollment =
    isStudent && user
      ? await prisma.enrollment.findUnique({
          where: {
            userId_courseId: { userId: user.id, courseId: course.id },
          },
        })
      : null;

  // Paid courses are locked until the student has bought them.
  // (Free courses stay readable by everyone, as before.)
  const isPaid = course.price > 0;
  const canRead =
    !isPaid ||
    user?.role === "TEACHER" ||
    Boolean(enrollment);

  if (isPaid && !canRead) {
    // Redirect to the course page, which shows the purchase CTA.
    redirect(`/courses/${course.id}?locked=1`);
  }

  // ── 4. Completion state for the WHOLE course ─────────────────
  // The sidebar + summary need a checkmark per lesson, so we fetch
  // every completed lesson id for this (student, course) at once.
  let completedLessonIds = new Set<string>();
  if (enrollment && user) {
    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId: user.id,
        lessonId: { in: course.lessons.map((l) => l.id) },
      },
      select: { lessonId: true },
    });
    completedLessonIds = new Set(progress.map((p) => p.lessonId));
  }

  const isComplete = completedLessonIds.has(lessonId);
  const completedCount = course.lessons.filter((l) =>
    completedLessonIds.has(l.id)
  ).length;
  const totalLessons = course.lessons.length;
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  // ── 5. Derived metadata for the header ───────────────────────
  const index = course.lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = index > 0 ? course.lessons[index - 1] : null;
  const nextLesson = index < totalLessons - 1 ? course.lessons[index + 1] : null;
  const readTime = readingTimeMinutes(lesson.content);
  const quizQuestionCount = Array.isArray(lesson.quiz?.questions)
    ? lesson.quiz.questions.length
    : 0;

  // ── 6. Render ────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <Link
        href={`/courses/${course.id}`}
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        ← Back to {course.title}
      </Link>

      {/* Two-column layout. On mobile: lesson first, list second. */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* ── SIDEBAR: lesson list ─────────────────────────── */}
        <aside className="order-2 lg:order-1 lg:sticky lg:top-8 lg:self-start">
          <nav
            aria-label="Course lessons"
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
          >
            {/* Course header inside the sidebar */}
            <div className="border-b border-border bg-bg-subtle p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Course contents
              </p>
              <p className="mt-1 font-semibold leading-snug">{course.title}</p>

              {/* Progress summary — only shown to enrolled students */}
              {enrollment && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>
                      {completedCount} of {totalLessons} complete
                    </span>
                    <span className="font-medium text-primary">{percent}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary-soft">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <ol className="p-3">
              {course.lessons.map((item, i) => {
                const itemComplete = completedLessonIds.has(item.id);
                const isCurrent = item.id === lesson.id;

                return (
                  <li key={item.id}>
                    <Link
                      href={`/courses/${course.id}/lessons/${item.id}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isCurrent
                          ? "bg-primary-soft font-medium text-primary"
                          : "text-foreground hover:bg-primary-soft/60"
                      }`}
                    >
                      {/* Badge: ✓ when done, else the lesson number */}
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                          itemComplete
                            ? "bg-primary text-white"
                            : "bg-primary-soft text-primary"
                        }`}
                      >
                        {itemComplete ? "✓" : i + 1}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        {/* ── MAIN: the lesson ─────────────────────────────── */}
        <main className="order-1 lg:order-2">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
              Lesson {index + 1} of {totalLessons}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
              {readTime} min read
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
              by {course.teacher.name}
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance">
            {lesson.title}
          </h1>

          {/* Live progress bar for enrolled students */}
          {enrollment && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted">Course progress</span>
                <span className="font-semibold text-primary">{percent}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary-soft">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Completion banner */}
          {isComplete && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="font-semibold text-green-800">
                You&apos;ve completed this lesson
              </p>
              <p className="mt-0.5 text-sm text-green-700">
                {completedCount} of {totalLessons} lessons done. Keep it up!
              </p>
            </div>
          )}

          {/* Lesson video — shown when the teacher attached one */}
          {lesson.videoStatus === "READY" && (
            <div className="mt-6">
              <LessonVideoPlayer courseId={course.id} lessonId={lesson.id} />
            </div>
          )}

          {/* Lesson body */}
          <article className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border bg-bg-subtle px-8 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Lesson content
              </span>
            </div>
            <div className="px-8 py-8">
              {/* whitespace-pre-wrap preserves the teacher's line
                  breaks; max-w-prose + larger leading keeps reading
                  comfortable instead of stretching full-width. */}
              <div className="mx-auto max-w-prose whitespace-pre-wrap text-lg leading-relaxed text-foreground/90">
                {lesson.content}
              </div>
            </div>
          </article>

          {/* Quiz teaser — present when the teacher attached a quiz */}
          {quizQuestionCount > 0 && (
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary-soft p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-primary">
                  Test your knowledge
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  This lesson includes a {quizQuestionCount}-question quiz.
                  The quiz player is coming soon.
                </p>
              </div>
              <span className="inline-flex h-10 shrink-0 items-center rounded-lg bg-primary/20 px-4 text-sm font-medium text-primary">
                Quiz coming soon
              </span>
            </div>
          )}

          {/* Mark complete / incomplete — enrolled students only */}
          {enrollment ? (
            <form action={toggleLessonComplete.bind(null, course.id, lesson.id)} className="mt-6">
              <button
                type="submit"
                title={isComplete ? "Click to undo" : "Mark this lesson complete"}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm transition-colors active:scale-[0.98] ${
                  isComplete
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                <span
                  aria-hidden
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold"
                >
                  {isComplete ? "✓" : ""}
                </span>
                {isComplete ? "Completed" : "Mark complete"}
              </button>
              {isComplete && (
                <p className="mt-1.5 text-xs text-muted">
                  {completedCount} of {totalLessons} lessons done in this course.
                </p>
              )}
            </form>
          ) : isStudent ? (
            <p className="mt-8 text-center text-sm text-muted">
              Enroll in this course to track your progress.
            </p>
          ) : (
            <p className="mt-8 text-center text-sm text-muted">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>{" "}
              to track your progress.
            </p>
          )}

          {/* Prev / next navigation */}
          <nav className="mt-10 grid grid-cols-2 gap-4">
            {prevLesson ? (
              <Link
                href={`/courses/${course.id}/lessons/${prevLesson.id}`}
                className="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-primary"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                  ← Previous
                </span>
                <p className="mt-1 truncate text-sm font-semibold group-hover:text-primary">
                  {prevLesson.title}
                </p>
              </Link>
            ) : (
              <span />
            )}

            {nextLesson ? (
              <Link
                href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                className="group rounded-xl border border-border bg-surface p-5 text-right shadow-sm transition-colors hover:border-primary"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                  Next →
                </span>
                <p className="mt-1 truncate text-sm font-semibold group-hover:text-primary">
                  {nextLesson.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}
