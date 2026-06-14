import { shopsTable } from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";

export function isShopPubliclyVisible(
  shop: Pick<typeof shopsTable.$inferSelect, "is_active" | "deleted_at">,
): boolean {
  return shop.is_active && shop.deleted_at == null;
}

export function activeShopSqlCondition() {
  return and(eq(shopsTable.is_active, true), isNull(shopsTable.deleted_at));
}
