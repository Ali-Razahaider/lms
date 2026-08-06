"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Toggle completion of `lessonId` inside `courseId`.
 *
 * Bound from the form:
 *   `action={toggleLessonComplete.bind(null, courseId, lessonId)}`
 */
export async function toggleLessonComplete(courseId: string, lessonId: string) {
  // 1. Identity — same pattern as every other server action.
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // 2. Permission: only an ENROLLED student may mark lessons.
  //    We could check this in SQL, but a plain Prisma lookup is
  //    clear and cheap. (Teachers are excluded by role.)
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment || session.user.role !== "STUDENT") {
    // Not enrolled → nothing to do; send them back to the course.
    redirect(`/courses/${courseId}`);
  }

  // 3. Toggle: find the existing progress row for (user, lesson).
  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  if (existing) {
    // Already complete → remove it (un-complete).
    await prisma.lessonProgress.delete({ where: { id: existing.id } });
  } else {
    // Not complete → create it. @@unique([userId, lessonId]) means
    // two concurrent clicks can't create duplicate rows.
    await prisma.lessonProgress.create({
      data: { userId, lessonId },
    });
  }

  // 4. Purge cached versions of the lesson + course + dashboard pages,
  //    all of which display completion state.
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath("/dashboard");

  // 5. Stay on the lesson page so the student can keep reading/studying.
  redirect(`/courses/${courseId}/lessons/${lessonId}`);
}
