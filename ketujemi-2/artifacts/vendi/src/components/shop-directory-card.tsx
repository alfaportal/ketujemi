import { Link } from "wouter";
import { ShopRatingBadge } from "@/components/shop-rating-badge";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { translateDirectoryCategory, translateDirectorySubcategory } from "@/lib/shop-directory-i18n";
import { directoryCategoryBySlug, directorySubcategoryBySlug } from "@/lib/shop-directory-taxonomy";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import { SHOP_COUNTRY_CODES, useShopFormCopy } from "@/lib/shop-application-i18n";
import { ShopSocialLinks } from "@/components/shop-social-links";

export type ShopDirectoryListItem = {
  id: number;
  slug?: string | null;
  public_path?: string | null;
  shop_name: string;
  logo_url: string;
  category?: string | null;
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
          {cat && sub ? (
            <p className="text-xs sm:text-sm mt-1 line-clamp-2">
              <span className="font-bold text-blue-700">{translateDirectoryCategory(cat, locale)}</span>
              <span className="text-gray-400 mx-1">·</span>
              <span className="font-semibold text-orange-600">
                {translateDirectorySubcategory(sub, locale)}
              </span>
            </p>
          ) : cat ? (
            <p className="text-xs sm:text-sm font-semibold text-orange-600 mt-1">
              {translateDirectoryCategory(cat, locale)}
            </p>
          ) : shop.category ? (
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1 line-clamp-1">{shop.category}</p>
          ) : null}
          <p className="text-xs text-gray-500 mt-1">
            {shop.city} · {countryLabel}
          </p>
          <div className="mt-1.5">
            <ShopRatingBadge averageRating={shop.average_rating} ratingCount={shop.rating_count} />
          </div>
        </div>
      </div>
      <ShopSocialLinks
        compact
        fields={{
          facebook: shop.facebook,
          instagram: shop.instagram,
          tiktok: shop.tiktok,
          whatsapp: shop.whatsapp,
          website: shop.website,
        }}
      />
      <Link
        href={shop.public_path ?? (shop.slug ? `/dyqani/${shop.slug}` : `/dyqani/${shop.id}`)}
        className="mt-auto inline-flex items-center justify-center min-h-11 rounded-xl px-4 text-sm font-bold text-white"
        style={{ backgroundColor: BRAND_BLUE }}
      >
        {viewLabel}
      </Link>
    </article>
  );
}
