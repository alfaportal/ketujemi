import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { useProfileEditGate } from "@/hooks/use-profile-edit-gate";
import { ProfileEditGateFlow } from "@/components/profile-edit-gate-flow";
import { Link } from "wouter";
import { Loader2, Store, Eye, Package, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useShopDashboardCopy } from "@/lib/shop-dashboard-i18n";
import { translateCategory } from "@/lib/category-translations";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import ListingCard from "@/components/listing-card";
import { ListingShareButtons, listingPublicUrl } from "@/components/listing-share-buttons";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";
import { ShopProductManager } from "@/components/shop-product-manager";
import { ShopEditContentNotice } from "@/components/shop-edit-content-notice";
import { useShopProductsCopy } from "@/lib/shop-products-i18n";
import { ShopPublicLinkCopy } from "@/components/shop-public-link-copy";
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

type ShopMe = {
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
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  youtube?: string | null;
  storefront_eligible?: boolean;
};

type ShopMeResponse = {
  shop: ShopMe | null;
  application: { status: string } | null;
  listing_count: number;
  product_count?: number;
  total_views: number;
  storefront_eligible?: boolean;
};

type ShopListing = Parameters<typeof ListingCard>[0]["listing"];

export function ProfileShopDashboard() {
  const c = useShopDashboardCopy();
  const pc = useShopProductsCopy();
  const { uiLang, t } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const { toast } = useToast();
  const { user, refresh } = useAuth();
  const gate = useProfileEditGate(user, refresh);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ShopMeResponse | null>(null);
  const [showListings, setShowListings] = useState(false);
  const [shopListings, setShopListings] = useState<ShopListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [contentNoticeOpen, setContentNoticeOpen] = useState(false);
  const [editRequested, setEditRequested] = useState(false);
  const [saving, setSaving] = useState(false);

  function loadMe() {
    setLoading(true);
    void fetchWithTimeout("/api/shops/me", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("fail");
        return r.json() as Promise<ShopMeResponse>;
      })
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    if (editRequested && gate.isUnlocked) {
      setEditOpen(true);
      setEditRequested(false);
    }
  }, [editRequested, gate.isUnlocked]);

  function loadShopListings() {
    setListingsLoading(true);
    void fetchWithTimeout("/api/shops/me/listings", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("fail");
        return r.json() as Promise<{ listings: ShopListing[] }>;
      })
      .then((res) => setShopListings(res.listings ?? []))
      .catch(() => setShopListings([]))
      .finally(() => setListingsLoading(false));
  }

  function onProductsChange() {
    loadMe();
    if (showListings) loadShopListings();
  }

  function toggleListings() {
    const next = !showListings;
    setShowListings(next);
    if (next && shopListings.length === 0) loadShopListings();
  }

  function onEditShopClick() {
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

  async function onSaveShopEdit(values: ShopEditFormValues) {
    if (!data?.shop || !gate.changeToken) return;
    setSaving(true);
    try {
      const res = await fetchWithTimeout(`/api/shops/${data.shop.id}`, {
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
        shop?: ShopMe;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(payload.message ?? c.saveShop);
      }
      const saved = payload.shop;
      if (saved) {
        setData((prev) => (prev?.shop ? { ...prev, shop: { ...prev.shop, ...saved } } : prev));
      }
      const publicUrl =
        saved?.public_path ??
        data.shop.public_path ??
        `/dyqani/${saved?.slug ?? data.shop.slug ?? data.shop.id}`;
      toast({
        title: storefrontEligible ? c.shopSavedPublic : c.shopSaved,
        description: storefrontEligible ? c.shopSavedPublicHint : undefined,
      });
      setEditOpen(false);
      if (storefrontEligible) {
        window.open(publicUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : c.saveShop,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data?.shop) return null;

  const shop = data.shop;
  const statusLabel =
    data.application?.status === "pending" ? c.statusPending : c.statusApproved;
  const storefrontEligible = !!data.storefront_eligible;

  return (
    <section className="pt-4 border-t border-gray-100 space-y-4" data-testid="profile-shop-dashboard">
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5" style={{ color: BRAND_BLUE }} />
        <h2 className="text-base font-bold text-gray-900">{c.myShop}</h2>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <img
            src={shop.logo_url}
            alt={shop.shop_name}
            className="h-14 w-14 rounded-xl object-cover border border-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">{shop.shop_name}</p>
            <p className="text-sm text-gray-600">{translateCategory(shop.category, locale)}</p>
            <span
              className={cn(
                "inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                data.application?.status === "pending"
                  ? "bg-amber-100 text-amber-900"
                  : "bg-green-100 text-green-800",
              )}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-white border border-gray-100 px-3 py-2">
            <div className="flex items-center gap-1 text-gray-500">
              <Package size={14} />
              {storefrontEligible ? pc.manageProducts : c.totalListings}
            </div>
            <p className="font-bold text-gray-900 mt-0.5">
              {storefrontEligible ? (data.product_count ?? 0) : data.listing_count}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-3 py-2">
            <div className="flex items-center gap-1 text-gray-500">
              <Eye size={14} />
              {c.totalViews}
            </div>
            <p className="font-bold text-gray-900 mt-0.5">{data.total_views.toLocaleString()}</p>
          </div>
        </div>

        {storefrontEligible && (shop.public_path || shop.slug || shop.id) ? (
          <ShopPublicLinkCopy
            slug={shop.slug}
            shopId={shop.id}
            publicPath={shop.public_path}
          />
        ) : null}

        {storefrontEligible ? (
          <p className="text-xs text-gray-600 leading-relaxed rounded-lg bg-white/80 border border-indigo-100 px-3 py-2">
            {pc.autoListingHint} {pc.maxTilesHint}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Link href="/listings/new">
            <Button className="w-full min-h-11" style={{ backgroundColor: BRAND_BLUE }}>
              {c.postListing}
            </Button>
          </Link>
          <Button type="button" variant="outline" className="w-full min-h-11" onClick={toggleListings}>
            {c.manageListings}
            {showListings ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-11"
            onClick={onEditShopClick}
          >
            <Pencil size={16} className="mr-2" />
            {storefrontEligible ? c.editStorefront : c.editShop}
          </Button>
          <Link href={shop.public_path ?? `/dyqani/${shop.slug ?? shop.id}`}>
            <Button type="button" variant="ghost" className="w-full min-h-11 text-blue-700">
              {c.viewShop}
            </Button>
          </Link>
        </div>

        {showListings ? (
          <div className="space-y-3 pt-2 border-t border-blue-100">
            {listingsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : shopListings.length === 0 ? (
              <p className="text-sm text-gray-500">{c.noShopListings}</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {shopListings.map((listing) => (
                  <div key={listing.id} className="space-y-2">
                    <ListingCard listing={listing} />
                    <ListingShareButtons
                      title={listing.title}
                      url={listingPublicUrl(listing.id)}
                      variant="compact"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {user ? <ProfileEditGateFlow user={user} gate={gate} /> : null}

      {contentNoticeOpen ? <ShopEditContentNotice onContinue={onContentNoticeContinue} /> : null}

      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{storefrontEligible ? c.editStorefront : c.editShop}</DialogTitle>
          </DialogHeader>

          {gate.isUnlocked ? (
            <p className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1 shrink-0">
              {t.profile_edit_session_left.replace("{minutes}", String(gate.sessionMinutesLeft()))}
            </p>
          ) : null}

          {editOpen && gate.isUnlocked ? (
            <ShopEditForm
              variant="owner"
              layout={storefrontEligible ? "storefront" : "default"}
              productsSlot={
                storefrontEligible ? (
                  <ShopProductManager
                    changeToken={gate.changeToken}
                    storefrontEligible={storefrontEligible}
                    onProductsChange={onProductsChange}
                    embedded
                    simple
                  />
                ) : undefined
              }
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
              saving={saving}
              labels={{ save: c.saveStorefront, cancel: t.cancel }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
