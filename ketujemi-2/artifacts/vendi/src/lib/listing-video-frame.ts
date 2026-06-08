import { fileToVisionBase64 } from "./listing-image-prepare";

const FRAME_TIMEOUT_MS = 18_000;

function waitForVideoEvent(
  video: HTMLVideoElement,
  event: "loadedmetadata" | "loadeddata" | "seeked",
  timeoutMs: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("video_frame_timeout"));
    }, timeoutMs);
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener(event, onOk);
      video.removeEventListener("error", onErr);
    };
    const onOk = () => {
      cleanup();
      resolve();
    };
    const onErr = () => {
      cleanup();
      reject(new Error("video_frame_failed"));
    };
    video.addEventListener(event, onOk, { once: true });
    video.addEventListener("error", onErr, { once: true });
  });
}

function seekCandidates(duration: number): number[] {
  if (!Number.isFinite(duration) || duration <= 0) return [0];
  const raw = [
    0.15,
    0.5,
    1,
    1.5,
    duration * 0.1,
    duration * 0.22,
    duration * 0.35,
    duration * 0.5,
  ];
  const out = new Set<number>();
  for (const t of raw) {
    const clamped = Math.min(Math.max(t, 0), Math.max(0, duration - 0.08));
    out.add(Math.round(clamped * 100) / 100);
  }
  return [...out].sort((a, b) => a - b);
}

/** Higher = more detail; very low = black/blank frame. */
function frameQualityScore(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;
  const w = Math.min(48, canvas.width);
  const h = Math.min(48, canvas.height);
  const sample = document.createElement("canvas");
  sample.width = w;
  sample.height = h;
  const sctx = sample.getContext("2d", { willReadFrequently: true });
  if (!sctx) return 0;
  sctx.drawImage(canvas, 0, 0, w, h);
  const { data } = sctx.getImageData(0, 0, w, h);
  let sum = 0;
  let sumSq = 0;
  const pixels = w * h;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
    sum += lum;
    sumSq += lum * lum;
  }
  const mean = sum / pixels;
  const variance = sumSq / pixels - mean * mean;
  if (mean < 12) return 0;
  return variance + mean * 0.15;
}

async function settleVideoFrame(video: HTMLVideoElement): Promise<void> {
  try {
    await video.play();
  } catch {
    /* autoplay blocked — still try canvas */
  }
  video.pause();
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function captureFrameBlob(
  video: HTMLVideoElement,
  seekTo: number,
): Promise<{ blob: Blob; score: number } | null> {
  video.currentTime = seekTo;
  try {
    await waitForVideoEvent(video, "seeked", FRAME_TIMEOUT_MS);
  } catch {
    return null;
  }

  await settleVideoFrame(video);

  const width = video.videoWidth || 0;
  const height = video.videoHeight || 0;
  if (width < 8 || height < 8) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, width, height);

  const score = frameQualityScore(canvas);
  if (score <= 0) return null;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9);
  });
  if (!blob || blob.size < 800) return null;
  return { blob, score };
}

async function loadVideoElement(file: File): Promise<HTMLVideoElement> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.preload = "auto";
  video.src = url;

  try {
    await waitForVideoEvent(video, "loadedmetadata", FRAME_TIMEOUT_MS);
    try {
      await waitForVideoEvent(video, "loadeddata", 4000);
    } catch {
      /* optional */
    }
    return video;
  } catch (err) {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
    throw err;
  }
}

function releaseVideoElement(video: HTMLVideoElement): void {
  const src = video.src;
  video.removeAttribute("src");
  video.load();
  if (src.startsWith("blob:")) URL.revokeObjectURL(src);
}

/** Grab the clearest non-black frame from a listing video for AI analysis. */
export async function captureListingVideoFrameFile(file: File): Promise<File> {
  const video = await loadVideoElement(file);
  try {
    const duration =
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const times = seekCandidates(duration);

    let best: { blob: Blob; score: number } | null = null;
    for (const t of times) {
      const captured = await captureFrameBlob(video, t);
      if (!captured) continue;
      if (!best || captured.score > best.score) {
        best = captured;
      }
      if (captured.score > 120) break;
    }

    if (!best) throw new Error("video_frame_blank");

    const base = file.name.replace(/\.[^.]+$/, "").trim() || "video";
    return new File([best.blob], `${base}-frame.jpg`, { type: "image/jpeg" });
  } finally {
    releaseVideoElement(video);
  }
}

/** Vision payload from a video file (best frame). Falls back to transcoded MP4 if needed. */
export async function videoFileToVisionBase64(
  file: File,
): Promise<{ data: string; mediaType: string }> {
  try {
    const frame = await captureListingVideoFrameFile(file);
    return fileToVisionBase64(frame);
  } catch (primaryErr) {
    try {
      const { prepareListingVideoFile } = await import("./listing-video-prepare");
      const prepared = await prepareListingVideoFile(file);
      if (prepared !== file) {
        const frame = await captureListingVideoFrameFile(prepared);
        return fileToVisionBase64(frame);
      }
    } catch {
      /* fall through */
    }
    if (primaryErr instanceof Error) throw primaryErr;
    throw new Error("video_frame_failed");
  }
}
