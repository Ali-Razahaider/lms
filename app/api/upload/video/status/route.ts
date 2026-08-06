import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMux } from "@/lib/mux";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.user.role !== "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const lessonId = new URL(request.url).searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, course: { teacherId: session.user.id } },
    select: { id: true, videoStatus: true, videoUploadId: true, videoPlaybackId: true },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  // Already ready locally (e.g. webhook already fired).
  if (lesson.videoStatus === "READY") {
    return NextResponse.json({ status: "READY", playbackId: lesson.videoPlaybackId });
  }

  const mux = getMux();
  if (!mux || !lesson.videoUploadId) {
    return NextResponse.json({ status: lesson.videoStatus });
  }

  try {
    const upload = await mux.video.uploads.retrieve(lesson.videoUploadId);

    if (upload.status === "errored" || upload.status === "cancelled") {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { videoStatus: "ERROR" },
      });
      return NextResponse.json({ status: "ERROR" });
    }

    // No asset yet → still transcoding.
    if (!upload.asset_id) {
      return NextResponse.json({ status: "UPLOADING" });
    }

    // Asset exists — grab its playback id (ready once playback_ids exist).
    const asset = await mux.video.assets.retrieve(upload.asset_id);
    const playbackId = asset.playback_ids?.find((p) => p.policy === "signed")?.id;

    if (playbackId) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { videoStatus: "READY", videoPlaybackId: playbackId },
      });
      return NextResponse.json({ status: "READY", playbackId });
    }

    return NextResponse.json({ status: "UPLOADING" });
  } catch {
    return NextResponse.json({ status: lesson.videoStatus });
  }
}
