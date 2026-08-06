"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Enroll the current user in a course, then return them to the
 * course page (which will now show the enrolled experience).
 *
 * Bound from the form: `action={enroll.bind(null, courseId)}`
 */
export async function enroll(courseId: string) {
  // 1. Identity — server actions don't trust the form; they re-read
  //    the session cookie, exactly like the dashboard does.
  const session = await auth();
  if (!session?.user) {
    // Not logged in? Send them to login, and remember where to
    // return afterwards via callbackUrl.
    const callback = encodeURIComponent(`/courses/${courseId}`);
    redirect(`/login?callbackUrl=${callback}`);
  }

  // Only students enroll in courses; teachers get their own
  // management dashboard (future milestone).
  if (session.user.role !== "STUDENT") {
    redirect(`/courses/${courseId}`);
  }

  // Paid courses can't be enrolled for free — the only way in is via
  // Stripe checkout (which creates the enrollment through the webhook).
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { price: true },
  });
  if (!course || course.price > 0) {
    redirect(`/courses/${courseId}`);
  }

  // 2. Upsert = INSERT OR DO NOTHING.
  //    Re-submitting the form (double-click, retry) must not crash
  //    on the @@unique([userId, courseId]) constraint.
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
    },
    update: {}, // already enrolled → leave the row untouched
    create: { userId: session.user.id, courseId },
  });

  // 3. Next.js caches rendered pages. After a write, purge the
  //    cache for the course page so the "Enrolled" UI appears.
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/dashboard");

  // 4. Navigate the browser back to the course page.
  redirect(`/courses/${courseId}`);
}
