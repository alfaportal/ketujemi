import { useRoute, useLocation } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { useGetListing, useDeleteListing, getGetListingsQueryKey, getGetRecentListingsQueryKey, getGetFeaturedListingsQueryKey, getGetListingQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, MapPin, Phone, User, Eye, Star, Tag, Camera, Package, Clock, Pencil, Trash2, Crown,
  Fuel, Gauge, Calendar, Cog, Palette, Maximize2, Mail, Car, ChevronLeft, ChevronRight, MessageCircle, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
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
import { useMarket } from "@/lib/market-context";
import { dateFnsLocale } from "@/lib/app-extra-i18n";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { userOwnsListing } from "@/lib/listing-ownership";
import { sellerFirstName } from "@/lib/seller-display";
import { SiteHeaderToolbar } from "@/components/site-header-toolbar";
import { ReportListingDialog } from "@/components/report-listing-dialog";
import { SimilarListingsSection } from "@/components/similar-listings-section";
import { CardPaymentsPanel } from "@/components/card-payments-panel";
import { recordListingView } from "@/lib/record-listing-view";
import { parseListingImageUrls } from "@/lib/listing-images";

// ─── Spec parser ─────────────────────────────────────────────────────────────
interface ParsedDesc { specs: Record<string, string>; body: string }

function smsUriFromDigits(digits: string): string {
  if (!digits || digits.length < 8) return "sms:";
  if (digits.startsWith("383")) return `sms:+${digits}`;
  if (digits.startsWith("355")) return `sms:+${digits}`;
  if (digits.startsWith("389")) return `sms:+${digits}`;
  if (digits.startsWith("382")) return `sms:+${digits}`;
  if (digits.startsWith("0")) return `sms:+383${digits.slice(1)}`;
  return `sms:+${digits}`;
}

function parseDescription(description: string): ParsedDesc {
  const sep = "\n\n";
  const idx = description.indexOf(sep);
  if (idx > 0) {
    const firstLine = description.slice(0, idx);
    if (firstLine.includes(": ") && !firstLine.includes("\n")) {
      const specs: Record<string, string> = {};
      firstLine.split(" · ").forEach((pair) => {
        const colon = pair.indexOf(": ");
        if (colon > 0) {
          specs[pair.slice(0, colon).trim()] = pair.slice(colon + 2).trim();
        }
      });
      return { specs, body: description.slice(idx + sep.length) };
    }
  }
  return { specs: {}, body: description };
}

const SPEC_ICONS: Record<string, React.ElementType> = {
  "Marka":         Tag,
  "Modeli":        Tag,
  "Viti":          Calendar,
  "Kilometrazha":  Gauge,
  "Karburanti":    Fuel,
  "Transmisioni":  Cog,
  "Tipi":          Car,
  "Ngjyra":        Palette,
  "Motori":        Cog,
  "Fuqia":         Gauge,
  "Gjendja teknike": Tag,
  "Klima":         Tag,
  "Panorama":      Tag,
  "Sipërfaqja":    Maximize2,
  "Kati":          Tag,
  "Numri dhomave": Tag,
  "Mobilimi":      Tag,
  "Kapaciteti":    Tag,
};

function SpecGrid({ specs, detailsLabel }: { specs: Record<string, string>; detailsLabel: string }) {
  const entries = Object.entries(specs);
  if (!entries.length) return null;
  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
      <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">{detailsLabel}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {entries.map(([key, val]) => {
          const Icon = SPEC_ICONS[key] ?? Tag;
          return (
            <div key={key} className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={13} className="text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-400 font-medium">{key}</div>
                <div className="text-sm font-semibold text-gray-800">{val}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ListingDetail() {
  const [, params] = useRoute("/listings/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, market } = useMarket();
  const { user } = useAuth();

  const { data: listing, isLoading } = useGetListing(id, {
    query: {
      enabled: !!id,
      queryKey: [...getGetListingQueryKey(id), user?.id ?? "guest"],
    },
  });

  useEffect(() => {
    if (!id || isLoading || !listing) return;
    void recordListingView(id, queryClient);
  }, [id, isLoading, listing?.id, queryClient]);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("top") !== "success") return;
    const sessionId = params.get("session_id")?.trim();
    const finish = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("top");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.pathname + url.search);
    };
    if (sessionId?.startsWith("cs_")) {
      void import("@/lib/stripe-checkout")
        .then(({ confirmStripeCheckoutSession }) => confirmStripeCheckoutSession(sessionId))
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: getGetListingQueryKey(id) });
          toast({
            title: "TOP u aktivizua!",
            description: "Njoftimi juaj shfaqet në krye të listës.",
          });
        })
        .catch(() => {
          toast({
            title: "Pagesa TOP në proces",
            description: "Rifreskoni faqen pas pak sekondash.",
          });
        })
        .finally(finish);
      return;
    }
    finish();
    toast({ title: "Faleminderit! TOP do të shfaqet së shpejti." });
  }, [user, id, queryClient, toast]);

  const [activePhoto, setActivePhoto] = useState(0);
  const [complaintBusy, setComplaintBusy] = useState(false);
  const [repostBusy, setRepostBusy] = useState(false);
  const parsed = useMemo(() => {
    if (!listing) return { specs: {} as Record<string, string>, body: "" };
    return parseDescription(listing.description ?? "");
  }, [listing]);

  const canManage = !!(user && listing && userOwnsListing(user, listing));
  const canRepost = !!(listing && (listing as { can_repost?: boolean }).can_repost);
  const isExpired = !!(listing && (listing as { is_expired?: boolean }).is_expired);

  async function repostListing() {
    if (!listing) return;
    setRepostBusy(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}/repost`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { message?: string }).message ?? "Gabim",
          variant: "destructive",
        });
        return;
      }
      toast({ title: (data as { message?: string }).message ?? "Njoftimi u rifillua!" });
      queryClient.invalidateQueries({ queryKey: getGetListingQueryKey(listing.id) });
      void queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
    } finally {
      setRepostBusy(false);
    }
  }

  async function submitNoResponseComplaint() {
    if (!listing) return;
    setComplaintBusy(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}/complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contact: user?.email ?? user?.phone_e164_digits ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { message?: string }).message ?? (data as { error?: string }).error ?? "Gabim",
          variant: "destructive",
        });
        return;
      }
      toast({ title: (data as { message?: string }).message ?? "Ankesa u regjistrua." });
    } finally {
      setComplaintBusy(false);
    }
  }

  const deleteMutation = useDeleteListing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetFeaturedListingsQueryKey() });
        toast({ title: t.deleteSuccess });
        setLocation("/listings");
      },
      onError: (err: unknown) => {
        const msg =
          err &&
          typeof err === "object" &&
          "data" in err &&
          err.data &&
          typeof err.data === "object" &&
          "message" in err.data &&
          typeof (err.data as { message?: string }).message === "string"
            ? (err.data as { message: string }).message
            : t.deleteError;
        toast({ title: msg, variant: "destructive" });
      },
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold mb-2">{t.listingNotFound}</p>
        <p className="text-muted-foreground mb-6">{t.listingNotFoundSub}</p>
        <Button onClick={() => setLocation("/listings")}>{t.backToListings}</Button>
      </div>
    );
  }

  const { specs, body } = parsed;
  const allImages = parseListingImageUrls(listing.image_url);
  const isVipSeller = !!(listing as { is_vip_seller?: boolean }).is_vip_seller;
  const postedAt = listing.listed_at ?? listing.created_at;
  const postedLabel = new Date(postedAt).toLocaleString("sq-AL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const expiresLabel = listing.expires_at
    ? new Date(listing.expires_at).toLocaleDateString("sq-AL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  const sellerDigits = user ? (listing.seller_phone ?? "").replace(/\D/g, "") : "";
  const smsHref = user ? smsUriFromDigits(sellerDigits) : "sms:";
  const listingReturnPath = `/listings/${listing.id}`;
  const sellerDisplayName = user ? listing.seller_name : sellerFirstName(listing.seller_name);
  const showSellerPhone = !!user && sellerDigits.length >= 8;

  const conditionMap: Record<string, { label: string; cls: string }> = {
    New:     { label: t.conditionNew,     cls: "bg-green-100 text-green-700 border-green-200" },
    Good:    { label: t.conditionGood,    cls: "bg-blue-100 text-blue-700 border-blue-200" },
    Used:    { label: t.conditionUsed,    cls: "bg-amber-100 text-amber-700 border-amber-200" },
    Damaged: { label: t.conditionDamaged, cls: "bg-red-100 text-red-700 border-red-200" },
  };
  const cond = conditionMap[listing.condition] ?? conditionMap.Used;

  const isAgreement = listing.price === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            data-testid="button-back"
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-sm font-medium rounded-lg min-h-12 px-1 -mx-1 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </button>
          <div className="flex gap-2 items-center flex-shrink-0">
            <SiteHeaderToolbar />
            {canRepost ? (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 min-h-12 px-3 text-sm shrink-0 border-blue-300 text-blue-700"
                disabled={repostBusy}
                onClick={() => void repostListing()}
              >
                {repostBusy ? "…" : "🔄 Rifillo njoftimin"}
              </Button>
            ) : null}
            {canManage ? (
              <>
                {!isExpired ? (
                  <Button variant="outline" onClick={() => setLocation(`/listings/${listing.id}/edit`)}
                    className="gap-1.5 min-h-12 px-3 text-sm shrink-0" data-testid="button-edit-listing">
                    <Pencil className="h-3 w-3" /> {t.edit}
                  </Button>
                ) : null}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline"
                      className="gap-1.5 min-h-12 px-3 text-sm text-red-600 border-red-200 hover:bg-red-50 shrink-0"
                      data-testid="button-delete-listing">
                      <Trash2 className="h-3 w-3" /> {t.delete}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.deleteDesc}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteMutation.mutate({ id: listing.id })}
                        data-testid="button-confirm-delete"
                      >{t.delete}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isExpired && canManage ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Ky njoftim ka skaduar. Klikoni <strong>Rifillo njoftimin</strong> për ta shfaqur përsëri në listë.
          </div>
        ) : null}
        {canManage && listing ? (
          <div className="mb-4">
            <CardPaymentsPanel listingId={listing.id} />
          </div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Left: main content ── */}
          <div className="md:col-span-2 space-y-4">

            {/* Photo gallery */}
            <div
              className={`rounded-2xl overflow-hidden bg-gray-900 ${
                isVipSeller ? "ring-2 ring-[#1A56A0] ring-offset-2 ring-offset-gray-50" : ""
              }`}
            >
              {allImages.length > 0 ? (
                <div>
                  <div className="relative aspect-video">
                    {isVipSeller ? (
                      <div className="absolute top-3 left-3 z-10 bg-[#1A56A0] text-white text-xs sm:text-sm font-black px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                        <Crown size={14} className="text-white" aria-hidden />
                        VIP PARTNER
                      </div>
                    ) : null}
                    <img
                      src={allImages[activePhoto]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      data-testid="img-listing"
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setActivePhoto((p) => (p - 1 + allImages.length) % allImages.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={() => setActivePhoto((p) => (p + 1) % allImages.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-sm font-medium px-2 py-1 rounded-full">
                          {activePhoto + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex gap-1.5 p-2 bg-gray-900 overflow-x-auto">
                      {allImages.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setActivePhoto(i)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            i === activePhoto ? "border-blue-400 opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                          }`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-200 text-gray-500 text-sm flex-col gap-2">
                  <Camera size={40} className="text-gray-400 stroke-[1.5]" aria-hidden />
                  <span>{t.noPhoto}</span>
                </div>
              )}
            </div>

            {/* Title & price */}
            <div
              className={`bg-white rounded-2xl border p-5 ${
                isVipSeller ? "border-[#1A56A0]/30 shadow-sm shadow-blue-100/40" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug" data-testid="text-listing-title">
                  {listing.title}
                </h1>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {isVipSeller ? (
                    <Badge className="bg-[#1A56A0] text-white border-0 gap-1 font-black hover:bg-[#1A56A0]">
                      <Crown className="h-3 w-3 text-white" /> VIP PARTNER
                    </Badge>
                  ) : null}
                  {listing.is_featured ? (
                    <Badge className="bg-amber-500 text-white gap-1">
                      <Star className="h-3 w-3 fill-white" /> {t.promoted}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="text-3xl font-black text-blue-600 mb-4" data-testid="text-listing-price">
                {isAgreement ? (
                  <span className="text-2xl text-gray-700">{t.agreement}</span>
                ) : (
                  <>{listing.price.toLocaleString()} <span className="text-xl">EUR</span></>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                  <MapPin size={11} />
                  <span data-testid="text-listing-location">{listing.location}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                  <Tag size={11} />
                  {listing.category_name}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border font-medium ${cond.cls}`}>
                  <Package size={11} />
                  {cond.label}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                  <Eye size={11} />
                  {listing.views} {t.views}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                  <Clock size={11} />
                  Postuar: {postedLabel}
                </span>
                {expiresLabel ? (
                  <span className="inline-flex items-center gap-1.5 text-sm bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1.5 rounded-full font-medium">
                    <Clock size={11} />
                    Skadon: {expiresLabel}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                Çdo njoftim qëndron online deri <strong>3 muaj</strong> nga data e postimit, pastaj hiqet automatikisht
                (nëse nuk e fshini vetë). Kjo është e ndarë nga limiti «10 për kategori kryesore» / postime mujore.
              </p>
            </div>

            {/* Structured specs */}
            {Object.keys(specs).length > 0 && <SpecGrid specs={specs} detailsLabel={t.details} />}

            {/* Description */}
            {body && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-3">{t.description}</h2>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed" data-testid="text-listing-description">
                  {body}
                </p>
              </div>
            )}
          </div>

          {/* ── Right: seller sidebar ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">{t.seller}</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900" data-testid="text-seller-name">{sellerDisplayName}</div>
                    <div className="text-sm text-gray-400">{t.privateSeller}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{listing.location}</span>
                </div>

                {specs["Adresa"] && (
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                    <span>{specs["Adresa"]}</span>
                  </div>
                )}

                {!user ? (
                  <>
                    {specs["Email"] ? (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Mail className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                          <span
                            className="truncate text-center text-sm font-semibold text-gray-800 blur-[2.5px] select-none"
                            data-testid="text-masked-email"
                            aria-hidden
                          >
                            {specs["Email"]}
                          </span>
                        </div>
                      </div>
                    ) : null}
                    <Button
                      type="button"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 font-bold text-sm"
                      onClick={() => setLocation(loginUrlWithReturn(listingReturnPath))}
                      data-testid="button-login-to-view-phone"
                    >
                      {t.loginToViewPhone}
                    </Button>
                  </>
                ) : showSellerPhone ? (
                  <>
                    <a
                      href={`tel:${listing.seller_phone}`}
                      data-testid="link-seller-phone"
                      className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 font-bold text-sm transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {t.callSeller}
                    </a>
                    <a
                      href={smsHref}
                      className="flex items-center justify-center gap-2 w-full bg-slate-600 hover:bg-slate-700 text-white rounded-xl px-4 py-3 font-bold text-sm transition-colors"
                      data-testid="link-seller-sms"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t.sendSms}
                    </a>
                    <a
                      href={`https://wa.me/${sellerDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-3 font-bold text-sm transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t.whatsapp}
                    </a>
                    <div className="text-center text-sm text-gray-500 font-mono">{listing.seller_phone}</div>
                  </>
                ) : null}

                {user && specs["Email"] ? (
                  <a
                    href={`mailto:${specs["Email"]}`}
                    className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl px-4 py-2.5 text-sm transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    {specs["Email"]}
                  </a>
                ) : null}
              </div>
            </div>

            {!canManage ? (
              <div className="space-y-2">
                <ReportListingDialog listingId={listing.id} className="w-full min-h-12" />
                {user ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full min-h-11 text-gray-600"
                    disabled={complaintBusy}
                    onClick={() => void submitNoResponseComplaint()}
                  >
                    {complaintBusy ? "Duke dërguar…" : "Shitësi nuk përgjigjet"}
                  </Button>
                ) : null}
              </div>
            ) : null}

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm space-y-2">
              <p className="font-semibold text-amber-800">{t.caution}</p>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>• {t.cautionTip1}</li>
                <li>• {t.cautionTip2}</li>
                <li>• {t.cautionTip3}</li>
                <li>• {t.cautionTip4}</li>
              </ul>
            </div>
          </div>

        </div>

        {listing ? <SimilarListingsSection listingId={listing.id} /> : null}
      </div>
    </div>
  );
}
