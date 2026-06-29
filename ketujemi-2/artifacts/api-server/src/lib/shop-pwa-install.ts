import { db, shopsTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isShopPubliclyVisible } from "./shop-visibility.js";
import { shouldCountView, viewDedupKey } from "./view-dedup.js";

export type IncrementShopPwaInstallOptions = {
  viewer?: User | null;
  clientIp?: string;
};

/** Increment PWA install counter when a visitor adds the shop app to their device. */
export async function incrementShopPwaInstall(
  shopId: number,
  options: IncrementShopPwaInstallOptions = {},
): Promise<{ ok: true; pwa_installs: number; counted: boolean } | { ok: false; status: 404 | 400 }> {
  const viewer = options.viewer ?? null;
  const clientIp = options.clientIp ?? "unknown";

  if (!Number.isFinite(shopId) || shopId <= 0) {
    return { ok: false, status: 400 };
  }

  const [row] = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.id, shopId))
    .limit(1);

  if (!row || !isShopPubliclyVisible(row)) {
    return { ok: false, status: 404 };
  }

  const dedupKey = viewDedupKey("shop-pwa", shopId, clientIp, viewer?.id);
  const counted = shouldCountView(dedupKey);

  if (!counted) {
    return { ok: true, pwa_installs: row.pwa_installs ?? 0, counted: false };
  }

  const [updated] = await db
    .update(shopsTable)
    .set({ pwa_installs: (row.pwa_installs ?? 0) + 1 })
    .where(eq(shopsTable.id, shopId))
    .returning({ pwa_installs: shopsTable.pwa_installs });

  return {
    ok: true,
    pwa_installs: updated?.pwa_installs ?? (row.pwa_installs ?? 0) + 1,
    counted: true,
  };
}
