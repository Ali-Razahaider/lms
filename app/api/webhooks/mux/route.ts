import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMux } from "@/lib/mux";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const mux = getMux();
  const secret = process.env.MUX_WEBHOOK_SECRET;

  if (!mux || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  let event;
  try {
    event = await mux.webhooks.unwrap(body, headers, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "video.asset.ready" || event.type === "video.upload.asset_created") {
    const data = event.data as {
      passthrough?: string;
      playback_ids?: Array<{ id: string }>;
    };

    const playbackId = data.playback_ids?.[0]?.id;
    const match = data.passthrough?.match(/^lesson:(.+)$/);
    const lessonId = match?.[1];

    if (lessonId && playbackId) {
      const lesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: { videoStatus: "READY", videoPlaybackId: playbackId },
        select: { courseId: true },
      });
      revalidatePath(`/courses/${lesson.courseId}`);
      revalidatePath(`/courses/${lesson.courseId}/lessons/${lessonId}`);
      revalidatePath(`/dashboard/courses/${lesson.courseId}`);
    }
  }

  return NextResponse.json({ received: true });
}
