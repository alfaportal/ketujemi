/** Max listing photo edge for public upload (good quality, small file). */
export const LISTING_UPLOAD_MAX_EDGE = 1600;
/** Max JPEG bytes sent to storage (B2 / Cloudinary). */
export const LISTING_UPLOAD_MAX_BYTES = 2_500_000;

/** Vision API payload — small JPEG, never the user's raw multi‑MB file. */
const VISION_MAX_EDGE = 768;
const VISION_MAX_BYTES = 380_000;

async function loadImageSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file);
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function sourceSize(source: ImageBitmap | HTMLImageElement): { w: number; h: number } {
  if (source instanceof ImageBitmap) {
    return { w: source.width, h: source.height };
  }
  return { w: source.naturalWidth, h: source.naturalHeight };
}

function closeSource(source: ImageBitmap | HTMLImageElement): void {
  if (source instanceof ImageBitmap) source.close();
}

function drawToCanvas(
  source: ImageBitmap | HTMLImageElement,
  maxEdge: number,
): HTMLCanvasElement {
  const { w, h } = sourceSize(source);
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const width = Math.max(1, Math.round(w * scale));
  const height = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

async function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
  });
  if (!blob) throw new Error("encode_failed");
  return blob;
}

async function encodeListingJpeg(
  file: File,
  maxEdge: number,
  maxBytes: number,
): Promise<Blob> {
  const source = await loadImageSource(file);
  try {
    const canvas = drawToCanvas(source, maxEdge);
    const qualities = [0.85, 0.75, 0.65, 0.55, 0.45];
    let best: Blob | null = null;

    for (const q of qualities) {
      const blob = await canvasToJpegBlob(canvas, q);
      best = blob;
      if (blob.size <= maxBytes) return blob;
    }

    if (!best) throw new Error("encode_failed");
    return best;
  } finally {
    closeSource(source);
  }
}

function jpegFileName(original: string): string {
  const base = original.replace(/\.[^.]+$/, "").trim() || "photo";
  return `${base}.jpg`;
}

/**
 * Normalize any phone/camera photo to a JPEG ready for listing upload.
 * Users pick any size/format — the app compresses automatically.
 */
export async function prepareListingImageFile(file: File): Promise<File> {
  const blob = await encodeListingJpeg(file, LISTING_UPLOAD_MAX_EDGE, LISTING_UPLOAD_MAX_BYTES);
  return new File([blob], jpegFileName(file.name), { type: "image/jpeg" });
}

/** Small JPEG as base64 for AI vision — independent from the stored photo. */
export async function fileToVisionBase64(
  file: File,
): Promise<{ data: string; mediaType: string }> {
  const blob = await encodeListingJpeg(file, VISION_MAX_EDGE, VISION_MAX_BYTES);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read_failed"));
    reader.readAsDataURL(blob);
  });

  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("bad_image");
  return { mediaType: match[1], data: match[2] };
}
