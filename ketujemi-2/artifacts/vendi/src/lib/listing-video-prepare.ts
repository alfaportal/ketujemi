import type { FFmpeg } from "@ffmpeg/ffmpeg";

export const LISTING_VIDEO_MAX_MB = 100;
export const LISTING_VIDEO_MAX_BYTES = LISTING_VIDEO_MAX_MB * 1024 * 1024;

/** Max long edge for listing video (Full HD). */
export const LISTING_VIDEO_MAX_EDGE = 1920;

const MIN_VIDEO_BITRATE = 450_000;
const AUDIO_BITRATE = 96_000;
const OUTPUT_HEADROOM = 0.9;
const FFMPEG_CORE_VERSION = "0.12.10";

export type ListingVideoMetadata = {
  durationSec: number;
  width: number;
  height: number;
};

export type VideoPrepareProgress = (percent: number) => void;

const METADATA_TIMEOUT_MS = 12_000;

export async function readListingVideoMetadata(file: File): Promise<ListingVideoMetadata> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error("video_metadata_timeout"));
      }, METADATA_TIMEOUT_MS);
      const cleanup = () => {
        window.clearTimeout(timer);
        video.onloadedmetadata = null;
        video.onerror = null;
      };
      video.onloadedmetadata = () => {
        cleanup();
        resolve();
      };
      video.onerror = () => {
        cleanup();
        reject(new Error("video_metadata_failed"));
      };
      video.src = url;
      video.load();
    });
    const durationSec =
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    return {
      durationSec,
      width: video.videoWidth || 0,
      height: video.videoHeight || 0,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Smallest realistic output size at minimum quality. */
export function minimumVideoBytesForDuration(durationSec: number): number {
  if (durationSec <= 0) return Number.POSITIVE_INFINITY;
  return Math.ceil((durationSec * (MIN_VIDEO_BITRATE + AUDIO_BITRATE)) / 8);
}

export function canVideoFitAfterCompression(durationSec: number): boolean {
  return minimumVideoBytesForDuration(durationSec) <= LISTING_VIDEO_MAX_BYTES;
}

function outputFileName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "").trim() || "video";
  return `${base}.mp4`;
}

function inputFileName(file: File): string {
  const m = file.name.match(/\.(mp4|mov|avi|m4v|3gp|3gpp|webm|mkv)$/i);
  if (m) {
    const ext = m[1]!.toLowerCase();
    if (ext === "3gpp") return "input.3gp";
    return `input.${ext}`;
  }
  const mime = file.type?.toLowerCase() ?? "";
  if (mime.includes("quicktime")) return "input.mov";
  if (mime.includes("msvideo") || mime.includes("avi")) return "input.avi";
  if (mime.includes("3gpp") || mime.includes("3gp")) return "input.3gp";
  if (mime.includes("webm")) return "input.webm";
  if (mime.includes("matroska") || mime.includes("mkv")) return "input.mkv";
  return "input.mp4";
}

function needsVideoPrepare(file: File, meta: ListingVideoMetadata): boolean {
  if (file.size > LISTING_VIDEO_MAX_BYTES) return true;
  const maxEdge = Math.max(meta.width, meta.height);
  return maxEdge > LISTING_VIDEO_MAX_EDGE;
}

function targetVideoBitrate(durationSec: number, scale = 1): number {
  const budget = LISTING_VIDEO_MAX_BYTES * OUTPUT_HEADROOM;
  const audioBytes = (AUDIO_BITRATE * durationSec) / 8;
  const videoBytes = Math.max(0, budget - audioBytes);
  let bps = Math.floor((videoBytes * 8) / durationSec);
  bps = Math.floor(bps * scale);
  return Math.max(MIN_VIDEO_BITRATE, Math.min(bps, 12_000_000));
}

let ffmpegReady: Promise<FFmpeg> | null = null;

function resetFfmpegLoader(): void {
  ffmpegReady = null;
}

async function loadFfmpeg(onProgress?: VideoPrepareProgress): Promise<FFmpeg> {
  if (!ffmpegReady) {
    ffmpegReady = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      if (onProgress) {
        ffmpeg.on("progress", ({ progress }) => {
          onProgress(Math.min(99, Math.round(Math.max(0, progress) * 100)));
        });
      }
      const base = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`;
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return ffmpeg;
    })();
  }
  try {
    return await ffmpegReady;
  } catch (err) {
    resetFfmpegLoader();
    throw err;
  }
}

async function transcodeToMp4(
  file: File,
  meta: ListingVideoMetadata,
  onProgress?: VideoPrepareProgress,
): Promise<File> {
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await loadFfmpeg(onProgress);
  const inName = inputFileName(file);
  await ffmpeg.writeFile(inName, await fetchFile(file));

  const bitrateScales = [1, 0.85, 0.7, 0.55];
  let lastBlob: Blob | null = null;

  for (const scale of bitrateScales) {
    const vBitrate = targetVideoBitrate(meta.durationSec, scale);
    const vK = Math.max(1, Math.round(vBitrate / 1000));
    const aK = Math.round(AUDIO_BITRATE / 1000);

    try {
      await ffmpeg.deleteFile("output.mp4");
    } catch {
      /* first pass */
    }

    await ffmpeg.exec([
      "-y",
      "-i",
      inName,
      "-vf",
      `scale=${LISTING_VIDEO_MAX_EDGE}:${1080}:force_original_aspect_ratio=decrease`,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-pix_fmt",
      "yuv420p",
      "-b:v",
      `${vK}k`,
      "-maxrate",
      `${vK}k`,
      "-bufsize",
      `${vK * 2}k`,
      "-c:a",
      "aac",
      "-b:a",
      `${aK}k`,
      "-movflags",
      "+faststart",
      "output.mp4",
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    const bytes =
      data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
    lastBlob = new Blob([bytes], { type: "video/mp4" });
    if (lastBlob.size <= LISTING_VIDEO_MAX_BYTES) {
      onProgress?.(100);
      return new File([lastBlob], outputFileName(file.name), { type: "video/mp4" });
    }
  }

  if (lastBlob && lastBlob.size > LISTING_VIDEO_MAX_BYTES) {
    throw new Error("video_shorten_needed");
  }
  resetFfmpegLoader();
  throw new Error("video_prepare_failed");
}

/** Upload original when browser/ffmpeg cannot transcode but file already fits. */
function canUploadOriginalWithoutPrepare(file: File): boolean {
  return file.size > 0 && file.size <= LISTING_VIDEO_MAX_BYTES;
}

/**
 * Accept any allowed listing video (incl. large Full HD / 4K).
 * Compresses to ≤100 MB when needed; throws video_shorten_needed if too long.
 */
export async function prepareListingVideoFile(
  file: File,
  onProgress?: VideoPrepareProgress,
): Promise<File> {
  let meta: ListingVideoMetadata;
  try {
    meta = await readListingVideoMetadata(file);
  } catch {
    if (canUploadOriginalWithoutPrepare(file)) return file;
    throw new Error("video_metadata_failed");
  }

  if (meta.durationSec <= 0) {
    if (canUploadOriginalWithoutPrepare(file)) return file;
    throw new Error("video_metadata_failed");
  }

  if (!canVideoFitAfterCompression(meta.durationSec)) {
    throw new Error("video_shorten_needed");
  }

  if (!needsVideoPrepare(file, meta)) {
    return file;
  }

  try {
    onProgress?.(0);
    return await transcodeToMp4(file, meta, onProgress);
  } catch (err) {
    if (err instanceof Error && err.message === "video_shorten_needed") throw err;
    if (canUploadOriginalWithoutPrepare(file)) {
      resetFfmpegLoader();
      return file;
    }
    if (err instanceof Error) throw err;
    throw new Error("video_prepare_failed");
  }
}

export function listingVideoShortenMessage(uiLang: string): { title: string; description: string } {
  const mb = String(LISTING_VIDEO_MAX_MB);
  switch (uiLang) {
    case "mk":
      return {
        title: "Видеото е премногу долго",
        description: `Не може да се спушти под ${mb} MB. Скратете ја видеото на телефонот и обидете се повторно.`,
      };
    case "mne":
      return {
        title: "Video je predugačko",
        description: `Ne može se smanjiti ispod ${mb} MB. Skratite video na telefonu i pokušajte ponovo.`,
      };
    case "en":
      return {
        title: "Video is too long",
        description: `It cannot be compressed below ${mb} MB. Shorten the video on your phone and try again.`,
      };
    default:
      return {
        title: "Videoja është shumë e gjatë",
        description: `Nuk mund të përshtatet nën ${mb} MB. Shkurtojeni videon në telefon dhe provoni përsëri.`,
      };
  }
}
