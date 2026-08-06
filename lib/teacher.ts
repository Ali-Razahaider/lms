import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the logged-in teacher's user object, or bounces the user.
 *
 * Security note: an authenticated STUDENT who sneaks into a teacher
 * route is redirected to /dashboard rather than left with a 403 —
 * we simply treat any non-teacher as "you don't belong here."
 */
export async function requireTeacher() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  return session.user;
}

/**
 * Loads a course AND verifies the current teacher owns it.
 * Returns both so callers don't re-query.
 *
 * `findFirst` (not `findUnique`) is used deliberately so we can add
 * `teacherId: userId` to the where clause — the DB itself enforces
 * ownership, so there's no way to request another teacher's course.
 */
export async function requireCourseOwnership(courseId: string) {
  const user = await requireTeacher();

  const course = await prisma.course.findFirst({
    where: { id: courseId, teacherId: user.id },
  });

  if (!course) {
    // Course doesn't exist OR belongs to someone else — same response
    // either way, so we don't leak whether another teacher's course exists.
    redirect("/dashboard");
  }

  return { user, course };
}

/**
 * Same ownership check, but for a lesson nested inside a course.
 * Guards both the URL params (courseId + lessonId) as one unit.
 */
export async function requireLessonOwnership(courseId: string, lessonId: string) {
  const { course } = await requireCourseOwnership(courseId);

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId },
  });

  if (!lesson) {
    redirect(`/dashboard/courses/${courseId}`);
  }

  return { course, lesson };
}
