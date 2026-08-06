"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  requireTeacher,
  requireCourseOwnership,
  requireLessonOwnership,
} from "@/lib/teacher";

// ── shared validation schemas ────────────────────────────────
// Single source of truth for "what makes a valid course/lesson".
// Used by both create and update so the rules can't drift apart.
const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be 2000 characters or fewer"),
  // Price is entered in dollars ("49.99"); stored as cents.
  priceDollars: z
    .string()
    .trim()
    .refine((v) => /^\d{0,6}(\.\d{1,2})?$/.test(v), {
      message: "Price must be a valid amount like 0, 19.99, or 499",
    }),
  categoryId: z.string().trim().optional(),
  published: z.boolean(),
});

const lessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be 200 characters or fewer"),
  content: z
    .string()
    .min(1, "Lesson content is required")
    .max(50_000, "Lesson content is too long"),
});

// Form-state types consumed by the client form components.
export type CourseFormState = {
  error?: string;
  values?: {
    title: string;
    description: string;
    priceDollars: string;
    categoryId: string;
    published: boolean;
  };
};
export type LessonFormState = {
  error?: string;
  values?: { title: string; content: string };
};

// ── COURSES ──────────────────────────────────────────────────

/**
 * Create a course. `published` comes from a checkbox: browsers send
 * `"on"` when checked and omit the field entirely when unchecked, so
 * `=== "on"` is how we read it.
 */
export async function createCourse(
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const user = await requireTeacher();

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priceDollars: formData.get("price") ?? "0",
    categoryId: formData.get("categoryId") ?? undefined,
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const categoryId = parsed.data.categoryId || null;
  const price = Math.round(Number(parsed.data.priceDollars) * 100);

  const course = await prisma.course.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price,
      categoryId,
      published: parsed.data.published,
      teacherId: user.id,
    },
  });

  // Invalidate the dashboard so the new course appears there.
  revalidatePath("/dashboard");
  // Land the teacher on the new course's management page.
  redirect(`/dashboard/courses/${course.id}`);
}

/**
 * Update a course. Bound from the form:
 * `action={updateCourse.bind(null, course.id)}`
 */
export async function updateCourse(
  courseId: string,
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  // Ownership check doubles as the auth check.
  await requireCourseOwnership(courseId);

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priceDollars: formData.get("price") ?? "0",
    categoryId: formData.get("categoryId") ?? undefined,
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const categoryId = parsed.data.categoryId || null;
  const price = Math.round(Number(parsed.data.priceDollars) * 100);

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price,
      categoryId,
      published: parsed.data.published,
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath("/courses");
  redirect(`/dashboard/courses/${courseId}`);
}

/** Publish / unpublish in one click (no form, just a bound action). */
export async function togglePublish(courseId: string) {
  const { course } = await requireCourseOwnership(courseId);

  await prisma.course.update({
    where: { id: courseId },
    data: { published: !course.published },
  });

  // No redirect — the manage page simply re-renders with the new state.
  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath("/courses");
}

/** Delete a course (cascades to its lessons + enrollments in the DB). */
export async function deleteCourse(courseId: string) {
  await requireCourseOwnership(courseId);

  await prisma.course.delete({ where: { id: courseId } });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ── LESSONS ──────────────────────────────────────────────────

/**
 * Create a lesson. Order is auto-assigned to `max(order) + 1`, so
 * lessons append to the end — teachers never have to manage numbers.
 * (Reordering is a deliberate future enhancement; it needs the
 * @@unique([courseId, order]) constraint handled carefully.)
 */
export async function createLesson(
  courseId: string,
  _prevState: LessonFormState,
  formData: FormData
): Promise<LessonFormState> {
  await requireCourseOwnership(courseId);

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const lastLesson = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.lesson.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      courseId,
      order: (lastLesson?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  redirect(`/dashboard/courses/${courseId}`);
}

/** Update a lesson. */
export async function updateLesson(
  courseId: string,
  lessonId: string,
  _prevState: LessonFormState,
  formData: FormData
): Promise<LessonFormState> {
  await requireLessonOwnership(courseId, lessonId);

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  redirect(`/dashboard/courses/${courseId}`);
}

/** Delete a lesson (also removes its quiz + students' progress). */
export async function deleteLesson(courseId: string, lessonId: string) {
  await requireLessonOwnership(courseId, lessonId);

  await prisma.lesson.delete({ where: { id: lessonId } });

  revalidatePath(`/dashboard/courses/${courseId}`);
  redirect(`/dashboard/courses/${courseId}`);
}

/** Remove a lesson's video (keeps the Mux asset; just detaches it). */
export async function clearLessonVideo(courseId: string, lessonId: string) {
  await requireLessonOwnership(courseId, lessonId);

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      videoStatus: "NONE",
      videoUploadId: null,
      videoPlaybackId: null,
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
}
