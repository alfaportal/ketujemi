/** Default client fetch timeout (10s). */
export const FETCH_TIMEOUT_MS = 10_000;

/** Vision / Claude image analysis can take 20–45s on mobile networks. */
export const IMAGE_ANALYZE_TIMEOUT_MS = 60_000;

/** Listing video upload to Cloudinary (up to ~100 MB on slow mobile). */
export const VIDEO_UPLOAD_TIMEOUT_MS = 600_000;

export class FetchTimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "FetchTimeoutError";
  }
}

export function isFetchTimeoutError(error: unknown): error is FetchTimeoutError {
  return error instanceof FetchTimeoutError;
}

export function getFetchErrorMessage(error: unknown): string {
  const en =
    typeof window !== "undefined" && localStorage.getItem("vendi_ui_lang") === "en";
  if (isFetchTimeoutError(error)) {
    return en
      ? "Request timed out. Please try again."
      : "Kërkesa vonoi shumë. Provoni përsëri.";
  }
  return en
    ? "Could not reach the server. Please try again."
    : "Lidhja me serverin dështoi. Provoni përsëri.";
}

/**
 * `fetch` with a 10s AbortController timeout.
 * Rejects with {@link FetchTimeoutError} on timeout.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new FetchTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
