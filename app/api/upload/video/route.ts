import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDirectUpload } from "@/lib/mux";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // 1. Identity + role.
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.user.role !== "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 2. Form fields (file kept for size/type validation).
  const form = await request.formData();
  const file = form.get("file");
  const courseId = form.get("courseId");
  const lessonId = form.get("lessonId");

  if (!(file instanceof File) || typeof courseId !== "string" || typeof lessonId !== "string") {
    return NextResponse.json({ error: "Missing file, courseId or lessonId" }, { status: 400 });
  }

  // 3. Lesson must exist and belong to this teacher.
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId, course: { teacherId: session.user.id } },
    select: { id: true },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  // 4. Type + size checks (same caps as before).
  const allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Only MP4, WebM, OGG, and MOV videos are allowed." }, { status: 400 });
  }
  if (file.size > 500 * 1024 * 1024) {
    return NextResponse.json({ error: "Video must be 500 MB or smaller." }, { status: 400 });
  }

  // 5. Create the Mux direct upload.
  try {
    const { uploadId, uploadUrl } = await createDirectUpload(lessonId);

    // Mark the lesson as uploading so the UI can show progress.
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { videoStatus: "UPLOADING", videoUploadId: uploadId },
    });

    return NextResponse.json({ uploadId, uploadUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/upload/video?lessonId=… — detach a video from a lesson.
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.user.role !== "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const lessonId = new URL(request.url).searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, course: { teacherId: session.user.id } },
    select: { id: true },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  await prisma.lesson.update({
    where: { id: lesson.id },
    data: { videoStatus: "NONE", videoUploadId: null, videoPlaybackId: null },
  });

  return NextResponse.json({ ok: true });
}
