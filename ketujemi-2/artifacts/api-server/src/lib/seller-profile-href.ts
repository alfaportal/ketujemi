import { db, shopsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isBusinessAccount } from "./business-rules";
import { shopPublicPath } from "./shop-slug.js";

/** Public route for a seller's listings — reuses existing pages, no dedicated private profile. */
export async function resolveSellerProfileHref(input: {
  user_id: number | null;
  shop_id: number | null;
}): Promise<string | null> {
  if (input.shop_id != null && input.shop_id > 0) {
    const [shop] = await db
      .select({ id: shopsTable.id, slug: shopsTable.slug })
      .from(shopsTable)
      .where(eq(shopsTable.id, input.shop_id))
      .limit(1);
    return shopPublicPath(shop?.slug, input.shop_id);
  }
  const userId = input.user_id;
  if (userId == null || userId < 1) return null;

  const [user] = await db
    .select({ account_type: usersTable.account_type })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (user && isBusinessAccount(user)) {
    return `/biznes/${userId}`;
  }

  return `/listings?user_id=${userId}`;
}
