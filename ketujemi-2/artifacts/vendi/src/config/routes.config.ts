import { PARENT_CATEGORY_SLUG_ORDER } from "@/lib/parent-category-slugs";
import type { UiLang } from "@/lib/ui-languages";

/** Stable route keys — map to page components in `App.tsx`. */
export type RouteId =
  | "admin"
  | "login"
  | "profile"
  | "my-listings"
  | "wallet-bank-payment"
  | "business-profile"
  | "partner-profile"
  | "about"
  | "rules"
  | "privacy"
  | "cookies"
  | "terms"
  | "business-rules"
  | "contact"
  | "faq"
  | "security"
  | "press"
  | "partner-register"
  | "open-shop"
  | "open-shop-apply"
  | "vip-packages"
  | "advertise"
  | "home"
  | "legacy-category-redirect"
  | "category-hub-redirect"
  | "category"
  | "new-listing"
  | "edit-listing"
  | "listing-detail"
  | "shop-detail"
  | "shop-directory"
  | "shop-directory-subcategory"
  | "shop-directory-category"
  | "listings"
  | "not-found";

export type AppRouteDefinition = {
  id: RouteId;
  path: string;
  requiresAuth: boolean;
  /** UI-language slug alias when path is localized; `null` if shared across languages. */
  marketPrefix: UiLang | null;
  /** Redirect target when auth is required but user is not signed in. */
  fallbackPath: string;
  /** Wrap with `RouteErrorBoundary` in the router (category, search, listing detail). */
  errorBoundary?: boolean;
  /** Parent category hub slug (`category-hub-redirect` only). */
  hubSlug?: (typeof PARENT_CATEGORY_SLUG_ORDER)[number];
};

const LOGIN_FALLBACK = "/login";
const HOME_FALLBACK = "/";

const staticAliases = (
  id: RouteId,
  paths: { path: string; marketPrefix: UiLang | null }[],
): AppRouteDefinition[] =>
  paths.map(({ path, marketPrefix }) => ({
    id,
    path,
    requiresAuth: false,
    marketPrefix,
    fallbackPath: HOME_FALLBACK,
  }));

/** All application routes in match order (first match wins). */
export const APP_ROUTES: AppRouteDefinition[] = [
  {
    id: "admin",
    path: "/admin",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  {
    id: "admin",
    path: "/admin-secret-panel",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  {
    id: "login",
    path: "/login",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  {
    id: "profile",
    path: "/profili",
    requiresAuth: true,
    marketPrefix: null,
    fallbackPath: LOGIN_FALLBACK,
  },
  {
    id: "profile",
    path: "/profile",
    requiresAuth: true,
    marketPrefix: null,
    fallbackPath: LOGIN_FALLBACK,
  },
  {
    id: "my-listings",
    path: "/shpalljet-e-mia",
    requiresAuth: true,
    marketPrefix: null,
    fallbackPath: LOGIN_FALLBACK,
  },
  {
    id: "wallet-bank-payment",
    path: "/wallet/bank-payment",
    requiresAuth: true,
    marketPrefix: null,
    fallbackPath: LOGIN_FALLBACK,
  },
  {
    id: "business-profile",
    path: "/biznes/:id",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  {
    id: "partner-profile",
    path: "/partners/:id",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  ...staticAliases("about", [
    { path: "/rreth-nesh", marketPrefix: "sq" },
    { path: "/za-nas", marketPrefix: "mk" },
    { path: "/o-nama", marketPrefix: "mne" },
    { path: "/about", marketPrefix: "en" },
  ]),
  ...staticAliases("rules", [
    { path: "/rregullat", marketPrefix: "sq" },
    { path: "/pravila", marketPrefix: "mk" },
    { path: "/rules", marketPrefix: "en" },
  ]),
  ...staticAliases("privacy", [
    { path: "/privatesia", marketPrefix: "sq" },
    { path: "/privatnost", marketPrefix: "mk" },
    { path: "/privacy", marketPrefix: "en" },
  ]),
  ...staticAliases("cookies", [
    { path: "/cookies", marketPrefix: "sq" },
    { path: "/kolacinja", marketPrefix: "mk" },
    { path: "/kolacici", marketPrefix: "mne" },
  ]),
  ...staticAliases("terms", [
    { path: "/kushtet", marketPrefix: "sq" },
    { path: "/uslovi", marketPrefix: "mk" },
    { path: "/terms", marketPrefix: "en" },
  ]),
  {
    id: "business-rules",
    path: "/business-rules",
    requiresAuth: false,
    marketPrefix: "en",
    fallbackPath: HOME_FALLBACK,
  },
  ...staticAliases("contact", [
    { path: "/contact", marketPrefix: "en" },
    { path: "/kontakt", marketPrefix: null },
  ]),
  {
    id: "faq",
    path: "/faq",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  ...staticAliases("security", [
    { path: "/siguria", marketPrefix: "sq" },
    { path: "/bezbednost", marketPrefix: "mk" },
    { path: "/sigurnost", marketPrefix: "mne" },
    { path: "/security", marketPrefix: "en" },
  ]),
  ...staticAliases("press", [
    { path: "/shtypi", marketPrefix: "sq" },
    { path: "/mediji", marketPrefix: "mk" },
    { path: "/press", marketPrefix: "en" },
  ]),
  ...staticAliases("open-shop", [
    { path: "/hap-shitore", marketPrefix: "sq" },
    { path: "/otvori-prodavnica", marketPrefix: "mk" },
    { path: "/otvori-prodavnicu", marketPrefix: "mne" },
  ]),
  ...staticAliases("open-shop-apply", [
    { path: "/hap-shitore/apliko", marketPrefix: "sq" },
    { path: "/otvori-prodavnica/apliko", marketPrefix: "mk" },
    { path: "/otvori-prodavnicu/apliko", marketPrefix: "mne" },
  ]),
  ...staticAliases("partner-register", [
    { path: "/partner", marketPrefix: null },
    { path: "/partneritet", marketPrefix: "sq" },
    { path: "/partnerstvo", marketPrefix: "mne" },
  ]),
  {
    id: "vip-packages",
    path: "/vip",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  {
    id: "vip-packages",
    path: "/paketa-vip",
    requiresAuth: false,
    marketPrefix: "sq",
    fallbackPath: HOME_FALLBACK,
  },
  ...staticAliases("advertise", [
    { path: "/reklamoni", marketPrefix: "sq" },
    { path: "/reklamiraj", marketPrefix: "mk" },
    { path: "/advertise", marketPrefix: "en" },
  ]),
  {
    id: "profile",
    path: "/behu-partner",
    requiresAuth: true,
    marketPrefix: "sq",
    fallbackPath: LOGIN_FALLBACK,
  },
  {
    id: "home",
    path: "/",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  {
    id: "legacy-category-redirect",
    path: "/category/:id",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  ...PARENT_CATEGORY_SLUG_ORDER.map(
    (slug): AppRouteDefinition => ({
      id: "category-hub-redirect",
      path: `/${slug}`,
      hubSlug: slug,
      requiresAuth: false,
      marketPrefix: null,
      fallbackPath: HOME_FALLBACK,
    }),
  ),
  {
    id: "category",
    path: "/categories/:id",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
    errorBoundary: true,
  },
  {
    id: "new-listing",
    path: "/listings/new/dhurata-falas",
    requiresAuth: true,
    marketPrefix: null,
    fallbackPath: LOGIN_FALLBACK,
  },
  {
    id: "new-listing",
    path: "/listings/new/kerkoj-te-blej",
    requiresAuth: true,
    marketPrefix: null,
    fallbackPath: LOGIN_FALLBACK,
  },
  {
    id: "new-listing",
    path: "/listings/new",
    requiresAuth: true,
    marketPrefix: null,
    fallbackPath: LOGIN_FALLBACK,
  },
  {
    id: "edit-listing",
    path: "/listings/:id/edit",
    requiresAuth: true,
    marketPrefix: null,
    fallbackPath: LOGIN_FALLBACK,
  },
  {
    id: "shop-detail",
    path: "/dyqani/:id",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
    errorBoundary: true,
  },
  {
    id: "shop-directory",
    path: "/dyqanet",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  {
    id: "shop-directory-subcategory",
    path: "/dyqanet/:categorySlug/:subcategorySlug",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  {
    id: "shop-directory-category",
    path: "/dyqanet/:slug",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
  },
  {
    id: "listing-detail",
    path: "/listings/:id",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
    errorBoundary: true,
  },
  {
    id: "listings",
    path: "/listings",
    requiresAuth: false,
    marketPrefix: null,
    fallbackPath: HOME_FALLBACK,
    errorBoundary: true,
  },
];

/** Catch-all (404) — rendered last without a `path` prop in wouter. */
export const CATCH_ALL_ROUTE: AppRouteDefinition = {
  id: "not-found",
  path: "*",
  requiresAuth: false,
  marketPrefix: null,
  fallbackPath: HOME_FALLBACK,
};
