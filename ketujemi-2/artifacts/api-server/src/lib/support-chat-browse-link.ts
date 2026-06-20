import type { ChatMessage } from "./support-chatbot";
import { seoCategoryPath } from "../../../../lib/seo-category-indexing.js";
import { KETUJEMI_CATEGORY_ROUTES } from "./support-category-catalog";
import {
  getLastUserMessage,
  isMarketplaceBrowseQuestion,
  isRecognizedMarketplaceQuery,
  isShopBrowseQuestion,
  isSupportContactQuestion,
} from "./support-chat-screening";
import {
  isShopBrowseIntent,
  matchShopDirectoryRoute,
  shopDirectoryHref,
  shopRouteFromListingCategoryId,
  stripShopIntentWords,
} from "./support-chat-shop-browse-link";

/** Route ids that differ from public /shpallje/ slug. */
const CATEGORY_HREF_SLUG: Record<string, string> = {
  "libra-muzike": "muzike-hobby",
};

function normalizeText(raw: string): string {
  return raw.normalize("NFD").replace(/\p{M}/gu, "");
}

function expandUserQuery(raw: string): string {
  let t = normalizeText(raw).trim();
  t = t
    .replace(/^po\s+/i, "")
    .replace(/^edhe\s+/i, "")
    .replace(/^dhe\s+/i, "")
    .replace(/^a\s+/i, "")
    .trim();
  return t || normalizeText(raw).trim();
}

function getUserSearchContext(messages: ChatMessage[]): string {
  const parts = messages
    .filter((m) => m.role === "user")
    .slice(-4)
    .map((m) => expandUserQuery(m.content));
  return parts.join(" ").trim();
}

export function extractProductSearchTerms(raw: string): string {
  let t = expandUserQuery(raw);
  t = t
    .replace(
      /^(a\s+)?ku\s+(mund\s+)?(e\s+)?(jan|jane|jane\s+)?(ta\s+)?(gjej|gjen|blej|bler|shoh|shfaq)\s+/i,
      "",
    )
    .replace(
      /^(a\s+)?ku\s+(mund\s+)?(e\s+)?(ta\s+)?(gjej|gjen|blej|bler|shoh|shfaq)\s+/i,
      "",
    )
    .replace(/^(si\s+)?(mund\s+)?(ta\s+)?(gjej|gjen|blej|bler)\s+/i, "")
    .replace(/^(where\s+can\s+i\s+(find|buy)|how\s+to\s+find|where\s+to\s+find)\s+/i, "")
    .replace(/^(kërko|kerko|pretra|pronađi|find)\s+/i, "")
    .replace(/[?.!]+$/g, "")
    .trim();
  return t;
}

export function matchCategoryRouteId(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  for (const route of KETUJEMI_CATEGORY_ROUTES) {
    if (route.keywords.test(t)) return route.id;
  }
  return null;
}

function categoryHref(slug: string): string {
  const publicSlug = CATEGORY_HREF_SLUG[slug] ?? slug;
  return seoCategoryPath(publicSlug);
}

function listingsSearchHref(terms: string): string {
  const q = terms.trim();
  if (!q) return "/listings";
  return `/listings?search=${encodeURIComponent(q)}`;
}

function isSpecificProductQuery(terms: string): boolean {
  if (terms.split(/\s+/).filter(Boolean).length >= 2) return true;
  if (/\d/.test(terms)) return true;
  if (/iphone|samsung|xiaomi|bmw|audi|mercedes|golf|passat|corolla|macbook|playstation|xbox/i.test(terms)) {
    return true;
  }
  return false;
}

const NON_BROWSE_FAQ =
  /regjistr|sign\s*up|stripe|partner|biznes|sigur|mashtr|sa\s+kushton|çmim|cmim|fjalkalim|verifik|moderat|ndal|prohib|treg\b|market\b|diaspor|kategor.*lista|lista\s+e\s+kategori/i;

export function shouldOfferBrowseLink(messages: ChatMessage[]): boolean {
  const lastUser = expandUserQuery(getLastUserMessage(messages));
  if (!lastUser || lastUser.length < 2) return false;
  if (isSupportContactQuestion(lastUser)) return false;

  const context = getUserSearchContext(messages);
  if (
    isShopBrowseQuestion(lastUser) ||
    isShopBrowseQuestion(context) ||
    isShopBrowseIntent(lastUser) ||
    isShopBrowseIntent(context)
  ) {
    return true;
  }

  if (NON_BROWSE_FAQ.test(lastUser)) return false;

  return (
    isMarketplaceBrowseQuestion(lastUser) ||
    isRecognizedMarketplaceQuery(lastUser) ||
    isMarketplaceBrowseQuestion(context) ||
    isRecognizedMarketplaceQuery(context) ||
    matchCategoryRouteId(lastUser) != null ||
    matchCategoryRouteId(context) != null
  );
}

/** Link-only reply — no prices, no listing text. */
export function buildSupportBrowseLink(messages: ChatMessage[]): string | null {
  if (!shouldOfferBrowseLink(messages)) return null;

  const context = getUserSearchContext(messages);
  const lastUser = expandUserQuery(getLastUserMessage(messages));
  const shopIntent =
    isShopBrowseIntent(lastUser) ||
    isShopBrowseIntent(context) ||
    isShopBrowseQuestion(lastUser) ||
    isShopBrowseQuestion(context);

  if (shopIntent) {
    const terms =
      stripShopIntentWords(extractProductSearchTerms(lastUser)) ||
      stripShopIntentWords(extractProductSearchTerms(context)) ||
      stripShopIntentWords(lastUser);
    const shopRoute =
      matchShopDirectoryRoute(terms || lastUser) ??
      (() => {
        const listingCat =
          matchCategoryRouteId(terms) ?? matchCategoryRouteId(context) ?? matchCategoryRouteId(lastUser);
        return listingCat ? shopRouteFromListingCategoryId(listingCat) : null;
      })();
    return shopDirectoryHref(shopRoute);
  }

  const terms = extractProductSearchTerms(lastUser) || extractProductSearchTerms(context);
  const categoryId = matchCategoryRouteId(terms) ?? matchCategoryRouteId(context) ?? matchCategoryRouteId(lastUser);

  if (categoryId && terms && !isSpecificProductQuery(terms)) {
    return categoryHref(categoryId);
  }

  if (terms.length >= 2) {
    return listingsSearchHref(terms);
  }

  if (categoryId) {
    return categoryHref(categoryId);
  }

  if (terms.length > 0) {
    return listingsSearchHref(terms);
  }

  return "/listings";
}
