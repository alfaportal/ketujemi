import { useRoute, Link, useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useProfileEditGate } from "@/hooks/use-profile-edit-gate";
import { ProfileEditGateFlow } from "@/components/profile-edit-gate-flow";
import { DeletionExitSurveyModal } from "@/components/deletion-exit-survey-modal";
import { Loader2, MapPin, Settings, Eye, Phone } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteListing,
  getGetListingsQueryKey,
  getGetRecentListingsQueryKey,
  getGetFeaturedListingsQueryKey,
} from "@workspace/api-client-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { SiteHeader } from "@/components/site-header";
import { ShopRatingBadge } from "@/components/shop-rating-badge";
import { ShopRatingsPanel } from "@/components/shop-ratings-panel";
import ListingCard from "@/components/listing-card";
import { ListingShareButtons, listingPublicUrl } from "@/components/listing-share-buttons";
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
import {
  ShopEditForm,
  adminRowToFormValues,
  type ShopEditFormValues,
} from "@/components/shop-edit-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShopSocialLinks } from "@/components/shop-social-links";
import { ShopSocialIconBar } from "@/components/shop-social-icon-bar";
import { shopPhoneHref } from "@/lib/shop-social-url-input";
import type { ShopSocialProfileData } from "@/components/shop-social-profiles";
import { ShopProductTile } from "@/components/shop-product-tile";
import { ShopProductDetailDialog } from "@/components/shop-product-detail-dialog";
import { SHOP_STOREFRONT_MAX_TILES } from "@/lib/shop-storefront-policy";
import type { ShopProductPublic } from "@/components/shop-product-card";
import { ShopProductManager } from "@/components/shop-product-manager";
import { ShopEditContentNotice } from "@/components/shop-edit-content-notice";
import { useShopProductsCopy } from "@/lib/shop-products-i18n";
import { recordShopView } from "@/lib/record-shop-view";

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
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<ShopProductPublic[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryFilter[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [contentNoticeOpen, setContentNoticeOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopProductPublic | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [editTab, setEditTab] = useState<"site" | "products">("site");
  const [editRequested, setEditRequested] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteShopOpen, setDeleteShopOpen] = useState(false);
  const [socialProfiles, setSocialProfiles] = useState<
    Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>
  >({});
  const [mapEmbedSrc, setMapEmbedSrc] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const gate = useProfileEditGate(user, refresh);

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
          is_owner?: boolean;
          social_profiles?: Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>;
        }>;
      })
      .then((data) => {
        setShop(data.shop);
        setProducts(data.products ?? []);
        setListings(data.listings);
        setActiveCount(data.active_count ?? data.listings.length);
        setSubcategories(data.subcategories ?? []);
        setIsOwner(!!data.is_owner);
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
        setIsOwner(false);
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
    if (editRequested && gate.isUnlocked) {
      setEditOpen(true);
      setEditRequested(false);
    }
  }, [editRequested, gate.isUnlocked]);

  function onEditShopClick() {
    setEditTab("site");
    setContentNoticeOpen(true);
  }

  function onContentNoticeContinue() {
    setContentNoticeOpen(false);
    if (gate.isUnlocked) {
      setEditOpen(true);
      return;
    }
    setEditRequested(true);
    gate.startGate();
  }

  function onDeleteShopClick() {
    setDeleteShopOpen(true);
  }

  async function onSaveShopEdit(values: ShopEditFormValues) {
    if (!shop || !gate.changeToken) return;
    setEditSaving(true);
    try {
      const res = await fetchWithTimeout(`/api/shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile_change_token: gate.changeToken,
          shop_name: values.shop_name,
          logo_url: values.logo_url,
          cover_image_url: values.cover_image_url.trim() || null,
          tagline: values.tagline.trim() || null,
          business_hours: values.business_hours.trim() || null,
          description: values.description,
          category: values.category,
          category_id: values.category_id,
          directory_category_id: values.directory_category_id,
          directory_subcategory_id: values.directory_subcategory_id,
          directory_category_slug: values.directory_category_slug,
          directory_subcategory_slug: values.directory_subcategory_slug,
          country: values.country,
          city: values.city,
          region: values.region,
          address: values.address,
          latitude: values.latitude,
          longitude: values.longitude,
          contact_name: values.contact_name,
          phone: values.phone,
          email: values.email,
          facebook: values.facebook,
          instagram: values.instagram,
          tiktok: values.tiktok,
          whatsapp: values.whatsapp,
          website: values.website,
          youtube: values.youtube,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        shop?: ShopData;
        social_profiles?: Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(payload.message ?? d.shopSaveError);
      }
      const savedShop = payload.shop;
      if (savedShop) {
        setShop((prev) =>
          prev
            ? {
                ...prev,
                ...savedShop,
                facebook: savedShop.facebook ?? null,
                instagram: savedShop.instagram ?? null,
                tiktok: savedShop.tiktok ?? null,
                whatsapp: savedShop.whatsapp ?? null,
                website: savedShop.website ?? null,
                youtube: savedShop.youtube ?? null,
              }
            : prev,
        );
      }
      if (payload.social_profiles) {
        setSocialProfiles(payload.social_profiles);
      }
      toast({ title: d.shopSaved });
      setEditOpen(false);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : d.shopSaveError,
        variant: "destructive",
      });
    } finally {
      setEditSaving(false);
    }
  }

  const deleteMutation = useDeleteListing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetFeaturedListingsQueryKey() });
        toast({ title: t.deleteSuccess });
        loadShop();
      },
      onError: () => {
        toast({ title: t.deleteError, variant: "destructive" });
      },
    },
  });

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
              isOwner ? (
                <p className="text-gray-500 text-sm rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
                  {pc.noProductsOwner}
                </p>
              ) : (
                <p className="text-gray-500 text-sm rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
                  {pc.noProducts}
                </p>
              )
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

        {filteredListings.length > 0 && shop.storefront_eligible === false ? (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-black text-gray-900">{d.listingsTitle}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-blue-700">
                {d.activeListingsCount.replace("{count}", String(activeCount))}
              </p>
              {isOwner ? (
                <Link href="/listings/new">
                  <Button
                    type="button"
                    className="min-h-11 font-bold text-white"
                    style={{ background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})` }}
                  >
                    {d.postNewListing}
                  </Button>
                </Link>
              ) : null}
            </div>
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

          {isOwner && activeCount === 0 ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-6 text-center space-y-4">
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{d.ownerWelcomeEmpty}</p>
              <Link href="/listings/new">
                <Button
                  type="button"
                  className="min-h-11 font-bold text-white"
                  style={{ background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})` }}
                >
                  {d.postFirstListing}
                </Button>
              </Link>
            </div>
          ) : filteredListings.length === 0 ? (
            <p className="text-gray-500 text-sm">{d.noListings}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredListings.map((l) => (
                <div key={l.id} className="space-y-2">
                  <ListingCard listing={l} />
                  {isOwner ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <ListingShareButtons url={listingPublicUrl(l.id)} variant="compact" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-10 gap-1.5"
                        onClick={() => setLocation(`/listings/${l.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                        ✏️ {d.editListing}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="min-h-10 gap-1.5 bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            🗑️ {d.deleteListing}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{d.deleteListingTitle}</AlertDialogTitle>
                            <AlertDialogDescription>{d.deleteListingDesc}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{d.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => deleteMutation.mutate({ id: l.id })}
                            >
                              {d.deleteListing}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
        ) : null}
      </div>

      {isOwner && user ? <ProfileEditGateFlow user={user} gate={gate} /> : null}

      {contentNoticeOpen ? <ShopEditContentNotice onContinue={onContentNoticeContinue} /> : null}

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

      {isOwner ? (
        <button
          type="button"
          onClick={onEditShopClick}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{ backgroundColor: BRAND_BLUE }}
          aria-label={d.editShop}
          title={d.editShop}
        >
          <Settings className="h-6 w-6" />
        </button>
      ) : null}

      {isOwner && user && shop ? (
        <DeletionExitSurveyModal
          open={deleteShopOpen}
          onOpenChange={setDeleteShopOpen}
          mode="shop"
          shopId={shop.id}
          user={user}
          refresh={refresh}
          onSuccess={() => setLocation("/profili")}
        />
      ) : null}

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditTab("site");
        }}
      >
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{d.editShop}</DialogTitle>
          </DialogHeader>
          {shop && shop.storefront_eligible !== false ? (
            <div className="flex gap-2 border-b border-gray-100 pb-2 shrink-0">
              <Button
                type="button"
                variant={editTab === "site" ? "default" : "outline"}
                className="min-h-9"
                onClick={() => setEditTab("site")}
              >
                {pc.editTabWebsite}
              </Button>
              <Button
                type="button"
                variant={editTab === "products" ? "default" : "outline"}
                className="min-h-9"
                onClick={() => setEditTab("products")}
              >
                {pc.editTabProducts}
              </Button>
            </div>
          ) : null}
          {shop && editTab === "products" && shop.storefront_eligible !== false ? (
            <div className="overflow-y-auto flex-1 min-h-0 pr-1 py-2">
              <ShopProductManager
                changeToken={gate.changeToken}
                storefrontEligible
                onProductsChange={loadShop}
              />
            </div>
          ) : null}
          {shop && editTab === "site" ? (
            <ShopEditForm
              variant="owner"
              initial={adminRowToFormValues({
                ...shop,
                category_id: shop.category_id ?? null,
                directory_category_id: shop.directory_category_id ?? null,
                directory_subcategory_id: shop.directory_subcategory_id ?? null,
                contact_name: shop.contact_name ?? "",
                phone: shop.phone ?? "",
                email: shop.email ?? "",
                facebook: shop.facebook ?? null,
                instagram: shop.instagram ?? null,
                tiktok: shop.tiktok ?? null,
                whatsapp: shop.whatsapp ?? null,
                website: shop.website ?? null,
                youtube: shop.youtube ?? null,
                status: "approved",
              })}
              onSubmit={onSaveShopEdit}
              onCancel={() => setEditOpen(false)}
              saving={editSaving}
              labels={{ save: d.saveShop, cancel: d.cancel }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
