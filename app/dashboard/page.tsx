import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// `force-dynamic` = never cache this page's HTML.
// Progress changes constantly, so every visit must hit the DB fresh.
// Without this, Next.js could serve a stale cached copy.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // ── STEP 1: get the logged-in user ──────────────────────────
  // `auth()` decrypts the session cookie set at login. If someone
  // reaches /dashboard without a session (e.g. manually typing the
  // URL), redirect them to the login page. The proxy.ts also guards
  // this, but this is defense-in-depth inside the page itself.
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id: userId, name, role } = session.user;

  // First name is used by BOTH branches, so compute it once here.
  const firstName = name?.split(" ")[0] ?? "there";

  // ── STEP 2: TEACHER branch ──────────────────────────────────
  // A teacher gets their own management dashboard. Because this is a
  // server component, the query below runs only for teachers — the
  // student queries in steps 3–5 never execute on this branch.
  if (role === "TEACHER") {
    const courses = await prisma.course.findMany({
      where: { teacherId: userId },
      // _count adds aggregate columns (COUNT(*) ...) in the same query.
      include: { _count: { select: { lessons: true, enrollments: true } } },
      orderBy: { createdAt: "desc" },
    });

    const totalLessons = courses.reduce((sum, c) => sum + c._count.lessons, 0);
    const totalStudents = courses.reduce(
      (sum, c) => sum + c._count.enrollments,
      0
    );

    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-muted">
              Manage your courses and lessons.
            </p>
          </div>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            Teacher
          </span>
        </div>

        {/* Stat cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">Courses</p>
            <p className="mt-1 text-3xl font-semibold">{courses.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">Lessons</p>
            <p className="mt-1 text-3xl font-semibold">{totalLessons}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">Students</p>
            <p className="mt-1 text-3xl font-semibold">{totalStudents}</p>
          </div>
        </div>

        {/* My courses */}
        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">My courses</h2>
          <Link
            href="/dashboard/courses/new"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            New course
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
            <p className="text-lg font-medium">No courses yet</p>
            <p className="mt-1 text-sm text-muted">
              Create your first course to get started.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold leading-snug">
                    {course.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      course.published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {course.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">
                  {course.description}
                </p>
                <p className="mt-4 text-sm text-muted">
                  {course._count.lessons} lesson
                  {course._count.lessons === 1 ? "" : "s"} ·{" "}
                  {course._count.enrollments} student
                  {course._count.enrollments === 1 ? "" : "s"}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Manage →
                  </Link>
                  {course.published && (
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-muted hover:text-foreground"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── STEP 3: query the student's ENROLLMENTS ─────────────────
  // Find every Enrollment row where userId = this student.
  // `include: { course }` joins the related Course row onto each one,
  // and `course.lessons` joins all lessons of that course, so we get
  // everything we need in ONE database query (no N+1 problem).
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              order: true,
              quiz: { select: { id: true } }, // null if the lesson has no quiz
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // ── STEP 4: query the student's completed LESSONS ───────────
  // We fetch the IDs of every lesson the student has marked complete.
  // A Set makes O(1) lookups when we check "is this lesson done?"
  const completedLessonIds = new Set(
    (
      await prisma.lessonProgress.findMany({
        where: { userId },
        select: { lessonId: true },
      })
    ).map((p) => p.lessonId)
  );

  // ── STEP 5: query the student's QUIZ attempts ───────────────
  // Used to compute the average quiz score shown in the stats.
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    select: { score: true },
  });

  // ── STEP 6: compute derived numbers (pure JS, no DB) ────────
  const totalLessonsCompleted = completedLessonIds.size;
  const totalQuizzes = quizAttempts.length;
  const averageQuizScore = totalQuizzes
    ? Math.round(
        quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
          totalQuizzes
      )
    : null;

  // Helper to build per-course progress (defined inside the component
  // so it can close over completedLessonIds).
  const courseProgress = (lessonIds: string[]) => {
    const total = lessonIds.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = lessonIds.filter((id) =>
      completedLessonIds.has(id)
    ).length;
    return {
      completed,
      total,
      percent: Math.round((completed / total) * 100),
    };
  };

  // ── STEP 7: RENDER ──────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header: greeting + role badge */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-muted">
            Here&apos;s where you left off.
          </p>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
          Student
        </span>
      </div>

      {/* Stat cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Courses enrolled</p>
          <p className="mt-1 text-3xl font-semibold">{enrollments.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Lessons completed</p>
          <p className="mt-1 text-3xl font-semibold">{totalLessonsCompleted}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Average quiz score</p>
          <p className="mt-1 text-3xl font-semibold">
            {averageQuizScore === null ? "—" : `${averageQuizScore}%`}
          </p>
        </div>
      </div>

      {/* Enrolled courses */}
      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        My courses
      </h2>

      {enrollments.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
          <p className="text-lg font-medium">You haven&apos;t enrolled yet</p>
          <p className="mt-1 text-sm text-muted">
            Browse the catalog and pick your first course.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {enrollments.map((enrollment) => {
            const lessonIds = enrollment.course.lessons.map(
              (lesson) => lesson.id
            );
            const progress = courseProgress(lessonIds);
            const quizCount = enrollment.course.lessons.filter(
              (lesson) => lesson.quiz !== null
            ).length;

            // Deep-link the card to the FIRST lesson the student still
            // needs to do — that's where "Continue" should take them.
            // When everything is complete, fall back to the course page.
            const nextLesson = enrollment.course.lessons.find(
              (lesson) => !completedLessonIds.has(lesson.id)
            );
            const cardHref = nextLesson
              ? `/courses/${enrollment.course.id}/lessons/${nextLesson.id}`
              : `/courses/${enrollment.course.id}`;

            return (
              <Link
                key={enrollment.id}
                href={cardHref}
                className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">
                    {enrollment.course.title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                    {progress.percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-primary-soft">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>

                {/* Lesson / quiz summary */}
                <div className="mt-4 flex items-center gap-4 text-sm text-muted">
                  <span>
                    {progress.completed} of {progress.total} lessons
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    {quizCount} quiz{quizCount === 1 ? "" : "zes"}
                  </span>
                </div>

                <span className="mt-6 inline-flex text-sm font-medium text-primary">
                  {progress.completed === 0
                    ? "Start course →"
                    : progress.completed === progress.total
                      ? "Review course →"
                      : "Continue →"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
