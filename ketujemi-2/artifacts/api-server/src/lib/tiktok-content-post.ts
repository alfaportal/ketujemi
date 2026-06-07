import { logger } from "./logger";

function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

export function isTikTokContentPostConfigured(): boolean {
  const flag = trimEnv("TIKTOK_AUTO_POST_ENABLED").toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return !!trimEnv("TIKTOK_CONTENT_ACCESS_TOKEN");
}

async function pollTikTokPublishStatus(
  publishId: string,
  accessToken: string,
): Promise<{ ok: boolean; error?: string }> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ publish_id: publishId }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      data?: { status?: string; fail_reason?: string };
      error?: { message?: string; code?: string };
    };

    const status = json.data?.status;
    if (status === "PUBLISH_COMPLETE") return { ok: true };
    if (status === "FAILED") {
      return { ok: false, error: json.data?.fail_reason ?? "publish_failed" };
    }
    if (!res.ok) {
      return { ok: false, error: json.error?.message ?? `HTTP ${res.status}` };
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return { ok: false, error: "publish_timeout" };
}

/** Post a Reel MP4 to TikTok via Content Posting API (pull from URL). */
export async function postVideoToTikTok(
  videoUrl: string,
  title: string,
): Promise<{ publishId: string | null; error?: string }> {
  if (!isTikTokContentPostConfigured()) {
    return { publishId: null, error: "not_configured" };
  }

  const accessToken = trimEnv("TIKTOK_CONTENT_ACCESS_TOKEN");
  const caption = title.trim().slice(0, 150) || "KëtuJemi.com — shpallje të reja";

  try {
    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: caption,
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl,
        },
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      data?: { publish_id?: string };
      error?: { message?: string; code?: string };
    };

    const publishId = json.data?.publish_id ?? null;
    if (!res.ok || !publishId) {
      const err = json.error?.message ?? `HTTP ${res.status}`;
      logger.error({ status: res.status, tiktok: json }, "tiktok reel init failed");
      return { publishId: null, error: err };
    }

    const polled = await pollTikTokPublishStatus(publishId, accessToken);
    if (!polled.ok) {
      logger.warn({ publishId, error: polled.error }, "tiktok reel publish failed");
      return { publishId, error: polled.error };
    }

    logger.info({ publishId }, "tiktok reel published");
    return { publishId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "tiktok reel post error");
    return { publishId: null, error: message };
  }
}
