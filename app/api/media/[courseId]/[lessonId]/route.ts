import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signedPlaybackUrl } from "@/lib/mux";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/media/[courseId]/[lessonId]">
) {
  const { courseId, lessonId } = await ctx.params;

  // 1. Course must be published.
  const course = await prisma.course.findFirst({
    where: { id: courseId, published: true },
    select: { id: true },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 2. Access check.
  const session = await auth();
  const user = session?.user;
  let canWatch = false;

  if (user) {
    if (user.role === "TEACHER") {
      canWatch = true;
    } else {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
      });
      canWatch = Boolean(enrollment);
    }
  }

  if (!canWatch) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 3. Lesson must have a finished video.
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId, videoStatus: "READY", videoPlaybackId: { not: null } },
    select: { videoPlaybackId: true },
  });
  if (!lesson?.videoPlaybackId) {
    return NextResponse.json({ error: "Video not ready" }, { status: 404 });
  }

  // 4. Sign a short-lived URL.
  try {
    const url = await signedPlaybackUrl(lesson.videoPlaybackId);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Video unavailable" }, { status: 503 });
  }
}
