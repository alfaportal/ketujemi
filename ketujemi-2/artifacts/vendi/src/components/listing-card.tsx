import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MapPin, Eye, Clock, AlertCircle, Crown, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarket, convertPrice, type Market } from "@/lib/market-context";
import { translationKeyForUiLang, type UiLang } from "@/lib/ui-languages";
import { translateCategory } from "@/lib/category-translations";
import { categoryPath } from "@/lib/category-navigation";
import { ListingCardImage } from "@/components/listing-card-image";
import { isDhurataFalasSlug } from "@/lib/special-listing-categories";
import { maskSellerPhone } from "@/lib/mask-seller-phone";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useShopDashboardCopy } from "@/lib/shop-dashboard-i18n";
import { fillPlaceholders } from "@/lib/fill-placeholders";
import { listingCardExpiryStrings } from "@/lib/listing-card-expiry-i18n";
import { prefetchRoute } from "@/lib/route-prefetch";
import { ListingSectionErrorBoundary } from "@/components/listing-section-error-boundary";

// ─── Formatted timestamp ──────────────────────────────────────────────────────
function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} · ${hours}:${mins}`;
}

function formatListingPrice(
  price: number | null | undefined,
  market: Market,
  rates: Record<string, number>,
  agreementLabel: string,
): string {
  if (price == null || !Number.isFinite(price) || price <= 0) {
    return agreementLabel;
  }
  try {
    return convertPrice(price, market, rates);
  } catch {
    return agreementLabel;
  }
}

// ─── Expiry countdown ─────────────────────────────────────────────────────────
function getDaysLeft(
  expiresAt: string | null | undefined,
  uiLang: UiLang,
  tx: Record<string, string>,
): { text: string; urgent: boolean } | null {
  if (!expiresAt) return null;
  const expiryDate = new Date(expiresAt);
  if (Number.isNaN(expiryDate.getTime())) return null;
  const days = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return null;
  const urgent = days <= 3;
  const copy = listingCardExpiryStrings(uiLang, tx);
  const text =
    days === 1 ? copy.tomorrow : fillPlaceholders(copy.inDays, { days });
  return { text, urgent };
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface ListingCardListing {
  id: number;
  title: string;
  price?: number | null;
  location?: string | null;
  image_url?: string | null;
  primary_image_url?: string | null;
  is_featured?: boolean;
  is_top?: boolean;
  is_vip_seller?: boolean;
  views?: number;
  created_at: string;
  expires_at?: string | null;
  category_name?: string | null;
  category_id?: number;
  category_root_slug?: string | null;
  seller_phone?: string | null;
  seller_phone_masked?: string | null;
  shop_id?: number | null;
  shop_logo_url?: string | null;
  shop_verified?: boolean;
}

interface ListingCardProps {
  listing: ListingCardListing;
}

function normalizeListingCard(raw: ListingCardListing): ListingCardListing | null {
  const id = Number(raw?.id);
  if (!Number.isFinite(id) || id < 1) return null;
  const title =
    typeof raw.title === "string" ? raw.title : String(raw.title ?? "").trim();
  const priceRaw = raw.price;
  const price =
    priceRaw != null && Number.isFinite(Number(priceRaw)) && Number(priceRaw) > 0
      ? Number(priceRaw)
      : null;
  const viewsRaw = Number(raw.views ?? 0);
  return {
    ...raw,
    id,
    title,
    price,
    location: raw.location?.trim() ? raw.location.trim() : null,
    category_name: raw.category_name?.trim() ? raw.category_name.trim() : null,
    category_root_slug: raw.category_root_slug ?? null,
    created_at: raw.created_at ?? "",
    expires_at: raw.expires_at ?? null,
    views: Number.isFinite(viewsRaw) ? viewsRaw : 0,
    seller_phone: raw.seller_phone?.trim() ? raw.seller_phone.trim() : null,
    seller_phone_masked: raw.seller_phone_masked?.trim()
      ? raw.seller_phone_masked.trim()
      : null,
  };
}

function DhurataGiftListingCard({ listing }: ListingCardProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const masked =
    listing.seller_phone_masked || maskSellerPhone(listing.seller_phone);
  const fullPhone = listing.seller_phone ?? "";

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate(loginUrlWithReturn(`/listings/${listing.id}`));
      return;
    }
    if (fullPhone) setPhoneRevealed(true);
  };

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-green-100 hover:shadow-lg hover:border-green-200 transition-all duration-200"
      data-testid={`card-listing-${listing.id}`}
    >
      <Link
        href={`/listings/${listing.id}`}
        className="block"
        onMouseEnter={() => prefetchRoute(`/listings/${listing.id}`)}
        onFocus={() => prefetchRoute(`/listings/${listing.id}`)}
      >
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-200">
          <ListingCardImage
            imageUrl={listing.image_url}
            primaryImageUrl={listing.primary_image_url}
            alt={listing.title}
            className="group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 bg-green-600 text-white text-sm font-bold px-2.5 py-1 rounded-lg shadow-sm">
            🎁 FALAS
          </div>
        </div>
      </Link>

      <div className="p-3">
        <Link
          href={`/listings/${listing.id}`}
          onMouseEnter={() => prefetchRoute(`/listings/${listing.id}`)}
          onFocus={() => prefetchRoute(`/listings/${listing.id}`)}
        >
          <h3
            data-testid={`text-title-${listing.id}`}
            className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-green-700 transition-colors"
          >
            {listing.title}
          </h3>
        </Link>

        {listing.location ? (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1.5">
            <MapPin size={11} className="shrink-0" />
            <span>{listing.location}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-1 text-sm text-gray-400 mb-3">
          <Clock size={11} />
          <span>{formatDate(listing.created_at)}</span>
        </div>

        {phoneRevealed && fullPhone ? (
          <a
            href={`tel:${fullPhone}`}
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-3 font-bold text-sm transition-colors mb-1"
            data-testid={`link-seller-phone-${listing.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Phone size={16} />
            {fullPhone}
          </a>
        ) : (
          <button
            type="button"
            onClick={handleContact}
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-3 font-bold text-sm transition-colors"
            data-testid={`button-kontakto-${listing.id}`}
          >
            <Phone size={16} />
            📞 Kontakto
            <span className="text-green-100 font-normal text-xs ml-1">({masked})</span>
          </button>
        )}
      </div>
    </div>
  );
}

function ListingCardInner({ listing }: ListingCardProps) {
  const { market, rates, t, uiLang } = useMarket();
  const tx = t as Record<string, string>;
  const shopCopy = useShopDashboardCopy();
  const [, navigate] = useLocation();
  const isDhurata = isDhurataFalasSlug(listing.category_root_slug);
  const agreementLabel = t.agreement ?? "Me marrëveshje";
  const promotedLabel = t.promoted ?? "Promovuar";
  const todayLabel = t.today ?? "Sot";
  const viewsLabel = t.views ?? "";

  if (isDhurata) {
    return <DhurataGiftListingCard listing={listing} />;
  }

  const isToday = listing.created_at
    ? new Date(listing.created_at).toDateString() === new Date().toDateString()
    : false;
  const daysLeft = getDaysLeft(listing.expires_at, uiLang, tx);
  const catName = translateCategory(
    listing.category_name ?? "",
    translationKeyForUiLang(uiLang),
  );
  const isVipSeller = !!listing.is_vip_seller;
  const isShopVerified = !!listing.shop_verified && !!listing.shop_id;

  return (
    <Link
      href={`/listings/${listing.id}`}
      data-testid={`card-listing-${listing.id}`}
      onMouseEnter={() => prefetchRoute(`/listings/${listing.id}`)}
      onFocus={() => prefetchRoute(`/listings/${listing.id}`)}
      className={cn(
        "group bg-white rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-200 block",
        isVipSeller
          ? "border-[#1A56A0]/40 ring-2 ring-[#1A56A0]/50 hover:border-[#1A56A0] hover:ring-[#1A56A0]/70"
          : "border-gray-100 hover:border-blue-200",
      )}
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-gray-200">
        <ListingCardImage
          imageUrl={listing.image_url}
          primaryImageUrl={listing.primary_image_url}
          alt={listing.title}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {listing.is_top ? (
          <div className="absolute top-2 left-2 bg-[#1A56A0] text-white text-sm font-bold px-2.5 py-1 rounded-lg shadow-sm">
            TOP
          </div>
        ) : listing.is_featured ? (
          <div className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-sm font-bold px-2.5 py-1 rounded-lg shadow-sm">
            ⭐ {promotedLabel}
          </div>
        ) : null}
        {isVipSeller ? (
          <div className="absolute top-2 right-2 bg-[#1A56A0] text-white text-[10px] font-black px-1.5 py-1 rounded-lg shadow-md flex items-center gap-0.5 z-[1] leading-none">
            <Crown size={11} className="shrink-0 text-white" aria-hidden />
            VIP PARTNER
          </div>
        ) : null}
        {isToday && !isVipSeller ? (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-sm font-bold px-2.5 py-1 rounded-lg shadow-sm">
            {todayLabel}
          </div>
        ) : null}
        {isToday && isVipSeller ? (
          <div className="absolute top-10 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            {todayLabel}
          </div>
        ) : null}
        {daysLeft?.urgent && daysLeft.text ? (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-lg shadow-sm">
            <AlertCircle size={11} />
            {daysLeft.text}
          </div>
        ) : null}
        {isShopVerified && listing.shop_logo_url ? (
          <img
            src={listing.shop_logo_url}
            alt=""
            className="absolute bottom-2 right-2 h-9 w-9 rounded-lg object-cover border-2 border-white shadow-md z-[1]"
          />
        ) : null}
      </div>

      <div className="p-3">
        {isShopVerified ? (
          <div className="mb-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
            {shopCopy.verifiedBadge}
          </div>
        ) : null}
        <h3
          data-testid={`text-title-${listing.id}`}
          className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors"
        >
          {listing.title}
        </h3>

        <div data-testid={`text-price-${listing.id}`} className="text-blue-600 font-black text-base mb-2">
          {formatListingPrice(listing.price, market, rates, agreementLabel)}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-1.5 gap-2">
          {listing.location ? (
            <span className="flex items-center gap-1 min-w-0 truncate">
              <MapPin size={11} className="shrink-0" />
              {listing.location}
            </span>
          ) : (
            <span />
          )}
          <span
            className="flex items-center gap-1 shrink-0 font-medium text-gray-500"
            title={viewsLabel}
            data-testid={`text-views-${listing.id}`}
          >
            <Eye size={11} aria-hidden />
            {Number(listing.views ?? 0).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-400 mb-1.5">
          <Clock size={11} />
          <span>{formatDate(listing.created_at)}</span>
        </div>

        {daysLeft && !daysLeft.urgent && daysLeft.text ? (
          <div className="text-sm text-gray-400 mb-1.5">{daysLeft.text}</div>
        ) : null}

        {catName && listing.category_id ? (
          <div className="mt-1">
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (listing.category_id) navigate(categoryPath(listing.category_id));
              }}
              className="text-sm bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {catName}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

/** One bad row must never crash the whole /listings grid. */
export default function ListingCard({ listing }: ListingCardProps) {
  const normalized = normalizeListingCard(listing);
  if (!normalized) return null;

  return (
    <ListingSectionErrorBoundary label={`listing-card-${normalized.id}`}>
      <ListingCardInner listing={normalized} />
    </ListingSectionErrorBoundary>
  );
}
