import { useRoute, useLocation } from "wouter";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useState, useMemo, useEffect, useRef } from "react";
import { useGetListing, useDeleteListing, getGetListingsQueryKey, getGetRecentListingsQueryKey, getGetFeaturedListingsQueryKey, getGetListingQueryKey, ApiError } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, MapPin, Phone, User, Eye, Star, Tag, Camera, Package, Clock, Pencil, Trash2, Crown,
  Fuel, Gauge, Calendar, Cog, Palette, Maximize2, Mail, Car, ChevronLeft, ChevronRight, MessageCircle, MessageSquare, X,
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
import { dateFnsLocale, fillPlaceholders } from "@/lib/app-extra-i18n";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { userOwnsListing } from "@/lib/listing-ownership";
import { sellerFirstName } from "@/lib/seller-display";
import { MobileSafeTopSpacer } from "@/components/mobile-safe-top-spacer";
import { SiteHeaderToolbar } from "@/components/site-header-toolbar";
import { ReportListingDialog } from "@/components/report-listing-dialog";
import { SimilarListingsSection } from "@/components/similar-listings-section";
import { ListingDetailTopPackages } from "@/components/listing-detail-top-packages";
import { ListingSectionErrorBoundary } from "@/components/listing-section-error-boundary";
import { isPlatformOperatorEmail } from "@/lib/platform-operator";
import { parseListingImageUrls } from "@/lib/listing-images";
import { recordListingView } from "@/lib/record-listing-view";
import { listingPublicUrl } from "@/lib/social-share";
import { ListingProminentShare } from "@/components/listing-prominent-share";
import { ListingSocialPostedShare } from "@/components/listing-social-posted-share";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ListingShopCard, type ListingShopInfo } from "@/components/listing-shop-card";
import { CANONICAL_SITE_ORIGIN } from "@/lib/category-seo";
import { applyPageMeta, truncateMetaDescription } from "@/lib/page-meta";
import { injectJsonLd, listingProductJsonLd } from "@/lib/schema-org";
import { notifyTopListingsRefresh } from "@/lib/top-listings-events";
import { useListingFlowStable } from "@/hooks/use-listing-flow-stable";

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

function listingEditLabel(uiLang: string): string {
  switch (uiLang) {
    case "mk":
      return "Уреди";
    case "mne":
      return "Uredi";
    case "en":
      return "Edit";
    default:
      return "Ndrysho";
  }
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
  useListingFlowStable();
  const [, params] = useRoute("/listings/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const invalidId = !Number.isFinite(id) || id <= 0;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, market, uiLang } = useMarket();
  const tx = t as Record<string, string>;
  const { user } = useAuth();

  const { data: listing, isLoading, isError, error, refetch } = useGetListing(id, {
    query: {
      enabled: !!id && !invalidId,
      queryKey: getGetListingQueryKey(id),
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      staleTime: 120_000,
      placeholderData: (previous) => previous,
    },
  });

  useEffect(() => {
    if (!id || isLoading || !listing) return;
    void recordListingView(id, queryClient);
  }, [id, isLoading, listing?.id, queryClient]);

  const authUserId = user?.id;
  const prevAuthUserId = useRef<number | undefined | null>(null);
  useEffect(() => {
    if (!id) return;
    if (prevAuthUserId.current === null) {
      prevAuthUserId.current = authUserId;
      return;
    }
    const prev = prevAuthUserId.current;
    if (prev === authUserId) return;
    prevAuthUserId.current = authUserId;
    void queryClient.invalidateQueries({ queryKey: getGetListingQueryKey(id) });
  }, [authUserId, id, queryClient]);

  useEffect(() => {
    if (!listing) return;
    setListingShareUrl(listingPublicUrl(listing.id));
  }, [listing?.id]);

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
        .then(({ confirmStripeCheckoutSession }) => confirmStripeCheckoutSession(sessionId, uiLang))
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: getGetListingQueryKey(id) });
          notifyTopListingsRefresh(id);
          toast({
            title: tx.ui_topActivatedTitle,
            description: tx.ui_topActivatedDesc,
          });
        })
        .catch(() => {
          toast({
            title: tx.ui_topPaymentPendingTitle,
            description: tx.ui_topPaymentPendingDesc,
          });
        })
        .finally(finish);
      return;
    }
    finish();
    notifyTopListingsRefresh(id);
    toast({ title: tx.ui_topThanksSoon });
  }, [user, id, queryClient, toast, uiLang, tx.ui_topActivatedTitle, tx.ui_topActivatedDesc, tx.ui_topPaymentPendingTitle, tx.ui_topPaymentPendingDesc, tx.ui_topThanksSoon]);

  const [listingShareUrl, setListingShareUrl] = useState("");
  const [postShareOpen, setPostShareOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [complaintBusy, setComplaintBusy] = useState(false);
  const [repostBusy, setRepostBusy] = useState(false);
  const parsed = useMemo(() => {
    if (!listing) return { specs: {} as Record<string, string>, body: "" };
    return parseDescription(listing.description ?? "");
  }, [listing]);

  useEffect(() => {
    if (!listing) return;
    const path = `/listings/${listing.id}`;
    const listingUrl = `${CANONICAL_SITE_ORIGIN}${path}`;
    const images = parseListingImageUrls(listing.image_url);
    const firstImage = images[0];
    const description = truncateMetaDescription(parsed.body || listing.title, 155);
    const locationBit = listing.location?.trim() ? ` — ${listing.location.trim()}` : "";
    const title = `${listing.title}${locationBit} | KetuJemi`;
    const priceBit =
      listing.price === 0 ? t.agreement : `${listing.price.toLocaleString()} EUR`;
    const locationName = listing.location?.trim() ?? "";
    const ogDescription = locationName ? `${priceBit} — ${locationName}` : priceBit;
    applyPageMeta({
      title,
      description,
      ogTitle: listing.title,
      ogDescription,
      ogImage: firstImage,
      canonicalPath: listingUrl,
      ogType: "product",
      fbAppId: "2196983604470561",
    });
    return injectJsonLd(
      `listing-${listing.id}`,
      listingProductJsonLd({
        id: listing.id,
        title: listing.title,
        description: parsed.body || listing.description || listing.title,
        imageUrl: firstImage,
        price: listing.price,
        location: listing.location,
        urlPath: path,
        sellerName: listing.seller_name,
      }),
    );
  }, [listing, parsed.body, t.agreement]);

  const canManage = !!(
    user &&
    listing &&
    ((listing as { is_owner?: boolean }).is_owner ?? userOwnsListing(user, listing))
  );
  const canRepost = !!(listing && (listing as { can_repost?: boolean }).can_repost);
  const isExpired = !!(listing && (listing as { is_expired?: boolean }).is_expired);
  const fbPosted = !!(listing && (listing as { fb_posted?: boolean }).fb_posted);
  const igPosted = !!(listing && (listing as { ig_posted?: boolean }).ig_posted);
  const justPosted =
    typeof window !== "undefined"
    && new URLSearchParams(window.location.search).get("posted") === "1";

  useEffect(() => {
    if (!canManage || !justPosted || !id) return;
    if (fbPosted && igPosted) return;

    const interval = window.setInterval(() => {
      void queryClient.refetchQueries({ queryKey: getGetListingQueryKey(id), type: "active" });
    }, 4000);
    const stop = window.setTimeout(() => window.clearInterval(interval), 3 * 60 * 1000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stop);
    };
  }, [canManage, justPosted, id, fbPosted, igPosted, queryClient]);

  useEffect(() => {
    if (!justPosted || !canManage) return;
    if (!fbPosted && !igPosted) return;
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("posted")) return;
    url.searchParams.delete("posted");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [justPosted, canManage, fbPosted, igPosted]);

  useEffect(() => {
    if (justPosted && canManage && listingShareUrl) {
      setPostShareOpen(true);
    }
  }, [justPosted, canManage, listingShareUrl]);
  const listingImageCount = listing ? parseListingImageUrls(listing.image_url).length : 0;

  useEffect(() => {
    if (!lightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (listingImageCount < 2) return;
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => (i - 1 + listingImageCount) % listingImageCount);
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) => (i + 1) % listingImageCount);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, listingImageCount]);

  async function repostListing() {
    if (!listing) return;
    setRepostBusy(true);
    try {
      const res = await fetchWithTimeout(`/api/listings/${listing.id}/repost`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { message?: string }).message ?? tx.ui_genericError,
          variant: "destructive",
        });
        return;
      }
      toast({ title: (data as { message?: string }).message ?? tx.ui_repostSuccess });
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
      const res = await fetchWithTimeout(`/api/listings/${listing.id}/complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contact: user?.email ?? user?.phone_e164_digits ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { message?: string }).message ?? (data as { error?: string }).error ?? tx.ui_genericError,
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

  if (invalidId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold mb-2">{t.listingNotFound}</p>
        <p className="text-muted-foreground mb-6">{t.listingNotFoundSub}</p>
        <Button onClick={() => setLocation("/listings")}>{t.backToListings}</Button>
      </div>
    );
  }

  if (isLoading && !listing) {
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

  if (isError && !listing) {
    const status = error instanceof ApiError ? error.status : 0;
    if (status >= 500 || status === 0) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-xl font-semibold mb-2">{t.listingLoadError}</p>
          <p className="text-muted-foreground mb-6">{t.listingLoadErrorSub}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => void refetch()}>{t.listingRetry}</Button>
            <Button variant="outline" onClick={() => setLocation("/listings")}>{t.backToListings}</Button>
          </div>
        </div>
      );
    }
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
  const listingVideoUrl = (listing.video_url ?? "").trim();
  const isVipSeller = !!(listing as { is_vip_seller?: boolean }).is_vip_seller;
  const listingMeta = listing as typeof listing & {
    listed_at?: string;
    expires_at?: string | null;
  };
  const intlLocale =
    uiLang === "mk"
      ? "mk-MK"
      : uiLang === "mne"
        ? "sr-ME"
        : uiLang === "en"
          ? "en-GB"
          : uiLang === "fr"
            ? "fr-FR"
            : uiLang === "de"
              ? "de-DE"
              : uiLang === "it"
                ? "it-IT"
                : "sq-AL";
  const postedAt = listingMeta.listed_at ?? listing.created_at;
  const postedLabel = new Date(postedAt).toLocaleString(intlLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const expiresLabel = listingMeta.expires_at
    ? new Date(listingMeta.expires_at).toLocaleDateString(intlLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;
  const lifetimeNote = fillPlaceholders(tx.ui_listingLifetimeNote, {
    months: tx.ui_listingLifetimeMonths,
  });

  const sellerDigits = user ? (listing.seller_phone ?? "").replace(/\D/g, "") : "";
  const smsHref = user ? smsUriFromDigits(sellerDigits) : "sms:";
  const listingReturnPath = `/listings/${listing.id}`;
  const sellerDisplayName = user ? listing.seller_name : sellerFirstName(listing.seller_name);
  const showSellerPhone = !!user && sellerDigits.length >= 8;
  const specsEmail = specs["Email"]?.trim() ?? "";
  const hideOperatorEmail = isPlatformOperatorEmail(specsEmail);

  const conditionMap: Record<string, { label: string; cls: string }> = {
    New:     { label: t.conditionNew,     cls: "bg-green-100 text-green-700 border-green-200" },
    Good:    { label: t.conditionGood,    cls: "bg-blue-100 text-blue-700 border-blue-200" },
    Used:    { label: t.conditionUsed,    cls: "bg-amber-100 text-amber-700 border-amber-200" },
    Damaged: { label: t.conditionDamaged, cls: "bg-red-100 text-red-700 border-red-200" },
  };
  const cond = conditionMap[listing.condition] ?? conditionMap.Used;

  const isAgreement = listing.price === 0;
  const editLabel = listingEditLabel(uiLang);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const goLightboxPrev = () => {
    if (allImages.length < 2) return;
    setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length);
  };

  const goLightboxNext = () => {
    if (allImages.length < 2) return;
    setLightboxIndex((i) => (i + 1) % allImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <MobileSafeTopSpacer />
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
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
                {repostBusy ? "…" : tx.ui_repostListingBtn}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isExpired && canManage ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {tx.ui_listingExpiredBannerBefore}{" "}
            <strong>{tx.ui_repostListingLink}</strong> {tx.ui_listingExpiredBannerAfter}
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
                <div className="p-2 sm:p-3">
                  {isVipSeller ? (
                    <div className="mb-2 inline-flex bg-[#1A56A0] text-white text-xs sm:text-sm font-black px-2.5 py-1.5 rounded-lg shadow-lg items-center gap-1.5">
                      <Crown size={14} className="text-white" aria-hidden />
                      VIP PARTNER
                    </div>
                  ) : null}
                  <div
                    className={`grid gap-2 ${
                      allImages.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
                    }`}
                  >
                    {allImages.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openLightbox(i)}
                        className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 touch-manipulation"
                        aria-label={`${listing.title} — ${i + 1} / ${allImages.length}`}
                        data-testid={i === 0 ? "img-listing" : undefined}
                      >
                        <img
                          src={url}
                          alt={`${listing.title} ${i + 1}`}
                          className="absolute inset-0 w-full h-full object-cover object-center"
                          loading={i < 3 ? "eager" : "lazy"}
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] flex items-center justify-center bg-gray-200 text-gray-500 text-sm flex-col gap-2">
                  <Camera size={40} className="text-gray-400 stroke-[1.5]" aria-hidden />
                  <span>{t.noPhoto}</span>
                </div>
              )}
            </div>

            {canManage ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {!isExpired ? (
                  <Button
                    type="button"
                    className="flex-1 min-h-12 h-12 text-base font-bold gap-2"
                    onClick={() => setLocation(`/listings/${listing.id}/edit`)}
                    data-testid="button-edit-listing"
                  >
                    <Pencil className="h-4 w-4" />
                    {editLabel}
                  </Button>
                ) : null}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1 min-h-12 h-12 text-base font-bold gap-2 bg-red-600 hover:bg-red-700"
                      data-testid="button-delete-listing"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t.delete}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteMutation.mutate({ id: listing.id })}
                        data-testid="button-confirm-delete"
                      >
                        {t.delete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : null}

            {listingVideoUrl ? (
              <div className="rounded-2xl overflow-hidden bg-black border border-gray-200">
                <video
                  src={listingVideoUrl}
                  controls
                  playsInline
                  className="w-full aspect-video object-contain"
                  data-testid="listing-video"
                />
              </div>
            ) : null}

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
                  {tx.ui_postedAtLabel} {postedLabel}
                </span>
                {expiresLabel ? (
                  <span className="inline-flex items-center gap-1.5 text-sm bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1.5 rounded-full font-medium">
                    <Clock size={11} />
                    {tx.ui_expiresAtLabel} {expiresLabel}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                {lifetimeNote}
              </p>
            </div>

            {canManage ? (
              <ListingProminentShare
                url={listingShareUrl}
                title={listing.title}
              />
            ) : null}

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

            {canManage && (fbPosted || igPosted) ? (
              <ListingSocialPostedShare
                url={listingShareUrl}
                fbPosted={fbPosted}
                igPosted={igPosted}
                title={listing.title}
              />
            ) : null}

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
                    <div className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap" data-testid="text-seller-name">
                      <span>{sellerDisplayName}</span>
                      {listing.seller_is_online ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                          <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" aria-hidden />
                          {t.sellerOnline}
                        </span>
                      ) : null}
                    </div>
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
                    {specsEmail && !hideOperatorEmail ? (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Mail className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                          <span
                            className="truncate text-center text-sm font-semibold text-gray-800 blur-[2.5px] select-none"
                            data-testid="text-masked-email"
                            aria-hidden
                          >
                            {specsEmail}
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

                {user && specsEmail && !hideOperatorEmail ? (
                  <a
                    href={`mailto:${specsEmail}`}
                    className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl px-4 py-2.5 text-sm transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    {specsEmail}
                  </a>
                ) : null}
              </div>
            </div>

            {(listing as unknown as ListingShopInfo).shop_verified &&
            (listing as unknown as ListingShopInfo).shop_id ? (
              <ListingShopCard shop={listing as unknown as ListingShopInfo} />
            ) : null}

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
                    {complaintBusy ? tx.ui_sellerNoResponseBusy : tx.ui_sellerNoResponse}
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

        {canManage && listing ? (
          <div className="mt-8">
            <ListingSectionErrorBoundary label="top-packages">
              <ListingDetailTopPackages listingId={listing.id} />
            </ListingSectionErrorBoundary>
          </div>
        ) : null}

        {listing ? (
          <ListingSectionErrorBoundary label="similar-listings">
            <SimilarListingsSection listingId={listing.id} />
          </ListingSectionErrorBoundary>
        ) : null}
      </div>

      {lightboxOpen && allImages.length > 0 ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 touch-none select-none"
          role="dialog"
          aria-modal="true"
          aria-label={listing.title}
          onClick={() => setLightboxOpen(false)}
          style={{ touchAction: "none" }}
        >
          <button
            type="button"
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            aria-label={t.cancel}
          >
            <X size={22} />
          </button>

          {allImages.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-3 sm:left-6 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  goLightboxPrev();
                }}
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                className="absolute right-3 sm:right-6 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  goLightboxNext();
                }}
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white">
                {lightboxIndex + 1} / {allImages.length}
              </div>
            </>
          ) : null}

          <img
            src={allImages[lightboxIndex]}
            alt={`${listing.title} ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[92vw] object-contain"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: "none", userSelect: "none" }}
          />
        </div>
      ) : null}

      <Dialog open={postShareOpen} onOpenChange={setPostShareOpen}>
        <DialogContent className="sm:max-w-lg p-0 border-0 bg-transparent shadow-none">
          <ListingProminentShare
            url={listingShareUrl}
            title={listing?.title ?? ""}
            postSuccess
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
