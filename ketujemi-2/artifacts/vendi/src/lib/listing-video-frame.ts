import { fileToVisionBase64 } from "./listing-image-prepare";

const FRAME_TIMEOUT_MS = 15_000;

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

/** Grab one JPEG frame from a listing video for AI category/title/description analysis. */
export async function captureListingVideoFrameFile(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await waitForVideoEvent(video, "loadedmetadata", FRAME_TIMEOUT_MS);
    const duration =
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const seekTo =
      duration > 0 ? Math.min(Math.max(duration * 0.12, 0.25), duration - 0.05) : 0;

    video.currentTime = seekTo;
    await waitForVideoEvent(video, "seeked", FRAME_TIMEOUT_MS);

    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      await waitForVideoEvent(video, "loadeddata", FRAME_TIMEOUT_MS);
    }

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 360;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas_unavailable");
    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("video_frame_encode_failed"))),
        "image/jpeg",
        0.88,
      );
    });

    const base = file.name.replace(/\.[^.]+$/, "").trim() || "video";
    return new File([blob], `${base}-frame.jpg`, { type: "image/jpeg" });
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}

/** Vision payload from a video file (single frame). */
export async function videoFileToVisionBase64(
  file: File,
): Promise<{ data: string; mediaType: string }> {
  const frame = await captureListingVideoFrameFile(file);
  return fileToVisionBase64(frame);
}
