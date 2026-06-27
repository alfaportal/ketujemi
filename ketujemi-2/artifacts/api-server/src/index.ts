import app from "./app";
import {
  ensureFiscalSchema,
  ensureHomepagePartnersSchema,
  ensureListingUserSchema,
  ensureListingFbPostedSchema,
  ensureListingShopSchema,
  ensureOAuthSchema,
  ensureEngagementNotificationsSchema,
  ensureShopSchema,
  ensureShopDirectoryTaxonomy,
  ensureFemijeCategoryImages,
  ensureSportOutdoorTypeCategories,
  ensureNdertimInstalimeTypeCategories,
  ensureSocialFollowersSchema,
  ensureSocialReelPostsSchema,
  ensureSocialPlatformTokensSchema,
  ensureUserSocialConnectionsSchema,
  ensureProfileChangeSchema,
  ensurePhoneVerifySchema,
  ensureEmailVerifySchema,
  ensureAdminLoginSchema,
  ensureShopSocialProfileSchema,
  ensureDeletionFeedbackSchema,
  ensureFacebookDataDeletionSchema,
  ensureAnnouncementCampaignsSchema,
  ensureUserLastActiveSchema,
  ensureWalletSchema,
  pool,
} from "@workspace/db";
import { logger } from "./lib/logger";
import { logPaymentStackReadiness } from "./lib/payment-policy";
import { vonageConfigSummary } from "./lib/vonage-auth";
import { startExpiredListingsScheduler } from "./lib/expire-listings-job";
import { startExpiryReminderScheduler } from "./lib/listing-expiry-reminders";
import { startFacebookScheduledPostCron } from "./lib/facebook-scheduled-post-cron";
import { startInstagramScheduledPostCron } from "./lib/instagram-scheduled-post-cron";
import { startSocialFollowersCron } from "./lib/social-followers-cron";
import { startShopSocialProfileEnrichCron } from "./lib/shop-social-profile-enrich-cron";
import { startListingReelCron } from "./lib/listing-reel-cron";
import { purgeInvalidListingImagesOnStartup } from "./lib/purge-invalid-listing-images.js";
import { startSystemMonitor } from "./lib/system-monitor.js";
import { startViewsDailyIncrementCron } from "./lib/views-daily-cron.js";
import {
  inlineHeavyCronsEnabled,
  inlineMaintenanceCronsEnabled,
} from "./lib/inline-crons";
import {
  isFacebookScheduledPostEnabled,
  isInstagramScheduledPostEnabled,
} from "./lib/social-post-flags";

const rawPort = process.env["API_PORT"] ?? process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function startServer(): Promise<void> {
  try {
    await ensureWalletSchema(pool);
    logger.info("Wallet schema verified (wallet_balance_cents)");
    await ensureFiscalSchema(pool);
    logger.info("Fiscal schema verified (fiscal_receipts)");
    await ensureOAuthSchema(pool);
    logger.info(
      "OAuth schema verified (facebook_user_id, google_user_id, instagram_user_id, tiktok_user_id)",
    );
    await ensureListingUserSchema(pool);
    logger.info("Listing user_id + self-duplicate alerts schema verified");
    await ensureListingFbPostedSchema(pool);
    logger.info("Listing fb_posted + ig_posted schema verified");
    await ensureListingShopSchema(pool);
    logger.info("Listing shop_id schema verified");
    await ensureEngagementNotificationsSchema(pool);
    logger.info("Engagement notifications schema verified (user_notifications, FCM tokens)");
    await ensureHomepagePartnersSchema(pool);
    logger.info("Homepage partners schema verified (homepage_partners)");
    await ensureShopSchema(pool);
    logger.info("Shop schema verified (shop_applications, shops)");
    const { SHOP_DIRECTORY_CATEGORIES } = await import("../../../lib/shop-directory-taxonomy.js");
    const { SHOP_DIRECTORY_CATEGORY_IMAGE_URLS } = await import(
      "../../../lib/shop-directory-category-images.js"
    );
    await ensureShopDirectoryTaxonomy(
      pool,
      SHOP_DIRECTORY_CATEGORIES.map((cat) => ({
        slug: cat.slug,
        emoji: cat.emoji,
        nameSq: cat.nameSq,
        imageUrl: SHOP_DIRECTORY_CATEGORY_IMAGE_URLS[cat.slug],
        subcategories: cat.subcategories,
      })),
    );
    logger.info("Shop directory taxonomy seeded (15 categories + subcategories)");
    const { syncShopDirectoryFieldsFromApplications } = await import("./lib/shop-directory-sync.js");
    await syncShopDirectoryFieldsFromApplications().catch((err) => {
      logger.warn({ err }, "shop directory slug backfill on startup failed (will retry on /dyqanet)");
    });
    const { reconcileShopListingAssignmentsOnBoot } = await import("./lib/shop-listing-lookup.js");
    await reconcileShopListingAssignmentsOnBoot();
    logger.info("Shop listing shop_id reconcile completed");
    await ensureSportOutdoorTypeCategories(pool);
    logger.info("Sport & Outdoor type subcategories verified (sport-type-*)");
    await ensureNdertimInstalimeTypeCategories(pool);
    logger.info("Ndërtim & Instalime type subcategories verified (ndertim-type-*)");
    await ensureFemijeCategoryImages(pool);
    logger.info("Fëmijë category thumbnails synced (groups + leaves)");
    await ensureSocialFollowersSchema(pool);
    logger.info("Social followers schema verified (social_followers)");
    await ensureSocialReelPostsSchema(pool);
    logger.info("Social reel posts schema verified (social_reel_posts)");
    await ensureSocialPlatformTokensSchema(pool);
    logger.info("Social platform tokens schema verified (social_platform_tokens)");
    await ensureUserSocialConnectionsSchema(pool);
    logger.info("User social connections schema verified (user_social_connections)");
    await ensureProfileChangeSchema(pool);
    logger.info("Profile change verify schema verified (profile_change_challenges, profile_change_tokens)");
    await ensurePhoneVerifySchema(pool);
    logger.info("Phone verify schema verified (phone_verify_challenges.fail_count, otp_code_hash)");
    await ensureEmailVerifySchema(pool);
    logger.info("Email verify schema verified (email_verify_challenges)");
    await ensureAdminLoginSchema(pool);
    logger.info("Admin login schema verified (admin_login_challenges)");
    await ensureShopSocialProfileSchema(pool);
    logger.info("Shop social profile enrichments schema verified");
    await ensureDeletionFeedbackSchema(pool);
    logger.info("Deletion feedback schema verified (deletion_feedback, users.deleted_at, shops.deleted_at)");
    await ensureFacebookDataDeletionSchema(pool);
    logger.info("Facebook data deletion schema verified (facebook_data_deletion_requests)");
    await ensureAnnouncementCampaignsSchema(pool);
    logger.info("Announcement campaigns schema verified (announcement_campaigns, marketing_email_opt_out)");
    await ensureUserLastActiveSchema(pool);
    logger.info("User last_active_at schema verified");
    if (process.env.NODE_ENV === "production") {
      setTimeout(() => {
        void purgeInvalidListingImagesOnStartup().catch((err) => {
          logger.error({ err }, "purgeInvalidListingImagesOnStartup failed (deferred)");
        });
      }, 90_000);
    } else {
      await purgeInvalidListingImagesOnStartup();
    }
    logPaymentStackReadiness(logger);
    logger.info(vonageConfigSummary(), "vonage sms config (masked)");
    if (isFacebookScheduledPostEnabled() || isInstagramScheduledPostEnabled()) {
      const { initializeFacebookPageAccessToken } = await import("./services/socialMedia.js");
      await initializeFacebookPageAccessToken();
    } else {
      logger.info("Skipping Meta token init — FB/IG auto-post disabled");
    }
    const { logFacebookOAuthStartupDiagnostics } = await import("./lib/facebook-oauth-health.js");
    await logFacebookOAuthStartupDiagnostics();
    const { startJobQueueWorkers } = await import("./queues/jobQueue.js");
    startJobQueueWorkers();
  } catch (err) {
    logger.error({ err }, "Database schema migration failed");
    if (process.env.NODE_ENV === "production") {
      logger.warn(
        "Continuing startup so Railway health check and static files can respond. Fix DATABASE_URL if API calls fail.",
      );
    } else {
      process.exit(1);
    }
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
    if (inlineMaintenanceCronsEnabled()) {
      startExpiredListingsScheduler();
      startExpiryReminderScheduler();
      startViewsDailyIncrementCron();
      logger.info(
        "Inline maintenance crons started (purge expired + expiry reminders + views daily)",
      );
    } else {
      logger.info(
        "Inline maintenance crons off — use POST /api/cron/maintenance with CRON_SECRET",
      );
    }
    if (inlineHeavyCronsEnabled()) {
      startFacebookScheduledPostCron();
      startInstagramScheduledPostCron();
      startListingReelCron();
      startSocialFollowersCron();
      startShopSocialProfileEnrichCron();
      startSystemMonitor();
      logger.info("Inline heavy crons started (social, reel, monitor)");
    } else {
      logger.info(
        "Inline heavy crons off in production — web API stays lean under traffic",
      );
    }
  });
}

void startServer();
