import { LessonForm } from "@/components/lesson-form";
import { updateLesson } from "@/lib/actions/teacher";
import { requireLessonOwnership } from "@/lib/teacher";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;

  const { course, lesson } = await requireLessonOwnership(id, lessonId);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Edit lesson</h1>
      <p className="mt-2 mb-8 text-muted">
        Editing “{lesson.title}” in {course.title}.
      </p>
      <LessonForm
        action={updateLesson.bind(null, course.id, lesson.id)}
        courseId={course.id}
        lessonId={lesson.id}
        initialValues={{ title: lesson.title, content: lesson.content }}
        initialVideoStatus={lesson.videoStatus}
      />
    </div>
  );
}
