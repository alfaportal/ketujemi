import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const STAMP_FILES = {
  email: "revolution-invest-vula.png",
  pdf: "revolution-invest-vula-hires.png",
} as const;

function stampSearchRoots(): string[] {
  const roots: string[] = [];
  const staticRoot = process.env.STATIC_ROOT?.trim();
  if (staticRoot) roots.push(staticRoot);

  const here = path.dirname(fileURLToPath(import.meta.url));
  roots.push(path.resolve(here, "../../../../vendi/public"));
  roots.push(path.resolve(process.cwd(), "artifacts/vendi/public"));
  roots.push(path.resolve(process.cwd(), "ketujemi-2/artifacts/vendi/public"));

  return [...new Set(roots)];
}

/** Public URL for email clients that load remote images. */
export function companyStampPublicUrl(
  variant: keyof typeof STAMP_FILES = "email",
  origin?: string,
): string {
  const base = (origin || process.env.PUBLIC_APP_ORIGIN || "https://ketujemi.com").replace(
    /\/$/,
    "",
  );
  return `${base}/assets/${STAMP_FILES[variant]}`;
}

/** Inline base64 — works when STATIC_ROOT or vendi/public is on disk. */
export async function companyStampDataUri(
  variant: keyof typeof STAMP_FILES = "email",
): Promise<string | null> {
  const file = STAMP_FILES[variant];
  for (const root of stampSearchRoots()) {
    const full = path.join(root, "assets", file);
    try {
      const buf = await readFile(full);
      return `data:image/png;base64,${buf.toString("base64")}`;
    } catch {
      // try next root
    }
  }
  return null;
}

/** Hi-res stamp URL for PDF templates (Enternet overlay or future HTML→PDF). */
export function companyStampForPdfUrl(origin?: string): string {
  return companyStampPublicUrl("pdf", origin);
}
