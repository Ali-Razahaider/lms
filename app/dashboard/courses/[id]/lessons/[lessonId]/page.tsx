import Link from "next/link";
import { requireLessonOwnership } from "@/lib/teacher";
import { LessonVideoPlayer } from "@/components/lesson-video-player";

export const dynamic = "force-dynamic";

export default async function PreviewLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;

  const { course, lesson } = await requireLessonOwnership(id, lessonId);

  return (
    <div>
      <Link
        href={`/dashboard/courses/${course.id}`}
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        ← Back to {course.title}
      </Link>

      <article className="mt-6 rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {course.title} · Lesson preview
        </p>

        {lesson.videoStatus === "READY" && (
          <div className="mt-6">
            <LessonVideoPlayer courseId={course.id} lessonId={lesson.id} />
          </div>
        )}

        <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed">
          {lesson.content}
        </div>
      </article>
    </div>
  );
}
