import {
  db,
  businessPartnerCategoriesTable,
  categoriesTable,
  homepagePartnerCategoriesTable,
  homepagePartnersTable,
  shopsTable,
  usersTable,
} from "@workspace/db";
import type { User } from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import { getShopSocialProfilesForApi, type ShopSocialProfileApi } from "./shop-social-enrich.js";
import { isVipBusinessActive } from "./business-rules";
import { isBusinessPartnerActive } from "./business-partner";
import { homepagePartnerPublicId } from "./homepage-partners";
import { partnerDisplayName, resolvePartnerLogoUrl } from "./trusted-partners";
import type { PartnerTier } from "./trusted-partners";

export type PartnerPublicProfile = {
  id: number;
  business_name: string;
  logo_url: string | null;
  tier: PartnerTier;
  category_name: string | null;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
  shop_id: number | null;
  social_profiles: Partial<Record<"instagram" | "tiktok", ShopSocialProfileApi>>;
};

export function partnerProfilePath(publicId: number): string {
  return `/partners/${publicId}`;
}

function trimOrNull(v: string | null | undefined): string | null {
  const s = v?.trim();
  return s ? s : null;
}

function whatsappHref(raw: string | null | undefined): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 20) return null;
  return `https://wa.me/${digits}`;
}

function normalizeHttpUrl(raw: string | null | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function legacyUserSocial(
  user: Pick<User, "partner_link_url" | "partner_link_type">,
): Partial<
  Pick<
    PartnerPublicProfile,
    "facebook_url" | "instagram_url" | "website_url"
  >
> {
  const url = trimOrNull(user.partner_link_url);
  const type = user.partner_link_type?.trim();
  if (!url || !type) return {};
  const norm = normalizeHttpUrl(url);
  if (!norm) return {};
  if (type === "facebook") return { facebook_url: norm };
  if (type === "instagram") return { instagram_url: norm };
  if (type === "website") return { website_url: norm };
  return {};
}

async function firstCategoryNameForHomepagePartner(partnerId: number): Promise<string | null> {
  const [row] = await db
    .select({ name: categoriesTable.name })
    .from(homepagePartnerCategoriesTable)
    .innerJoin(categoriesTable, eq(homepagePartnerCategoriesTable.category_id, categoriesTable.id))
    .where(eq(homepagePartnerCategoriesTable.partner_id, partnerId))
    .orderBy(asc(categoriesTable.id))
    .limit(1);
  return row?.name?.trim() ?? null;
}

async function firstCategoryNameForBusinessUser(userId: number): Promise<string | null> {
  const [row] = await db
    .select({ name: categoriesTable.name })
    .from(businessPartnerCategoriesTable)
    .innerJoin(categoriesTable, eq(businessPartnerCategoriesTable.category_id, categoriesTable.id))
    .where(eq(businessPartnerCategoriesTable.user_id, userId))
    .orderBy(asc(categoriesTable.id))
    .limit(1);
  return row?.name?.trim() ?? null;
}

function buildProfileFields(input: {
  address?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  whatsapp_number?: string | null;
  tiktok_url?: string | null;
  website_url?: string | null;
  link_url?: string | null;
}): Pick<
  PartnerPublicProfile,
  | "address"
  | "facebook_url"
  | "instagram_url"
  | "whatsapp_url"
  | "tiktok_url"
  | "website_url"
> {
  const website =
    normalizeHttpUrl(input.website_url) ??
    normalizeHttpUrl(input.link_url);
  return {
    address: trimOrNull(input.address),
    facebook_url: normalizeHttpUrl(input.facebook_url),
    instagram_url: normalizeHttpUrl(input.instagram_url),
    whatsapp_url: whatsappHref(input.whatsapp_number),
    tiktok_url: normalizeHttpUrl(input.tiktok_url),
    website_url: website,
  };
}

async function loadHomepagePartnerProfile(rowId: number): Promise<PartnerPublicProfile | null> {
  const [row] = await db
    .select()
    .from(homepagePartnersTable)
    .where(and(eq(homepagePartnersTable.id, rowId), eq(homepagePartnersTable.is_active, true)))
    .limit(1);
  if (!row) return null;

  const tier: PartnerTier = row.tier === "vip" ? "vip" : "standard";
  const category_name = await firstCategoryNameForHomepagePartner(rowId);

  return {
    id: homepagePartnerPublicId(rowId),
    business_name: row.business_name.trim(),
    logo_url: row.logo_url.trim() || null,
    tier,
    category_name,
    shop_id: null,
    social_profiles: {},
    ...buildProfileFields({
      address: row.address,
      facebook_url: row.facebook_url,
      instagram_url: row.instagram_url,
      whatsapp_number: row.whatsapp_number,
      tiktok_url: row.tiktok_url,
      website_url: row.website_url,
      link_url: row.link_url,
    }),
  };
}

async function loadBusinessUserPartnerProfile(userId: number): Promise<PartnerPublicProfile | null> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user || !isBusinessPartnerActive(user)) return null;

  const tier: PartnerTier = isVipBusinessActive(user) ? "vip" : "standard";
  const legacy = legacyUserSocial(user);
  const category_name = await firstCategoryNameForBusinessUser(userId);
  const fields = buildProfileFields({
    address: user.partner_address,
    facebook_url: trimOrNull(user.partner_facebook_url) ?? legacy.facebook_url,
    instagram_url: trimOrNull(user.partner_instagram_url) ?? legacy.instagram_url,
    whatsapp_number: user.partner_whatsapp_number,
    tiktok_url: user.partner_tiktok_url,
    website_url: trimOrNull(user.partner_website_url) ?? legacy.website_url,
  });

  const [shop] = await db
    .select({
      id: shopsTable.id,
      address: shopsTable.address,
      facebook: shopsTable.facebook,
      instagram: shopsTable.instagram,
      tiktok: shopsTable.tiktok,
      whatsapp: shopsTable.whatsapp,
      website: shopsTable.website,
    })
    .from(shopsTable)
    .where(and(eq(shopsTable.user_id, userId), eq(shopsTable.is_active, true)))
    .limit(1);

  const social_profiles = shop ? await getShopSocialProfilesForApi(shop.id) : {};

  const profileFields = shop
    ? buildProfileFields({
        address: shop.address ?? user.partner_address,
        facebook_url: shop.facebook ?? trimOrNull(user.partner_facebook_url) ?? legacy.facebook_url,
        instagram_url: shop.instagram ?? trimOrNull(user.partner_instagram_url) ?? legacy.instagram_url,
        whatsapp_number: shop.whatsapp ?? user.partner_whatsapp_number,
        tiktok_url: shop.tiktok ?? user.partner_tiktok_url,
        website_url: shop.website ?? trimOrNull(user.partner_website_url) ?? legacy.website_url,
      })
    : fields;

  return {
    id: userId,
    business_name: partnerDisplayName(user),
    logo_url: resolvePartnerLogoUrl(user),
    tier,
    category_name,
    shop_id: shop?.id ?? null,
    social_profiles,
    ...profileFields,
  };
}

export async function getPartnerPublicProfile(publicId: number): Promise<PartnerPublicProfile | null> {
  if (!Number.isFinite(publicId) || publicId === 0) return null;

  if (publicId < 0) {
    return loadHomepagePartnerProfile(Math.abs(publicId));
  }
  return loadBusinessUserPartnerProfile(publicId);
}
