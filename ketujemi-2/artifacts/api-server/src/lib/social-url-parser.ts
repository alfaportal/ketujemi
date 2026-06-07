export type ParsedSocialUrl = {
  platform: "instagram" | "tiktok";
  handle: string;
  profileUrl: string;
  sourceUrl: string;
};

function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

export function parseInstagramUrl(input: string | null | undefined): ParsedSocialUrl | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  let handle = "";
  let profileUrl = "";

  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      const host = url.hostname.replace(/^www\./, "").toLowerCase();
      if (!host.includes("instagram.com")) return null;
      const parts = url.pathname.split("/").filter(Boolean);
      const first = parts[0]?.toLowerCase();
      if (!first || ["p", "reel", "reels", "stories", "explore"].includes(first)) return null;
      handle = normalizeHandle(first);
      profileUrl = `https://www.instagram.com/${handle}/`;
    } else {
      handle = normalizeHandle(raw);
      if (!handle) return null;
      profileUrl = `https://www.instagram.com/${handle}/`;
    }
  } catch {
    handle = normalizeHandle(raw.replace(/^@/, ""));
    if (!handle) return null;
    profileUrl = `https://www.instagram.com/${handle}/`;
  }

  if (!/^[a-z0-9._]{1,30}$/.test(handle)) return null;
  return { platform: "instagram", handle, profileUrl, sourceUrl: raw };
}

export function parseTikTokUrl(input: string | null | undefined): ParsedSocialUrl | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  let handle = "";
  let profileUrl = "";

  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      const host = url.hostname.replace(/^www\./, "").toLowerCase();
      if (!host.includes("tiktok.com")) return null;
      const parts = url.pathname.split("/").filter(Boolean);
      const atIdx = parts.findIndex((p) => p.startsWith("@"));
      if (atIdx >= 0) {
        handle = normalizeHandle(parts[atIdx]!);
      } else if (parts[0]?.toLowerCase() === "@" || parts[0]?.startsWith("@")) {
        handle = normalizeHandle(parts[0]);
      } else {
        const userPart = parts.find((p) => p.startsWith("@"));
        handle = userPart ? normalizeHandle(userPart) : "";
      }
      if (!handle) return null;
      profileUrl = `https://www.tiktok.com/@${handle}`;
    } else {
      handle = normalizeHandle(raw);
      if (!handle) return null;
      profileUrl = `https://www.tiktok.com/@${handle}`;
    }
  } catch {
    handle = normalizeHandle(raw.replace(/^@/, ""));
    if (!handle) return null;
    profileUrl = `https://www.tiktok.com/@${handle}`;
  }

  if (!/^[a-z0-9._]{1,32}$/.test(handle)) return null;
  return { platform: "tiktok", handle, profileUrl, sourceUrl: raw };
}

export function handlesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = normalizeHandle(String(a ?? ""));
  const right = normalizeHandle(String(b ?? ""));
  return Boolean(left && right && left === right);
}
