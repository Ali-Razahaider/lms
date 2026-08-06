import { Mux } from "@mux/mux-node";
import { appUrl } from "@/lib/stripe";

/**
 * Mux client. Reads MUX_TOKEN_ID / MUX_TOKEN_SECRET from env
 * automatically. Returns null when not configured (so local
 * dev without keys still boots).
 */
export function getMux(): Mux | null {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    return null;
  }
  return new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
    jwtSigningKey: process.env.MUX_SIGNING_KEY ?? null,
    jwtPrivateKey: process.env.MUX_PRIVATE_KEY ?? null,
  });
}

/** True when Mux is configured AND signing is possible. */
export function muxConfigured(): boolean {
  return Boolean(
    getMux() &&
      process.env.MUX_SIGNING_KEY &&
      process.env.MUX_PRIVATE_KEY
  );
}

/**
 * Create a Mux direct upload for a lesson. The browser PUTs the file
 * straight to `upload.url` (no server bandwidth); Mux transcodes it
 * and emits `video.upload.asset_ready` (with our passthrough) so the
 * webhook can mark the lesson READY.
 *
 * playback_policy "signed" = the HLS URL is only playable with a
 * short-lived JWT we mint per-request in /api/media.
 */
export async function createDirectUpload(lessonId: string) {
  const mux = getMux();
  if (!mux) throw new Error("Mux is not configured.");

  const upload = await mux.video.uploads.create({
    cors_origin: appUrl(),
    new_asset_settings: {
      playback_policy: ["signed"],
      passthrough: `lesson:${lessonId}`,
    },
  });

  return { uploadId: upload.id, uploadUrl: upload.url };
}

/** Short-lived signed playback URL for an asset's playback id. */
export async function signedPlaybackUrl(playbackId: string): Promise<string> {
  const mux = getMux();
  if (!mux) throw new Error("Mux is not configured.");

  const token = await mux.jwt.signPlaybackId(playbackId, {
    type: "video",
    expiration: "2h",
  });
  return `https://stream.mux.com/${playbackId}.m3u8?token=${encodeURIComponent(token)}`;
}
