import { LessonForm } from "@/components/lesson-form";
import { createLesson } from "@/lib/actions/teacher";
import { requireCourseOwnership } from "@/lib/teacher";

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { course } = await requireCourseOwnership(id);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">New lesson</h1>
      <p className="mt-2 mb-8 text-muted">
        Adding to “{course.title}”. This lesson will appear at the end.
      </p>
      <LessonForm
        action={createLesson.bind(null, course.id)}
        courseId={course.id}
      />
    </div>
  );
}
