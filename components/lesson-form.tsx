"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type { LessonFormState } from "@/lib/actions/teacher";

type Props = {
  action: (prev: LessonFormState, formData: FormData) => Promise<LessonFormState>;
  courseId: string;
  lessonId?: string;
  initialValues?: { title: string; content: string };
  initialVideoStatus?: string;
};

export function LessonForm({
  action,
  courseId,
  lessonId,
  initialValues,
  initialVideoStatus,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {
    error: undefined,
    values: initialValues,
  });

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm"
    >
      {state.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={state.values?.title}
          placeholder="e.g. Understanding Closures"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="content" className="block text-sm font-medium">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          defaultValue={state.values?.content}
          placeholder="Write the lesson body here…"
          className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* ── Video ───────────────────────────────────────────── */}
      {lessonId ? (
        <LessonVideo
          courseId={courseId}
          lessonId={lessonId}
          initialStatus={initialVideoStatus}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
          Video upload is available after saving: edit the lesson and add
          one there.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save lesson"}
      </button>
    </form>
  );
}

// ── Video upload & status ────────────────────────────────────
type VideoStatus =
  | "NONE"
  | "UPLOADING"
  | "PROCESSING"
  | "READY"
  | "ERROR";

function LessonVideo({
  courseId,
  lessonId,
  initialStatus,
}: {
  courseId: string;
  lessonId: string;
  initialStatus?: string;
}) {
  const [status, setStatus] = useState<VideoStatus>(
    (initialStatus as VideoStatus) ?? "NONE"
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Once READY, fetch a signed playback URL for the preview player.
  useEffect(() => {
    if (status !== "READY") return;
    let cancelled = false;
    fetch(`/api/media/${courseId}/${lessonId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.url) setSignedUrl(data.url);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId, status]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function pollStatus() {
    try {
      const res = await fetch(`/api/upload/video/status?lessonId=${lessonId}`);
      const data = await res.json();
      if (data.status === "READY") {
        setStatus("READY");
        if (pollRef.current) clearInterval(pollRef.current);
      } else if (data.status === "ERROR") {
        setStatus("ERROR");
        setError("Mux could not process this file.");
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch {
      // Transient network blip — keep polling.
    }
  }

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    setError(null);
    setStatus("UPLOADING");
    setUploadProgress(0);

    try {
      // 1. Ask the server for a signed direct-upload URL.
      const body = new FormData();
      body.append("file", file);
      body.append("courseId", courseId);
      body.append("lessonId", lessonId);

      const res = await fetch("/api/upload/video", { method: "POST", body });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Upload failed");

      // 2. PUT the file straight to Mux with progress.
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", result.uploadUrl);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed"));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      // 3. Poll until Mux finishes transcoding.
      setStatus("PROCESSING");
      pollStatus();
      pollRef.current = setInterval(pollStatus, 4000);
    } catch (e) {
      setStatus("ERROR");
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove() {
    await fetch(`/api/upload/video?lessonId=${lessonId}`, { method: "DELETE" });
    setStatus("NONE");
    setSignedUrl(null);
    setError(null);
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">Lesson video</label>

      {status === "NONE" && (
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg,video/quicktime"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
          className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-border file:bg-primary-soft file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary file:transition-colors hover:file:bg-primary/10"
        />
      )}

      {(status === "UPLOADING" || status === "PROCESSING") && (
        <div className="rounded-lg border border-border bg-foreground/5 p-4">
          <p className="text-sm font-medium">
            {status === "UPLOADING" ? "Uploading…" : "Processing on Mux…"}
          </p>
          {status === "UPLOADING" && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          <p className="mt-2 text-xs text-muted">
            This usually takes a few minutes. This tab can stay open.
          </p>
        </div>
      )}

      {status === "ERROR" && (
        <div className="space-y-2">
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error ?? "Upload failed."}
          </p>
          <button
            type="button"
            onClick={() => setStatus("NONE")}
            className="text-xs font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {status === "READY" && (
        <div className="mt-2 space-y-2">
          {signedUrl ? (
            <MuxPlayer
              src={signedUrl}
              playbackRates={[0.75, 1, 1.25, 1.5, 2]}
              className="aspect-video w-full overflow-hidden rounded-lg bg-black"
            />
          ) : (
            <div className="aspect-video w-full animate-pulse rounded-lg bg-foreground/10" />
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted">Ready to publish</span>
            <button
              type="button"
              onClick={handleRemove}
              className="shrink-0 text-xs font-medium text-red-600 hover:underline"
            >
              Remove video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
