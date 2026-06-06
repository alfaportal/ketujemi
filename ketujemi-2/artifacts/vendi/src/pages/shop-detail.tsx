import { useRoute, Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Facebook, Instagram, Globe, ExternalLink } from "lucide-react";
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
import { shopDetailSeoTitle, useShopDetailCopy } from "@/lib/shop-detail-i18n";
import { cn } from "@/lib/utils";

type ShopData = {
  id: number;
  shop_name: string;
  logo_url: string;
  description: string;
  category: string;
  country: string;
  city: string;
  region: string;
  address: string;
  average_rating?: number | null;
  rating_count?: number;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  website?: string | null;
};

type SubcategoryFilter = {
  id: number;
  name: string;
  count: number;
};

type ListingRow = Parameters<typeof ListingCard>[0]["listing"];

export default function ShopDetailPage() {
  const [, params] = useRoute("/dyqani/:id");
  const id = Number(params?.id);
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const d = useShopDetailCopy();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<ShopData | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryFilter[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    void fetchWithTimeout(`/api/shops/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json() as Promise<{
          shop: ShopData;
          listings: ListingRow[];
          active_count?: number;
          subcategories?: SubcategoryFilter[];
        }>;
      })
      .then((data) => {
        setShop(data.shop);
        setListings(data.listings);
        setActiveCount(data.active_count ?? data.listings.length);
        setSubcategories(data.subcategories ?? []);
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
  }, [id, d, locale]);

  const filteredListings = useMemo(() => {
    if (!categoryFilter) return listings;
    return listings.filter((l) => l.category_id === categoryFilter);
  }, [listings, categoryFilter]);

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

  const mapQuery = encodeURIComponent(`${shop.address}, ${shop.city}, ${shop.country}`);
  const socials = [
    shop.facebook?.trim() ? { href: shop.facebook, label: "Facebook", icon: Facebook } : null,
    shop.instagram?.trim() ? { href: shop.instagram, label: "Instagram", icon: Instagram } : null,
    shop.website?.trim() ? { href: shop.website, label: "Website", icon: Globe } : null,
    shop.tiktok?.trim() ? { href: shop.tiktok, label: "TikTok", icon: ExternalLink } : null,
    shop.whatsapp?.trim()
      ? { href: `https://wa.me/${shop.whatsapp.replace(/\D/g, "")}`, label: "WhatsApp", icon: ExternalLink }
      : null,
  ].filter(Boolean) as { href: string; label: string; icon: React.ElementType }[];

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <header
        className="text-white px-4 py-10"
        style={{ background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_ORANGE} 100%)` }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          <img
            src={shop.logo_url}
            alt={shop.shop_name}
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black">{shop.shop_name}</h1>
            <p className="mt-1 text-white/90 font-medium">
              {translateCategory(shop.category, locale)}
            </p>
            <p className="mt-2 text-sm text-white/80 flex items-center justify-center sm:justify-start gap-1">
              <MapPin size={14} />
              {shop.city}, {shop.region} — {shop.country}
            </p>
            <div className="mt-2 flex justify-center sm:justify-start">
              <ShopRatingBadge
                averageRating={shop.average_rating}
                ratingCount={shop.rating_count}
                size="md"
                tone="onDark"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{d.aboutTitle}</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{shop.description}</p>
        </section>

        <ShopRatingsPanel shopId={shop.id} />

        {socials.length > 0 ? (
          <section className="flex flex-wrap gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white min-h-11"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                <s.icon size={16} />
                {s.label}
              </a>
            ))}
          </section>
        ) : null}

        <section className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
          <iframe
            title={d.mapTitle}
            className="w-full h-64 sm:h-80 border-0"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
          />
          <p className="px-4 py-3 text-sm text-gray-600">{shop.address}</p>
        </section>

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

          {filteredListings.length === 0 ? (
            <p className="text-gray-500 text-sm">{d.noListings}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
