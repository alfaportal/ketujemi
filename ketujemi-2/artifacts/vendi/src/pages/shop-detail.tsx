import { useRoute, Link, useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useProfileEditGate } from "@/hooks/use-profile-edit-gate";
import { ProfileEditGateFlow } from "@/components/profile-edit-gate-flow";
import { DeletionExitSurveyModal } from "@/components/deletion-exit-survey-modal";
import { Loader2, MapPin, Facebook, Instagram, Globe, ExternalLink, Pencil, Trash2 } from "lucide-react";
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
  buildCityMapQuery,
  buildMapSearchQuery,
  fetchShopMapEmbedSrc,
  googleMapsOpenUrl,
  hasShopCoordinates,
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
import {
  ShopSocialProfiles,
  type ShopSocialProfileData,
} from "@/components/shop-social-profiles";
import { shopWhatsappHref } from "@/lib/shop-social-url-input";

type ShopData = {
  id: number;
  shop_name: string;
  logo_url: string;
  description: string;
  category: string;
  category_id?: number | null;
  directory_category_id?: number | null;
  directory_subcategory_id?: number | null;
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
  const { uiLang, t } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const d = useShopDetailCopy();
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<ShopData | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryFilter[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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
    if (!id) return;
    setLoading(true);
    void fetchWithTimeout(`/api/shops/${id}?lang=${encodeURIComponent(uiLang)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json() as Promise<{
          shop: ShopData;
          listings: ListingRow[];
          active_count?: number;
          subcategories?: SubcategoryFilter[];
          is_owner?: boolean;
          social_profiles?: Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>;
        }>;
      })
      .then((data) => {
        setShop(data.shop);
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
  }, [id, d, locale, uiLang]);

  useEffect(() => {
    if (editRequested && gate.isUnlocked) {
      setEditOpen(true);
      setEditRequested(false);
    }
  }, [editRequested, gate.isUnlocked]);

  function onEditShopClick() {
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
        body: JSON.stringify({ ...values, profile_change_token: gate.changeToken }),
      });
      if (!res.ok) throw new Error("fail");
      toast({ title: d.shopSaved });
      setEditOpen(false);
      loadShop();
    } catch {
      toast({ title: d.shopSaveError, variant: "destructive" });
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

  const mapExternalQuery = hasShopCoordinates(shop.latitude, shop.longitude)
    ? buildMapSearchQuery({
        address: shop.address,
        city: shop.city,
        region: shop.region,
        country: shop.country,
      })
    : buildCityMapQuery({
        city: shop.city,
        region: shop.region,
        country: shop.country,
      });
  const mapExternalUrl = googleMapsOpenUrl(mapExternalQuery);
  const hasEnrichedIg = Boolean(socialProfiles.instagram);
  const hasEnrichedTt = Boolean(socialProfiles.tiktok);
  const whatsappHref = shopWhatsappHref(shop.whatsapp);
  const socials = [
    shop.facebook?.trim() ? { href: shop.facebook, label: "Facebook", icon: Facebook } : null,
    shop.instagram?.trim() && !hasEnrichedIg
      ? { href: shop.instagram, label: "Instagram", icon: Instagram }
      : null,
    shop.website?.trim() ? { href: shop.website, label: "Website", icon: Globe } : null,
    shop.tiktok?.trim() && !hasEnrichedTt
      ? { href: shop.tiktok, label: "TikTok", icon: ExternalLink }
      : null,
    whatsappHref ? { href: whatsappHref, label: "WhatsApp", icon: ExternalLink } : null,
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
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-contain border-4 border-white/30 shadow-lg"
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
        {isOwner ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 font-semibold"
              onClick={onEditShopClick}
            >
              {d.editShop}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 font-semibold bg-red-600 hover:bg-red-700"
              onClick={onDeleteShopClick}
            >
              {d.deleteShop}
            </Button>
          </div>
        ) : null}

        <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{d.aboutTitle}</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{shop.description}</p>
        </section>

        <ShopRatingsPanel shopId={shop.id} />

        {hasEnrichedIg || hasEnrichedTt ? (
          <ShopSocialProfiles profiles={socialProfiles} />
        ) : null}

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
      </div>

      {isOwner && user ? <ProfileEditGateFlow user={user} gate={gate} /> : null}

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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{d.editShop}</DialogTitle>
          </DialogHeader>
          {shop ? (
            <ShopEditForm
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
