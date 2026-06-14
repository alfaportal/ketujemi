/** Client IP for rate limits / view dedup (respects X-Forwarded-For behind Railway). */
export function clientIpFromRequest(req: {
  ip?: string;
  headers: Record<string, unknown>;
}): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.ip ?? "unknown";
}
