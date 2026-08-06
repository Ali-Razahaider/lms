"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";

export function LessonVideoPlayer({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/media/${courseId}/${lessonId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.url) setUrl(data.url);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  if (!url) {
    return <div className="aspect-video w-full animate-pulse rounded-2xl bg-foreground/10" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
      <MuxPlayer
        src={url}
        playbackRates={[0.75, 1, 1.25, 1.5, 2]}
        className="aspect-video w-full"
      />
    </div>
  );
}
