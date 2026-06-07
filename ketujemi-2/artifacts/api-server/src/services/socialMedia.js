/**
 * Facebook Page + linked Instagram auto-post (Meta Graph API).
 * Caption language + link path follow listing market (where the seller posted from).
 *
 * On startup, exchanges PAGE_ACCESS_TOKEN for a long-lived Page token and resolves the
 * linked Instagram Business account (@ketujemi.ks). Instagram posts run on a separate
 * cron (30 min after Facebook) with a different caption.
 *
 * Requires PAGE_ID, PAGE_ACCESS_TOKEN, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET (see .env.example).
 */

import { LISTING_LOCATIONS_BY_COUNTRY } from "../lib/listing-locations.js";
import { getCanonicalOrigin } from "../lib/canonical-host.js";
import { parseListingImageUrls } from "../lib/listing-images.js";
import { logger } from "../lib/logger.js";
import { facebookAppId, facebookAppSecret } from "../lib/meta-oauth-config.js";
import {
  categoryFlairLine,
  platformUspLine,
  socialFooterBlock,
} from "../lib/social-post-captions.js";

const GRAPH_API_VERSION = "v25.0";

/** Resolved at startup via Meta token exchange; falls back to PAGE_ACCESS_TOKEN env. */
let memoryPageAccessToken = null;
/** Linked Instagram Business account ID for @ketujemi.ks (from env or Page lookup). */
let memoryInstagramBusinessAccountId = null;
/** @type {{ longLivedUserExpiresAt: string | null; pageTokenExpiresAt: string | null; source: string } | null} */
let pageTokenMeta = null;

const DIASPORA_MARKETS = new Set(["de", "ch", "at", "fr", "it", "gb", "us"]);

const COUNTRY_LABEL_EN = {
  ks: "Kosovo",
  al: "Albania",
  mk: "North Macedonia",
  mne: "Montenegro",
  de: "Germany",
  ch: "Switzerland",
  at: "Austria",
  fr: "France",
  it: "Italy",
  gb: "United Kingdom",
  us: "United States",
};

/**
 * Prefer explicit listing_country from the form; else match city to market list.
 * @param {string | undefined | null} location
 * @param {string | undefined | null} listingCountry
 * @returns {string}
 */
export function resolveListingMarketForSocial(location, listingCountry) {
  const code = String(listingCountry ?? "").trim().toLowerCase();
  if (LISTING_LOCATIONS_BY_COUNTRY[code]) return code;

  const city = String(location ?? "").trim();
  if (city) {
    for (const market of Object.keys(LISTING_LOCATIONS_BY_COUNTRY)) {
      if ((LISTING_LOCATIONS_BY_COUNTRY[market] ?? []).includes(city)) return market;
    }
  }
  return "ks";
}

/**
 * @param {number} id
 * @param {string} title
 */
export function listingSlug(id, title) {
  const slugPart = String(title ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slugPart ? `${id}-${slugPart}` : String(id);
}

/**
 * @param {string} name
 * @param {string} fallback
 */
function categoryHashtag(name, fallback) {
  const tag = String(name ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9\u0400-\u04ff]/g, "");
  return tag ? `#${tag}` : fallback;
}

/**
 * @param {number | string} price
 */
function formatPriceNumber(price) {
  const n = Number(price);
  if (!Number.isFinite(n)) return "0";
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2);
}

/**
 * @param {string} market
 * @param {number | string} price
 */
function formatPriceLine(market, price) {
  const n = formatPriceNumber(price);
  if (market === "al") return `💰 ${n} Lekë`;
  if (market === "mk") return `💰 ${n} ден`;
  if (market === "gb") return `💰 ${n} £`;
  if (market === "ch") return `💰 ${n} CHF`;
  if (market === "us") return `💰 ${n} $`;
  return `💰 ${n} €`;
}

/**
 * @param {string} market
 * @param {{
 *   title: string;
 *   price: number | string;
 *   location: string;
 *   slug: string;
 *   categoryName: string | null;
 * }} input
 */
function locationLine(market, city) {
  if (DIASPORA_MARKETS.has(market)) {
    const country = COUNTRY_LABEL_EN[market] ?? "Kosovo";
    return `📍 ${city}, ${country}`;
  }
  if (market === "al") return `📍 ${city}, Shqipëri`;
  if (market === "mk") return `📍 ${city}, Македонија`;
  if (market === "mne") return `📍 ${city}, Crna Gora`;
  return `📍 ${city}, Kosovë`;
}

function listingPathForMarket(market, slug) {
  if (DIASPORA_MARKETS.has(market)) return `ketujemi.com/en/listing/${slug}`;
  if (market === "al") return `ketujemi.com/al/shpallje/${slug}`;
  if (market === "mk") return `ketujemi.com/mk/oglas/${slug}`;
  if (market === "mne") return `ketujemi.com/mne/oglas/${slug}`;
  return `ketujemi.com/shpallje/${slug}`;
}

function facebookHeadline(market) {
  if (DIASPORA_MARKETS.has(market)) return "⭐ FEATURED ON KetuJemi.com";
  if (market === "mk") return "⭐ ИЗБРАНА ПОНУДА НА KetuJemi.com";
  if (market === "mne") return "⭐ IZABRANA PONUDA NA KetuJemi.com";
  return "⭐ OFERTË E ZGJEDHUR NË KetuJemi.com";
}

function instagramHeadline(market) {
  if (DIASPORA_MARKETS.has(market)) return "💎 TODAY'S PICK · @ketujemi.ks";
  if (market === "mk") return "💎 СПЕЦИЈАЛЕН ИЗБОР · @ketujemi.ks";
  if (market === "mne") return "💎 POSEBNI IZBOR · @ketujemi.ks";
  return "💎 ZGJEDHJE E VEÇANTË · @ketujemi.ks";
}

function ctaFacebook(market) {
  if (DIASPORA_MARKETS.has(market)) return "👇 See details & contact the seller:";
  if (market === "mk") return "👇 Види детали & контактирај го продавачот:";
  if (market === "mne") return "👇 Pogledaj detalje & kontaktiraj prodavca:";
  return "👇 Shiko detajet & kontakto shitësin:";
}

function hashtagBlock(market, categoryName) {
  const catTag = categoryHashtag(
    categoryName,
    market === "mk" ? "#Оглас" : market === "mne" ? "#Oglas" : DIASPORA_MARKETS.has(market) ? "#Listing" : "#Shpallje",
  );
  if (DIASPORA_MARKETS.has(market)) {
    return `#KëtuJemi #KetuJemi #FeaturedListing #Classifieds ${catTag}`;
  }
  if (market === "mk") {
    return `#KëtuJemi #KetuJemi #ИзбранаПонуда #Оглас ${catTag}`;
  }
  if (market === "mne") {
    return `#KëtuJemi #KetuJemi #IzabranaPonuda #Oglas ${catTag}`;
  }
  return `#KëtuJemi #KetuJemi #OfertaEZgjedhur #ShpalljePremium ${catTag}`;
}

function instagramHashtagBlock(market, categoryName) {
  const catTag = categoryHashtag(
    categoryName,
    market === "mk" ? "#Оглас" : market === "mne" ? "#Oglas" : DIASPORA_MARKETS.has(market) ? "#Deals" : "#Shpallje",
  );
  if (DIASPORA_MARKETS.has(market)) {
    return `#KetuJemi #ketujemi.ks #OfertaEDites #Balkans ${catTag}`;
  }
  if (market === "mk") {
    return `#KetuJemi #ketujemi.ks #OfertaEDites #Македонија ${catTag}`;
  }
  if (market === "mne") {
    return `#KetuJemi #ketujemi.ks #OfertaEDites #CrnaGora ${catTag}`;
  }
  return `#KetuJemi #ketujemi.ks #OfertaEDites #Kosova #Shqiperia #Maqedonia #MaliZi ${catTag}`;
}

export function buildFacebookCaption(market, input) {
  const title = input.title.trim();
  const city = input.location.trim();
  const slug = input.slug;
  const priceLine = formatPriceLine(market, input.price);
  const flair = categoryFlairLine("facebook", market, input.categoryName);
  const usp = platformUspLine(market);
  const socials = socialFooterBlock("facebook", market);

  return [
    facebookHeadline(market),
    "",
    flair,
    "",
    `🏷️ ${title}`,
    priceLine,
    locationLine(market, city),
    "",
    usp,
    "",
    ctaFacebook(market),
    listingPathForMarket(market, slug),
    "",
    socials,
    "",
    hashtagBlock(market, input.categoryName),
  ].join("\n");
}

/**
 * Instagram caption — different structure & category flair from Facebook.
 * @param {string} market
 * @param {{
 *   title: string;
 *   price: number | string;
 *   location: string;
 *   slug: string;
 *   categoryName: string | null;
 *   listingLink: string;
 * }} input
 */
export function buildInstagramCaption(market, input) {
  const title = input.title.trim();
  const city = input.location.trim();
  const priceLine = formatPriceLine(market, input.price);
  const link = input.listingLink.replace(/^https?:\/\//, "");
  const flair = categoryFlairLine("instagram", market, input.categoryName);
  const usp = platformUspLine(market);
  const socials = socialFooterBlock("instagram", market);

  return [
    instagramHeadline(market),
    "",
    flair,
    "",
    title,
    priceLine,
    locationLine(market, city),
    "",
    usp,
    `🔗 ${link}`,
    "",
    socials,
    "",
    instagramHashtagBlock(market, input.categoryName),
  ].join("\n");
}

/**
 * @param {{
 *   id: number;
 *   title: string;
 *   description: string;
 *   price: number | string;
 *   location: string;
 *   image_url: string | null | undefined;
 *   category_name?: string | null;
 *   listing_country?: string | null;
 * }} listing
 */
function readPageId() {
  return (
    process.env.FB_PAGE_ID?.trim() ||
    process.env.PAGE_ID?.trim() ||
    process.env.FACEBOOK_PAGE_ID?.trim() ||
    ""
  );
}

function readEnvPageAccessToken() {
  return (
    process.env.FB_PAGE_ACCESS_TOKEN?.trim() ||
    process.env.PAGE_ACCESS_TOKEN?.trim() ||
    ""
  );
}

function readPageAccessToken() {
  return memoryPageAccessToken || readEnvPageAccessToken();
}

function readInstagramBusinessAccountIdEnv() {
  return (
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim() ||
    process.env.IG_BUSINESS_ACCOUNT_ID?.trim() ||
    ""
  );
}

function readInstagramBusinessAccountId() {
  return memoryInstagramBusinessAccountId || readInstagramBusinessAccountIdEnv();
}

function isInstagramAutoPostEnabled() {
  const flag = process.env.INSTAGRAM_AUTO_POST_ENABLED?.trim().toLowerCase();
  return flag !== "false" && flag !== "0" && flag !== "no";
}

export function isInstagramAutoPostConfigured() {
  return isInstagramAutoPostEnabled() && !!readInstagramBusinessAccountId() && !!readPageAccessToken();
}

function graphUrl(pathAndQuery) {
  const p = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  return `https://graph.facebook.com/${GRAPH_API_VERSION}${p}`;
}

/**
 * @param {unknown} expiresInSeconds
 * @returns {string | null} ISO timestamp or null if non-expiring / unknown
 */
function expiresAtFromSeconds(expiresInSeconds) {
  const n = Number(expiresInSeconds);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(Date.now() + n * 1000).toISOString();
}

/**
 * @param {string} shortToken
 * @returns {Promise<{ accessToken: string; expiresAt: string | null }>}
 */
async function exchangeShortLivedForLongLivedUserToken(shortToken) {
  const clientId = facebookAppId();
  const clientSecret = facebookAppSecret();
  if (!clientId || !clientSecret) {
    throw new Error("FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are required for token exchange");
  }

  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: clientId,
    client_secret: clientSecret,
    fb_exchange_token: shortToken,
  });

  const url = graphUrl(`/oauth/access_token?${params}`);
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));

  if (!res.ok || typeof json.access_token !== "string") {
    throw new Error(
      `Long-lived user token exchange failed (${res.status}): ${JSON.stringify(json)}`,
    );
  }

  return {
    accessToken: json.access_token,
    expiresAt: expiresAtFromSeconds(json.expires_in),
  };
}

/**
 * @param {string} longLivedUserToken
 * @param {string} pageId
 * @returns {Promise<{ accessToken: string; expiresAt: string | null }>}
 */
async function fetchPageAccessTokenFromLongLived(longLivedUserToken, pageId) {
  const attempts = [
    {
      label: "page_accounts",
      url: graphUrl(`/${pageId}/accounts?access_token=${encodeURIComponent(longLivedUserToken)}`),
      pick: (json) => {
        const row = Array.isArray(json?.data) ? json.data[0] : null;
        return row?.access_token;
      },
    },
    {
      label: "me_accounts",
      url: graphUrl(`/me/accounts?access_token=${encodeURIComponent(longLivedUserToken)}`),
      pick: (json) => {
        const rows = Array.isArray(json?.data) ? json.data : [];
        const match = rows.find((r) => String(r?.id) === String(pageId));
        return match?.access_token ?? rows[0]?.access_token;
      },
    },
    {
      label: "page_access_token_field",
      url: graphUrl(
        `/${pageId}?fields=access_token&access_token=${encodeURIComponent(longLivedUserToken)}`,
      ),
      pick: (json) => json?.access_token,
    },
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url);
      const json = await res.json().catch(() => ({}));
      const token = attempt.pick(json);
      if (res.ok && typeof token === "string" && token.length > 0) {
        return {
          accessToken: token,
          expiresAt: expiresAtFromSeconds(json?.expires_in),
          via: attempt.label,
        };
      }
      lastError = new Error(
        `${attempt.label} failed (${res.status}): ${JSON.stringify(json)}`,
      );
      logger.warn(
        { pageId, via: attempt.label, status: res.status, facebook: json },
        "facebook page token fetch attempt failed",
      );
    } catch (err) {
      lastError = err;
      logger.warn({ err, pageId, via: attempt.label }, "facebook page token fetch attempt error");
    }
  }

  throw lastError ?? new Error("Could not resolve Page access token");
}

/**
 * @param {string} pageId
 * @param {string} accessToken
 * @returns {Promise<string | null>}
 */
async function fetchInstagramBusinessAccountId(pageId, accessToken) {
  const envId = readInstagramBusinessAccountIdEnv();
  if (envId) return envId;

  const url = graphUrl(
    `/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(accessToken)}`,
  );
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  const igId = json?.instagram_business_account?.id;
  if (res.ok && igId != null) {
    return String(igId);
  }

  logger.warn(
    { pageId, status: res.status, facebook: json },
    "instagram auto-post: could not resolve instagram_business_account from Facebook Page — set INSTAGRAM_BUSINESS_ACCOUNT_ID",
  );
  return null;
}

/**
 * @param {string} creationId
 * @param {string} accessToken
 * @returns {Promise<boolean>}
 */
async function waitForInstagramMediaContainer(creationId, accessToken) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const url = graphUrl(
      `/${creationId}?fields=status_code&access_token=${encodeURIComponent(accessToken)}`,
    );
    const res = await fetch(url);
    const json = await res.json().catch(() => ({}));
    const status = json?.status_code;
    if (status === "FINISHED") return true;
    if (status === "ERROR") {
      logger.error({ creationId, facebook: json }, "instagram media container error");
      return false;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

/**
 * @param {{
 *   igUserId: string;
 *   accessToken: string;
 *   photoUrl: string;
 *   caption: string;
 *   listingId: number;
 * }} input
 * @returns {Promise<string | null>}
 */
async function postPhotoToInstagram(input) {
  const { igUserId, accessToken, photoUrl, caption, listingId } = input;

  const createBody = new URLSearchParams({
    image_url: photoUrl,
    caption,
    access_token: accessToken,
  });

  try {
    const createRes = await fetch(graphUrl(`/${igUserId}/media`), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: createBody.toString(),
    });
    const createJson = await createRes.json().catch(() => ({}));
    const creationId = typeof createJson.id === "string" ? createJson.id : null;

    if (!createRes.ok || !creationId) {
      logger.error(
        { listingId, status: createRes.status, instagram: createJson },
        "instagram auto-post: media container failed",
      );
      return null;
    }

    const ready = await waitForInstagramMediaContainer(creationId, accessToken);
    if (!ready) {
      logger.warn({ listingId, creationId }, "instagram auto-post: media container not ready");
      return null;
    }

    const publishBody = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });
    const publishRes = await fetch(graphUrl(`/${igUserId}/media_publish`), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: publishBody.toString(),
    });
    const publishJson = await publishRes.json().catch(() => ({}));

    if (!publishRes.ok) {
      logger.error(
        { listingId, status: publishRes.status, instagram: publishJson, creationId },
        "instagram auto-post: publish failed",
      );
      return null;
    }

    const mediaId = typeof publishJson.id === "string" ? publishJson.id : null;
    logger.info({ listingId, instagramMediaId: mediaId, igUserId }, "instagram auto-post ok");
    return mediaId;
  } catch (err) {
    logger.error({ err, listingId }, "instagram auto-post error");
    return null;
  }
}

/**
 * Exchange env PAGE_ACCESS_TOKEN for a long-lived Page token once at startup.
 * @returns {Promise<void>}
 */
export async function initializeFacebookPageAccessToken() {
  const pageId = readPageId();
  const shortOrPageToken = readEnvPageAccessToken();
  memoryPageAccessToken = null;
  memoryInstagramBusinessAccountId = null;
  pageTokenMeta = null;

  if (!pageId || !shortOrPageToken) {
    logger.warn(
      "facebook auto-post disabled: set PAGE_ID (or FACEBOOK_PAGE_ID) and PAGE_ACCESS_TOKEN on the server",
    );
    return;
  }

  const appId = facebookAppId();
  const appSecret = facebookAppSecret();
  if (!appId || !appSecret) {
    logger.warn(
      { pageId, hasAppId: !!appId, hasAppSecret: !!appSecret },
      "facebook token exchange skipped: set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET; using PAGE_ACCESS_TOKEN from env as-is",
    );
    memoryPageAccessToken = shortOrPageToken;
    pageTokenMeta = { longLivedUserExpiresAt: null, pageTokenExpiresAt: null, source: "env_only" };
  } else {
    try {
      const longLivedUser = await exchangeShortLivedForLongLivedUserToken(shortOrPageToken);
      const pageToken = await fetchPageAccessTokenFromLongLived(longLivedUser.accessToken, pageId);

      memoryPageAccessToken = pageToken.accessToken;
      pageTokenMeta = {
        longLivedUserExpiresAt: longLivedUser.expiresAt,
        pageTokenExpiresAt: pageToken.expiresAt,
        source: pageToken.via ?? "exchange",
      };

      logger.info(
        {
          pageId,
          tokenSource: pageTokenMeta.source,
          longLivedUserExpiresAt: pageTokenMeta.longLivedUserExpiresAt ?? "non-expiring_or_unknown",
          pageTokenExpiresAt: pageTokenMeta.pageTokenExpiresAt ?? "non-expiring_or_unknown",
          tokenLength: memoryPageAccessToken.length,
        },
        "facebook page access token ready (long-lived exchange)",
      );
    } catch (err) {
      memoryPageAccessToken = shortOrPageToken;
      pageTokenMeta = { longLivedUserExpiresAt: null, pageTokenExpiresAt: null, source: "env_fallback" };
      logger.error(
        { err, pageId },
        "facebook token exchange failed; using PAGE_ACCESS_TOKEN from env (may be short-lived)",
      );
    }
  }

  const pageToken = readPageAccessToken();
  if (pageId && pageToken && isInstagramAutoPostEnabled()) {
    memoryInstagramBusinessAccountId = await fetchInstagramBusinessAccountId(pageId, pageToken);
    if (memoryInstagramBusinessAccountId) {
      logger.info(
        {
          igBusinessAccountId: memoryInstagramBusinessAccountId,
          handle: "@ketujemi.ks",
        },
        "instagram auto-post ready (linked to Facebook Page)",
      );
    }
  } else if (!isInstagramAutoPostEnabled()) {
    logger.info("instagram auto-post disabled (INSTAGRAM_AUTO_POST_ENABLED=false)");
  }
}

/**
 * @param {{
 *   description: string;
 *   price: number | string;
 *   image_url: string | null | undefined;
 * }} listing
 * @returns {string | null} skip reason, or null if eligible
 */
export function facebookPostSkipReason(listing) {
  if (!isFacebookAutoPostConfigured()) {
    return "not_configured";
  }
  const desc = String(listing.description ?? "").trim();
  if (desc.length < 10) return "description_too_short";
  const price = Number(listing.price);
  if (!Number.isFinite(price) || price <= 0) return "price_missing_or_zero";
  const urls = parseListingImageUrls(listing.image_url);
  if (urls.length < 1) return "no_valid_photo_url";
  return null;
}

export function canPostListingToFacebook(listing) {
  return facebookPostSkipReason(listing) === null;
}

export function isFacebookAutoPostConfigured() {
  return !!(readPageId() && readPageAccessToken());
}

/** @deprecated Use initializeFacebookPageAccessToken — kept for imports that only log status. */
export function logFacebookAutoPostReadiness() {
  if (!isFacebookAutoPostConfigured()) {
    logger.warn(
      "facebook auto-post disabled: set PAGE_ID (or FACEBOOK_PAGE_ID) and PAGE_ACCESS_TOKEN on the server",
    );
    return;
  }
  logger.info(
    {
      pageId: readPageId(),
      tokenSource: pageTokenMeta?.source ?? "pending",
      longLivedUserExpiresAt: pageTokenMeta?.longLivedUserExpiresAt ?? null,
      pageTokenExpiresAt: pageTokenMeta?.pageTokenExpiresAt ?? null,
    },
    "facebook auto-post enabled",
  );
}

/**
 * @param {{
 *   id: number;
 *   title: string;
 *   description: string;
 *   price: number | string;
 *   location: string;
 *   image_url: string | null | undefined;
 *   category_name?: string | null;
 *   listing_country?: string | null;
 * }} listing
 * @returns {Promise<string | null>} Facebook post/photo id
 */
export async function postNewListingToFacebook(listing) {
  console.log("[facebook] postNewListingToFacebook called", {
    listingId: listing?.id,
    at: new Date().toISOString(),
  });

  const skip = facebookPostSkipReason(listing);
  if (skip) {
    console.log("[facebook] post skipped", { listingId: listing.id, skip });
    logger.info({ listingId: listing.id, skip }, "facebook auto-post skipped");
    return null;
  }

  const pageId = readPageId();
  const accessToken = readPageAccessToken();
  const photoUrl = parseListingImageUrls(listing.image_url)[0];
  const market = resolveListingMarketForSocial(listing.location, listing.listing_country);
  const slug = listingSlug(listing.id, listing.title);
  const caption = buildFacebookCaption(market, {
    title: listing.title,
    price: listing.price,
    location: listing.location,
    slug,
    categoryName: listing.category_name ?? null,
  });
  const listingLink = `${getCanonicalOrigin()}/listings/${listing.id}`;

  console.log("[facebook] listing data for post", {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    location: listing.location,
    listing_country: listing.listing_country ?? null,
    category_name: listing.category_name ?? null,
    descriptionLength: String(listing.description ?? "").length,
    image_url: listing.image_url ?? null,
    photoUrl,
    market,
    slug,
    listingLink,
    pageId,
    configured: isFacebookAutoPostConfigured(),
  });

  const fullCaption = `${caption}\n\n${listingLink}`;

  const endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/photos`;
  const body = new URLSearchParams({
    url: photoUrl,
    caption: fullCaption,
    access_token: accessToken,
  });

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const json = await res.json().catch(() => ({}));

    console.log("[facebook] Graph API response", {
      listingId: listing.id,
      status: res.status,
      ok: res.ok,
      body: json,
    });

    if (!res.ok) {
      console.error("[facebook] Graph API error (non-OK status)", {
        listingId: listing.id,
        status: res.status,
        statusText: res.statusText,
        response: json,
      });
      logger.error(
        { status: res.status, facebook: json, listingId: listing.id },
        "facebook auto-post failed",
      );
      return null;
    }

    const postId =
      typeof json.id === "string" ? json.id : typeof json.post_id === "string" ? json.post_id : null;
    logger.info({ listingId: listing.id, facebookPostId: postId, market }, "facebook auto-post ok");
    return postId;
  } catch (err) {
    console.error("[facebook] postNewListingToFacebook exception", {
      listingId: listing.id,
      name: err instanceof Error ? err.name : "unknown",
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      cause: err instanceof Error && err.cause ? err.cause : undefined,
      err,
    });
    logger.error({ err, listingId: listing.id }, "facebook auto-post error");
    return null;
  }
}

/**
 * Post to Instagram only — runs on a separate schedule after Facebook.
 * @param {{
 *   id: number;
 *   title: string;
 *   description: string;
 *   price: number | string;
 *   location: string;
 *   image_url: string | null | undefined;
 *   category_name?: string | null;
 *   listing_country?: string | null;
 * }} listing
 * @returns {Promise<string | null>} Instagram media id
 */
export async function postNewListingToInstagram(listing) {
  if (!isInstagramAutoPostConfigured()) {
    logger.info({ listingId: listing.id }, "instagram auto-post skipped: not configured");
    return null;
  }

  const skip = facebookPostSkipReason(listing);
  if (skip) {
    logger.info({ listingId: listing.id, skip }, "instagram auto-post skipped");
    return null;
  }

  const accessToken = readPageAccessToken();
  const igUserId = readInstagramBusinessAccountId();
  const photoUrl = parseListingImageUrls(listing.image_url)[0];
  const market = resolveListingMarketForSocial(listing.location, listing.listing_country);
  const slug = listingSlug(listing.id, listing.title);
  const listingLink = `${getCanonicalOrigin()}/listings/${listing.id}`;
  const igCaption = buildInstagramCaption(market, {
    title: listing.title,
    price: listing.price,
    location: listing.location,
    slug,
    categoryName: listing.category_name ?? null,
    listingLink,
  });

  return postPhotoToInstagram({
    igUserId,
    accessToken,
    photoUrl,
    caption: igCaption,
    listingId: listing.id,
  });
}
