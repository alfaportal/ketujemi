import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isBusinessAccount } from "./business-rules";

/** Public route for a seller's listings — reuses existing pages, no dedicated private profile. */
export async function resolveSellerProfileHref(input: {
  user_id: number | null;
  shop_id: number | null;
}): Promise<string | null> {
  if (input.shop_id != null && input.shop_id > 0) {
    return `/dyqani/${input.shop_id}`;
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
