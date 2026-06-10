import { Link } from "wouter";
import { MapPin } from "lucide-react";
import { translateCategory } from "@/lib/category-translations";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import { useShopDashboardCopy } from "@/lib/shop-dashboard-i18n";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { ShopSocialLinks } from "@/components/shop-social-links";
import type { ShopSocialProfileData } from "@/components/shop-social-profiles";

export type ListingShopInfo = {
  shop_id: number;
  shop_name: string | null;
  shop_logo_url: string | null;
  shop_category: string | null;
  shop_city: string | null;
  shop_facebook?: string | null;
  shop_instagram?: string | null;
  shop_tiktok?: string | null;
  shop_whatsapp?: string | null;
  shop_website?: string | null;
  shop_verified?: boolean;
  shop_social_profiles?: Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>;
};

type Props = {
  shop: ListingShopInfo;
};

export function ListingShopCard({ shop }: Props) {
  const { uiLang } = useMarket();
  const c = useShopDashboardCopy();
  const locale = translationKeyForUiLang(uiLang);

  if (!shop.shop_verified || !shop.shop_id) return null;

  const enriched = shop.shop_social_profiles ?? {};

  return (
    <div
      className="rounded-2xl border-2 bg-white p-4 shadow-sm"
      style={{ borderColor: BRAND_BLUE }}
      data-testid="listing-shop-card"
    >
      <div className="flex gap-4">
        {shop.shop_logo_url ? (
          <img
            src={shop.shop_logo_url}
            alt={shop.shop_name ?? ""}
            className="h-16 w-16 rounded-xl object-cover border border-gray-100 shrink-0"
          />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-blue-50 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{shop.shop_name}</p>
          {shop.shop_category ? (
            <p className="text-sm text-gray-600 mt-0.5">
              {translateCategory(shop.shop_category, locale)}
            </p>
          ) : null}
          {shop.shop_city ? (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin size={12} className="shrink-0" />
              {shop.shop_city}
            </p>
          ) : null}
        </div>
      </div>
      <ShopSocialLinks
        compact
        enriched={enriched}
        fields={{
          facebook: shop.shop_facebook,
          instagram: shop.shop_instagram,
          tiktok: shop.shop_tiktok,
          whatsapp: shop.shop_whatsapp,
          website: shop.shop_website,
        }}
        className="mt-3"
        onLinkClick={(e) => e.stopPropagation()}
      />
      <Link
        href={`/dyqani/${shop.shop_id}`}
        className="mt-4 flex items-center justify-center w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: BRAND_BLUE }}
      >
        {c.viewShop}
      </Link>
    </div>
  );
}
