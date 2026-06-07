import { logger } from "./logger.js";

const CHECK_TIMEOUT_MS = 12_000;

/** Silent background check — HEAD first, GET fallback. */
export async function checkProfileUrlExists(profileUrl: string): Promise<boolean> {
  const url = profileUrl.trim();
  if (!url) return false;

  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      headers: { "User-Agent": "KetuJemi/1.0 (profile-check)" },
    });
    if (head.ok) return true;
    if (head.status === 405 || head.status === 501) {
      const get = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
        headers: { "User-Agent": "KetuJemi/1.0 (profile-check)" },
      });
      return get.ok;
    }
    return false;
  } catch (err) {
    logger.debug({ err, profileUrl }, "social profile HTTP check failed");
    return false;
  }
}
