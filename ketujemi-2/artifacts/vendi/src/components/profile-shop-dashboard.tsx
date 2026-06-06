import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Loader2, Store, Eye, Package, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useShopDashboardCopy } from "@/lib/shop-dashboard-i18n";
import { translateCategory } from "@/lib/category-translations";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import ListingCard from "@/components/listing-card";
import { ListingShareButtons, listingPublicUrl } from "@/components/listing-share-buttons";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

type ShopMe = {
  id: number;
  shop_name: string;
  logo_url: string;
  description: string;
  category: string;
  city: string;
  region: string;
  address: string;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  website?: string | null;
};

type ShopMeResponse = {
  shop: ShopMe | null;
  application: { status: string } | null;
  listing_count: number;
  total_views: number;
};

type ShopListing = Parameters<typeof ListingCard>[0]["listing"];

export function ProfileShopDashboard() {
  const c = useShopDashboardCopy();
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ShopMeResponse | null>(null);
  const [showListings, setShowListings] = useState(false);
  const [shopListings, setShopListings] = useState<ShopListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [shopName, setShopName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");

  function loadMe() {
    setLoading(true);
    void fetchWithTimeout("/api/shops/me", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("fail");
        return r.json() as Promise<ShopMeResponse>;
      })
      .then((res) => {
        setData(res);
        if (res.shop) {
          setShopName(res.shop.shop_name);
          setLogoUrl(res.shop.logo_url);
          setDescription(res.shop.description);
          setAddress(res.shop.address);
          setCity(res.shop.city);
          setRegion(res.shop.region);
          setFacebook(res.shop.facebook ?? "");
          setInstagram(res.shop.instagram ?? "");
          setTiktok(res.shop.tiktok ?? "");
          setWhatsapp(res.shop.whatsapp ?? "");
          setWebsite(res.shop.website ?? "");
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMe();
  }, []);

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

  function toggleListings() {
    const next = !showListings;
    setShowListings(next);
    if (next && shopListings.length === 0) loadShopListings();
  }

  async function onSaveShop(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.shop) return;
    setSaving(true);
    try {
      const res = await fetchWithTimeout(`/api/shops/${data.shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          shop_name: shopName,
          logo_url: logoUrl,
          description,
          address,
          city,
          region,
          facebook,
          instagram,
          tiktok,
          whatsapp,
          website,
        }),
      });
      if (!res.ok) throw new Error("fail");
      toast({ title: c.shopSaved });
      setEditing(false);
      loadMe();
    } catch {
      toast({ title: "Error", variant: "destructive" });
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

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white border border-gray-100 px-3 py-2">
            <div className="flex items-center gap-1 text-gray-500">
              <Package size={14} />
              {c.totalListings}
            </div>
            <p className="font-bold text-gray-900 mt-0.5">{data.listing_count}</p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-3 py-2">
            <div className="flex items-center gap-1 text-gray-500">
              <Eye size={14} />
              {c.totalViews}
            </div>
            <p className="font-bold text-gray-900 mt-0.5">{data.total_views.toLocaleString()}</p>
          </div>
        </div>

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
            onClick={() => setEditing((v) => !v)}
          >
            <Pencil size={16} className="mr-2" />
            {c.editShop}
          </Button>
          <Link href={`/dyqani/${shop.id}`}>
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

        {editing ? (
          <form className="space-y-3 pt-2 border-t border-blue-100" onSubmit={onSaveShop}>
            <div className="space-y-1">
              <Label htmlFor="shop-edit-name">{c.shopName}</Label>
              <Input id="shop-edit-name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="shop-edit-logo">{c.logo}</Label>
              <Input id="shop-edit-logo" type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="shop-edit-desc">{c.description}</Label>
              <Textarea id="shop-edit-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="shop-edit-address">{c.address}</Label>
              <Input id="shop-edit-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="shop-edit-city">{c.city}</Label>
                <Input id="shop-edit-city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="shop-edit-region">{c.region}</Label>
                <Input id="shop-edit-region" value={region} onChange={(e) => setRegion(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="shop-edit-fb">{c.facebook}</Label>
                <Input id="shop-edit-fb" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="shop-edit-ig">{c.instagram}</Label>
                <Input id="shop-edit-ig" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="shop-edit-tt">{c.tiktok}</Label>
                <Input id="shop-edit-tt" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="shop-edit-wa">{c.whatsapp}</Label>
                <Input id="shop-edit-wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="shop-edit-web">{c.website}</Label>
              <Input id="shop-edit-web" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <Button type="submit" className="w-full min-h-11" disabled={saving}>
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : c.saveShop}
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
