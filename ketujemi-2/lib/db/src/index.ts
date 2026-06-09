import "./load-env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function databasePoolMax(): number {
  const raw = Number(process.env.DATABASE_POOL_MAX);
  if (Number.isFinite(raw) && raw >= 2 && raw <= 30) return Math.floor(raw);
  return process.env.NODE_ENV === "production" ? 8 : 10;
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: databasePoolMax(),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
export const db = drizzle(pool, { schema });

export { ensureWalletSchema } from "./ensure-wallet-schema.js";
export { ensureFiscalSchema } from "./ensure-fiscal-schema.js";
export { ensureOAuthSchema } from "./ensure-oauth-schema.js";
export { ensureListingUserSchema } from "./ensure-listing-user-schema.js";
export { ensureListingFbPostedSchema } from "./ensure-listing-fb-posted-schema.js";
export { ensureListingShopSchema } from "./ensure-listing-shop-schema.js";
export { ensureHomepagePartnersSchema } from "./ensure-homepage-partners-schema.js";
export { ensureSportOutdoorTypeCategories } from "./ensure-sport-outdoor-types.js";
export { ensureNdertimInstalimeTypeCategories } from "./ensure-ndertim-instalime-types.js";
export { ensureFemijeCategoryImages } from "./ensure-femije-category-images.js";
export { ensureEngagementNotificationsSchema } from "./ensure-engagement-notifications-schema.js";
export { ensureSocialFollowersSchema } from "./ensure-social-followers-schema.js";
export { ensureSocialReelPostsSchema } from "./ensure-social-reel-posts-schema.js";
export { ensureSocialPlatformTokensSchema } from "./ensure-social-platform-tokens-schema.js";
export { ensureUserSocialConnectionsSchema } from "./ensure-user-social-connections-schema.js";
export { ensureProfileChangeSchema } from "./ensure-profile-change-schema.js";
export { ensurePhoneVerifySchema } from "./ensure-phone-verify-schema.js";
export { ensureAdminLoginSchema } from "./ensure-admin-login-schema.js";
export { ensureShopSchema } from "./ensure-shop-schema.js";
export { ensureShopSocialProfileSchema } from "./ensure-shop-social-profile-schema.js";
export { ensureDeletionFeedbackSchema } from "./ensure-deletion-feedback-schema.js";
export { ensureFacebookDataDeletionSchema } from "./ensure-facebook-data-deletion-schema.js";
export {
  ensureShopDirectoryTaxonomy,
  ensureShopDirectoryTaxonomyTables,
  seedShopDirectoryTaxonomy,
  type ShopDirectorySeedCategory,
} from "./ensure-shop-directory-taxonomy.js";

export * from "./schema";
