import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

const STORAGE_PREFIX = "kj-pwa-install:";

function storageKey(shopId: number): string {
  return `${STORAGE_PREFIX}${shopId}`;
}

function alreadyRecorded(shopId: number): boolean {
  try {
    return localStorage.getItem(storageKey(shopId)) === "1";
  } catch {
    return false;
  }
}

function markRecorded(shopId: number): void {
  try {
    localStorage.setItem(storageKey(shopId), "1");
  } catch {
    /* private mode */
  }
}

/** Report that this device installed (or first opened) the shop PWA — once per shop per browser. */
export async function recordShopPwaInstall(
  shopId: number,
  onCount?: (pwaInstalls: number) => void,
): Promise<number | null> {
  if (!Number.isFinite(shopId) || shopId <= 0) return null;
  if (alreadyRecorded(shopId)) return null;

  try {
    const res = await fetchWithTimeout(`/api/shops/${shopId}/pwa-install`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;

    const data = (await res.json().catch(() => ({}))) as { pwa_installs?: number; counted?: boolean };
    if (data.counted !== false) markRecorded(shopId);
    const count = typeof data.pwa_installs === "number" ? data.pwa_installs : null;
    if (count != null) onCount?.(count);
    return count;
  } catch {
    return null;
  }
}
