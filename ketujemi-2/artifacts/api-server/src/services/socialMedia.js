/**
 * Facebook Page auto-post (Meta Graph API) when a new listing is created.
 * Caption language + link path follow listing market (where the seller posted from).
 * Requires PAGE_ID and PAGE_ACCESS_TOKEN in environment (see ketujemi-2/.env.example).
 */

import { LISTING_LOCATIONS_BY_COUNTRY } from "../lib/listing-locations.js";
import { getCanonicalOrigin } from "../lib/canonical-host.js";
import { parseListingImageUrls } from "../lib/listing-images.js";
import { logger } from "../lib/logger.js";

const GRAPH_API_VERSION = "v21.0";

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
export function buildFacebookCaption(market, input) {
  const title = input.title.trim();
  const city = input.location.trim();
  const slug = input.slug;
  const priceLine = formatPriceLine(market, input.price);

  if (DIASPORA_MARKETS.has(market)) {
    const country = COUNTRY_LABEL_EN[market] ?? "Kosovo";
    const catTag = categoryHashtag(input.categoryName, "#Listing");
    return [
      `🏷️ ${title}`,
      priceLine,
      `📍 ${city}, ${country}`,
      "",
      `🔗 View listing: ketujemi.com/en/listing/${slug}`,
      "",
      `#KëtuJemi #Classifieds ${catTag}`,
    ].join("\n");
  }

  if (market === "al") {
    const catTag = categoryHashtag(input.categoryName, "#Shpallje");
    return [
      `🏷️ ${title}`,
      priceLine,
      `📍 ${city}, Shqipëri`,
      "",
      `🔗 Shiko detajet: ketujemi.com/al/shpallje/${slug}`,
      "",
      `#KëtuJemi #Shpallje ${catTag}`,
    ].join("\n");
  }

  if (market === "mk") {
    const catTag = categoryHashtag(input.categoryName, "#Оглас");
    return [
      `🏷️ ${title}`,
      priceLine,
      `📍 ${city}, Македонија`,
      "",
      `🔗 Види детали: ketujemi.com/mk/oglas/${slug}`,
      "",
      `#KëtuJemi #Оглас ${catTag}`,
    ].join("\n");
  }

  if (market === "mne") {
    const catTag = categoryHashtag(input.categoryName, "#Oglas");
    return [
      `🏷️ ${title}`,
      priceLine,
      `📍 ${city}, Crna Gora`,
      "",
      `🔗 Pogledaj detalje: ketujemi.com/mne/oglas/${slug}`,
      "",
      `#KëtuJemi #Oglas ${catTag}`,
    ].join("\n");
  }

  const catTag = categoryHashtag(input.categoryName, "#Shpallje");
  return [
    `🏷️ ${title}`,
    priceLine,
    `📍 ${city}, Kosovë`,
    "",
    `🔗 Shiko detajet: ketujemi.com/shpallje/${slug}`,
    "",
    `#KëtuJemi #Shpallje ${catTag}`,
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
export function canPostListingToFacebook(listing) {
  const desc = String(listing.description ?? "").trim();
  const price = Number(listing.price);
  const urls = parseListingImageUrls(listing.image_url);
  return desc.length >= 10 && Number.isFinite(price) && price > 0 && urls.length >= 1;
}

export function isFacebookAutoPostConfigured() {
  const pageId = process.env.PAGE_ID?.trim();
  const token = process.env.PAGE_ACCESS_TOKEN?.trim();
  return !!(pageId && token);
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
  if (!isFacebookAutoPostConfigured()) {
    return null;
  }

  if (!canPostListingToFacebook(listing)) {
    return null;
  }

  const pageId = process.env.PAGE_ID.trim();
  const accessToken = process.env.PAGE_ACCESS_TOKEN.trim();
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

  const endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/photos`;
  const body = new URLSearchParams({
    url: photoUrl,
    caption: `${caption}\n\n${listingLink}`,
    access_token: accessToken,
  });

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      logger.error(
        { status: res.status, facebook: json, listingId: listing.id },
        "facebook auto-post failed",
      );
      return null;
    }

    const postId = typeof json.id === "string" ? json.id : typeof json.post_id === "string" ? json.post_id : null;
    logger.info({ listingId: listing.id, facebookPostId: postId, market }, "facebook auto-post ok");
    return postId;
  } catch (err) {
    logger.error({ err, listingId: listing.id }, "facebook auto-post error");
    return null;
  }
}
