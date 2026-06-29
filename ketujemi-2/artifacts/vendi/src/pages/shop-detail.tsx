import { useRoute, Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Eye, Phone } from "lucide-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { SiteHeader } from "@/components/site-header";
import { ShopRatingBadge } from "@/components/shop-rating-badge";
import { ShopRatingsPanel } from "@/components/shop-ratings-panel";
import ListingCard from "@/components/listing-card";
import { BRAND_BLUE, BRAND_ORANGE } from "@/lib/brand-colors";
import { applyPageMeta, truncateMetaDescription } from "@/lib/page-meta";
import { translateCategory } from "@/lib/category-translations";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import {
  buildMapSearchQuery,
  fetchShopMapEmbedSrc,
  googleMapsOpenUrl,
  shopMapEmbedSrc,
} from "@/lib/google-maps-embed";
import { shopDetailSeoTitle, useShopDetailCopy } from "@/lib/shop-detail-i18n";
import { cn } from "@/lib/utils";
import { ShopSocialLinks } from "@/components/shop-social-links";
import { ShopSocialIconBar } from "@/components/shop-social-icon-bar";
import { shopPhoneHref } from "@/lib/shop-social-url-input";
import type { ShopSocialProfileData } from "@/components/shop-social-profiles";
import { ShopProductTile } from "@/components/shop-product-tile";
import { ShopProductDetailDialog } from "@/components/shop-product-detail-dialog";
import { SHOP_STOREFRONT_MAX_TILES } from "@/lib/shop-storefront-policy";
import type { ShopProductPublic } from "@/components/shop-product-card";
import { useShopProductsCopy } from "@/lib/shop-products-i18n";
import { recordShopView } from "@/lib/record-shop-view";
import { applyShopPwaMeta } from "@/lib/shop-pwa";
import { ShopPwaInstall } from "@/components/shop-pwa-install";

type ShopData = {
  id: number;
  slug?: string | null;
  public_path?: string | null;
  shop_name: string;
  logo_url: string;
  cover_image_url?: string | null;
  tagline?: string | null;
  business_hours?: string | null;
  description: string;
  category: string;
  category_id?: number | null;
  directory_category_id?: number | null;
  directory_subcategory_id?: number | null;
  directory_category_slug?: string | null;
  directory_subcategory_slug?: string | null;
  country: string;
  city: string;
  region: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  contact_name?: string;
  phone?: string;
  email?: string;
  average_rating?: number | null;
  rating_count?: number;
  views?: number;
  storefront_eligible?: boolean;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  youtube?: string | null;
  website?: string | null;
};

type SubcategoryFilter = {
  id: number;
  name: string;
  count: number;
};

type ListingRow = Parameters<typeof ListingCard>[0]["listing"];

export default function ShopDetailPage() {
  const [, params] = useRoute("/dyqani/:slugOrId");
  const slugOrId = params?.slugOrId?.trim() ?? "";
  const { uiLang, t } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const d = useShopDetailCopy();
  const pc = useShopProductsCopy();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<ShopProductPublic[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryFilter[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ShopProductPublic | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [socialProfiles, setSocialProfiles] = useState<
    Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>
  >({});
  const [mapEmbedSrc, setMapEmbedSrc] = useState("");

  useEffect(() => {
    if (!shop) {
      setMapEmbedSrc("");
      return;
    }
    const mapInput = {
      latitude: shop.latitude,
      longitude: shop.longitude,
      address: shop.address,
      city: shop.city,
      region: shop.region,
      country: shop.country,
    };
    // Show city map immediately when coordinates are missing (avoid blank iframe).
    setMapEmbedSrc(shopMapEmbedSrc(mapInput));

    let cancelled = false;
    void fetchShopMapEmbedSrc(mapInput).then((url) => {
      if (!cancelled && url) setMapEmbedSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [
    shop?.id,
    shop?.latitude,
    shop?.longitude,
    shop?.address,
    shop?.city,
    shop?.region,
    shop?.country,
  ]);

  function loadShop() {
    if (!slugOrId) return;
    setLoading(true);
    void fetchWithTimeout(`/api/shops/${encodeURIComponent(slugOrId)}?lang=${encodeURIComponent(uiLang)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json() as Promise<{
          shop: ShopData;
          products?: ShopProductPublic[];
          product_count?: number;
          listings: ListingRow[];
          active_count?: number;
          subcategories?: SubcategoryFilter[];
          social_profiles?: Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>;
        }>;
      })
      .then((data) => {
        setShop(data.shop);
        setProducts(data.products ?? []);
        setListings(data.listings);
        setActiveCount(data.active_count ?? data.listings.length);
        setSubcategories(data.subcategories ?? []);
        setSocialProfiles(data.social_profiles ?? {});
        setCategoryFilter(null);
        const categoryLabel = translateCategory(data.shop.category, locale);
        const title = shopDetailSeoTitle(d, data.shop.shop_name, categoryLabel, data.shop.city);
        const description = truncateMetaDescription(data.shop.description, 150);
        applyPageMeta({
          title,
          description,
          ogTitle: title,
          ogDescription: description,
          ogImage: data.shop.logo_url,
        });
      })
      .catch(() => {
        setShop(null);
        setListings([]);
        setSubcategories([]);
        setActiveCount(0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadShop();
  }, [slugOrId, d, locale, uiLang]);

  useEffect(() => {
    if (!shop?.id || loading || !shop) return;
    void recordShopView(shop.id, (views) => {
      setShop((prev) => (prev ? { ...prev, views } : prev));
    });
  }, [shop?.id, loading]);

  useEffect(() => {
    if (!shop || loading) return;
    const slugKey = shop.slug?.trim() || String(shop.id);
    return applyShopPwaMeta({
      slugOrId: slugKey,
      shopName: shop.shop_name,
      logoUrl: shop.logo_url,
    });
  }, [shop?.id, shop?.slug, shop?.shop_name, shop?.logo_url, loading]);

  const filteredListings = useMemo(() => {
    if (!categoryFilter) return listings;
    return listings.filter((l) => l.category_id === categoryFilter);
  }, [listings, categoryFilter]);

  const storefrontProducts = useMemo(
    () => products.slice(0, SHOP_STOREFRONT_MAX_TILES),
    [products],
  );

  function openProductDetail(product: ShopProductPublic) {
    setSelectedProduct(product);
    setProductDetailOpen(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: BRAND_BLUE }} />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-xl font-bold text-gray-900">{d.notFound}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 font-semibold">
            {d.backHome}
          </Link>
        </div>
      </div>
    );
  }

  const mapExternalQuery = buildMapSearchQuery({
    address: shop.address,
    city: shop.city,
    region: shop.region,
    country: shop.country,
  });
  const mapExternalUrl = googleMapsOpenUrl(mapExternalQuery);
  const heroBackground = shop.cover_image_url?.trim()
    ? `url(${shop.cover_image_url}) center/cover no-repeat`
    : `linear-gradient(135deg, ${BRAND_BLUE} 0%, #1e3a8a 45%, ${BRAND_ORANGE} 100%)`;
  const phoneHref = shopPhoneHref(shop.phone);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <header className="relative text-white overflow-hidden">
        <div
          className="absolute inset-0 scale-105"
          style={{ background: heroBackground }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" aria-hidden />
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <img
              src={shop.logo_url}
              alt={shop.shop_name}
              className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl object-contain border-4 border-white/40 shadow-2xl bg-white/10 backdrop-blur-sm"
            />
            <div className="flex-1 text-center sm:text-left space-y-2">
              {shop.storefront_eligible !== false ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur px-3 py-1 rounded-full border border-white/25">
                  ✓ {pc.storefrontBadge}
                </span>
              ) : null}
              <h1 className="text-3xl sm:text-4xl font-black drop-shadow-lg">{shop.shop_name}</h1>
              {shop.tagline ? (
                <p className="text-lg text-white/90 font-medium max-w-xl">{shop.tagline}</p>
              ) : null}
              <p className="text-white/85 font-medium">{translateCategory(shop.category, locale)}</p>
              <p className="text-sm text-white/75 flex items-center justify-center sm:justify-start gap-1">
                <MapPin size={14} />
                {shop.city}, {shop.region} — {shop.country}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                <ShopRatingBadge
                  averageRating={shop.average_rating}
                  ratingCount={shop.rating_count}
                  size="md"
                  tone="onDark"
                />
                <span className="inline-flex items-center gap-1 text-sm text-white/85">
                  <Eye size={14} aria-hidden />
                  {(shop.views ?? 0).toLocaleString()} {t.views}
                </span>
              </div>
              <ShopSocialIconBar
                variant="hero"
                className="justify-center sm:justify-start pt-3"
                fields={{
                  facebook: shop.facebook,
                  instagram: shop.instagram,
                  tiktok: shop.tiktok,
                  youtube: shop.youtube,
                  whatsapp: shop.whatsapp,
                  website: shop.website,
                }}
              />
              {phoneHref ? (
                <a
                  href={phoneHref}
                  className="inline-flex items-center justify-center gap-2 mt-3 min-h-11 px-5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-sm backdrop-blur transition-colors"
                >
                  <Phone size={16} />
                  Thirr {shop.phone}
                </a>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <ShopPwaInstall shopName={shop.shop_name} variant="hero" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {shop.storefront_eligible !== false ? (
          <section>
            <div className="mb-8 space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{pc.catalogTitle}</h2>
              <p className="text-sm text-gray-500 max-w-2xl">{pc.catalogSubtitle}</p>
            </div>
            {storefrontProducts.length === 0 ? (
              <p className="text-gray-500 text-sm rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
                {pc.noProducts}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {storefrontProducts.map((product) => (
                  <ShopProductTile
                    key={product.id}
                    product={product}
                    onOpen={() => openProductDetail(product)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : null}

        <section className="rounded-2xl bg-white border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{d.aboutTitle}</h2>
          {shop.tagline?.trim() ? (
            <p className="text-base font-semibold text-blue-800 mb-3">{shop.tagline}</p>
          ) : null}
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{shop.description}</p>
        </section>

        {shop.business_hours?.trim() ? (
          <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{pc.businessHours}</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{shop.business_hours}</p>
          </section>
        ) : null}

        <ShopRatingsPanel shopId={shop.id} />

        <ShopSocialLinks
          fields={{
            facebook: shop.facebook,
            instagram: shop.instagram,
            tiktok: shop.tiktok,
            whatsapp: shop.whatsapp,
            website: shop.website,
          }}
          enriched={socialProfiles}
          title={d.socialContactTitle}
        />

        <div className="flex justify-center sm:justify-start">
          <ShopPwaInstall shopName={shop.shop_name} variant="bar" />
        </div>

        <section className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
          {mapEmbedSrc ? (
            <iframe
              title={d.mapTitle}
              className="w-full h-64 sm:h-80 border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              src={mapEmbedSrc}
            />
          ) : (
            <div className="w-full h-64 sm:h-80 bg-gray-100 animate-pulse" aria-hidden />
          )}
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600">{shop.address}</p>
            <a
              href={mapExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap"
            >
              {d.mapOpenGoogle}
            </a>
          </div>
        </section>

        {filteredListings.length > 0 ? (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-black text-gray-900">{d.listingsTitle}</h2>
              <p className="text-sm font-semibold text-blue-700">
                {d.activeListingsCount.replace("{count}", String(activeCount))}
              </p>
            </div>

            {subcategories.length > 1 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setCategoryFilter(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors",
                    categoryFilter === null
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300",
                  )}
                >
                  {d.filterAll}
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setCategoryFilter(sub.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors",
                      categoryFilter === sub.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300",
                    )}
                  >
                    {translateCategory(sub.name, locale)} ({sub.count})
                  </button>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <ShopProductDetailDialog
        product={selectedProduct}
        open={productDetailOpen}
        onOpenChange={setProductDetailOpen}
        shop={{
          phone: shop?.phone,
          shop_name: shop?.shop_name,
          facebook: shop?.facebook,
          instagram: shop?.instagram,
          tiktok: shop?.tiktok,
          whatsapp: shop?.whatsapp,
          website: shop?.website,
          youtube: shop?.youtube,
        }}
      />
    </div>
  );
}
