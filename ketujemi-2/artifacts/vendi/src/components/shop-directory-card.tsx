import { Link } from "wouter";
import { Facebook, Globe, Instagram, ExternalLink } from "lucide-react";
import { ShopRatingBadge } from "@/components/shop-rating-badge";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { translateDirectorySubcategory } from "@/lib/shop-directory-i18n";
import { directoryCategoryBySlug, directorySubcategoryBySlug } from "@/lib/shop-directory-taxonomy";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import { SHOP_COUNTRY_CODES, useShopFormCopy } from "@/lib/shop-application-i18n";

export type ShopDirectoryListItem = {
  id: number;
  shop_name: string;
  logo_url: string;
  directory_category_slug?: string | null;
  directory_subcategory_slug?: string | null;
  country: string;
  city: string;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  average_rating?: number | null;
  rating_count?: number;
  description?: string | null;
};

type Props = {
  shop: ShopDirectoryListItem;
  viewLabel: string;
};

export function ShopDirectoryCard({ shop, viewLabel }: Props) {
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const formCopy = useShopFormCopy();
  const cat = shop.directory_category_slug
    ? directoryCategoryBySlug(shop.directory_category_slug)
    : undefined;
  const sub =
    shop.directory_category_slug && shop.directory_subcategory_slug
      ? directorySubcategoryBySlug(shop.directory_category_slug, shop.directory_subcategory_slug)
      : undefined;

  const socials = [
    shop.facebook?.trim() ? { href: shop.facebook, icon: Facebook } : null,
    shop.instagram?.trim() ? { href: shop.instagram, icon: Instagram } : null,
    shop.website?.trim() ? { href: shop.website, icon: Globe } : null,
    shop.tiktok?.trim() ? { href: shop.tiktok, icon: ExternalLink } : null,
    shop.whatsapp?.trim()
      ? { href: `https://wa.me/${shop.whatsapp.replace(/\D/g, "")}`, icon: ExternalLink }
      : null,
  ].filter(Boolean) as { href: string; icon: React.ElementType }[];

  const countryLabel =
    SHOP_COUNTRY_CODES.includes(shop.country as (typeof SHOP_COUNTRY_CODES)[number])
      ? formCopy.countryLabels[shop.country as (typeof SHOP_COUNTRY_CODES)[number]]
      : shop.country;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <img
          src={shop.logo_url}
          alt=""
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-gray-100 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-gray-900 text-base sm:text-lg leading-tight line-clamp-2">
            {shop.shop_name}
          </h3>
          {sub ? (
            <p className="text-xs sm:text-sm font-semibold text-orange-600 mt-1 line-clamp-1">
              {translateDirectorySubcategory(sub, locale)}
            </p>
          ) : cat ? (
            <p className="text-xs sm:text-sm font-semibold text-orange-600 mt-1">{cat.nameSq}</p>
          ) : null}
          <p className="text-xs text-gray-500 mt-1">
            {shop.city} · {countryLabel}
          </p>
          <div className="mt-1.5">
            <ShopRatingBadge averageRating={shop.average_rating} ratingCount={shop.rating_count} />
          </div>
        </div>
      </div>
      {socials.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {socials.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              aria-label="Social"
            >
              <s.icon size={14} />
            </a>
          ))}
        </div>
      ) : null}
      <Link
        href={`/dyqani/${shop.id}`}
        className="mt-auto inline-flex items-center justify-center min-h-11 rounded-xl px-4 text-sm font-bold text-white"
        style={{ backgroundColor: BRAND_BLUE }}
      >
        {viewLabel}
      </Link>
    </article>
  );
}
