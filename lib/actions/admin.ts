"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacher";

const roleSchema = z.enum(["STUDENT", "TEACHER"]);

export type AdminUserFormState = {
  error?: string;
};

/**
 * Shared guard for user-targeting actions: the caller must be a
 * teacher, the target must exist, and it can't be the caller's own
 * account. Returns an error message, or null when the target is fine.
 */
async function requireTargetUser(targetUserId: string): Promise<string | null> {
  const admin = await requireTeacher();

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });
  if (!user) return "User not found.";
  if (user.id === admin.id) return "You can't manage your own account.";

  return null;
}

/** Change a user's role. `targetUserId` comes from a bound action. */
export async function changeUserRole(
  targetUserId: string,
  _prevState: AdminUserFormState,
  formData: FormData
): Promise<AdminUserFormState> {
  const parsed = roleSchema.safeParse(formData.get("role"));
  if (!parsed.success) return { error: "Invalid role" };

  const error = await requireTargetUser(targetUserId);
  if (error) return { error };

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: parsed.data },
  });

  revalidatePath("/admin/users");
  return {};
}

/** Delete a user. Cannot be used on your own account. */
export async function deleteUser(
  targetUserId: string,
  _prevState: AdminUserFormState
) {
  const error = await requireTargetUser(targetUserId);
  if (error) return { error };

  // onDelete: Cascade removes their enrollments, progress, attempts —
  // and their courses (teacher content) too.
  await prisma.user.delete({ where: { id: targetUserId } });

  revalidatePath("/admin/users");
  revalidatePath("/admin/courses");
  return {};
}

/** Unpublish / republish any course. */
export async function adminToggleCoursePublish(courseId: string) {
  await requireTeacher();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { published: true },
  });
  if (!course) redirect("/admin/courses");

  await prisma.course.update({
    where: { id: courseId },
    data: { published: !course.published },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

/** Delete any course. */
export async function adminDeleteCourse(courseId: string) {
  await requireTeacher();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!course) redirect("/admin/courses");

  await prisma.course.delete({ where: { id: courseId } });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}
