import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MapPin, Eye, Clock, AlertCircle, Crown, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarket, convertPrice } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { translateCategory } from "@/lib/category-translations";
import { categoryPath } from "@/lib/category-navigation";
import { ListingCardImage } from "@/components/listing-card-image";
import { DHURATA_FALAS_SLUG, isDhurataFalasSlug } from "@/lib/special-listing-categories";
import { maskSellerPhone } from "@/lib/mask-seller-phone";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";

// ─── Formatted timestamp ──────────────────────────────────────────────────────
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day   = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year  = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const mins  = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} · ${hours}:${mins}`;
}

// ─── Expiry countdown ─────────────────────────────────────────────────────────
function getDaysLeft(expiresAt: string | null | undefined, marketCode: string): { text: string; urgent: boolean } | null {
  if (!expiresAt) return null;
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return null;
  const urgent = days <= 3;
  const labels: Record<string, string> = {
    ks:  days === 1 ? "Skadon nesër" : `Skadon për ${days} ditë`,
    al:  days === 1 ? "Skadon nesër" : `Skadon për ${days} ditë`,
    mk:  days === 1 ? "Истекува утре" : `Истекува за ${days} дена`,
    mne: days === 1 ? "Ističe sutra"  : `Ističe za ${days} dana`,
  };
  return { text: labels[marketCode] ?? `${days}d`, urgent };
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ListingCardProps {
  listing: {
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
  };
}

function DhurataGiftListingCard({ listing }: ListingCardProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const masked =
    listing.seller_phone_masked ||
    (listing.seller_phone ? maskSellerPhone(listing.seller_phone) : "+*** **** ***");
  const fullPhone = listing.seller_phone?.trim() ?? "";

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
      <Link href={`/listings/${listing.id}`} className="block">
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
        <Link href={`/listings/${listing.id}`}>
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function ListingCard({ listing }: ListingCardProps) {
  const { market, rates, t, uiLang } = useMarket();
  const [, navigate] = useLocation();
  const isDhurata =
    isDhurataFalasSlug(listing.category_root_slug) ||
    listing.category_name === "Dhurata & Falas";

  if (isDhurata) {
    return <DhurataGiftListingCard listing={listing} />;
  }

  const isToday = new Date(listing.created_at).toDateString() === new Date().toDateString();
  const daysLeft = getDaysLeft(listing.expires_at, market.code);
  const catName = translateCategory(listing.category_name ?? "", translationKeyForUiLang(uiLang));
  const isVipSeller = !!listing.is_vip_seller;

  return (
    <Link
      href={`/listings/${listing.id}`}
      data-testid={`card-listing-${listing.id}`}
      className={cn(
        "group bg-white rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-200 block",
        isVipSeller
          ? "border-[#1A56A0]/40 ring-2 ring-[#1A56A0]/50 hover:border-[#1A56A0] hover:ring-[#1A56A0]/70"
          : "border-gray-100 hover:border-blue-200",
      )}
    >
      {/* Photo — only user-uploaded URL or neutral placeholder (no stock/category fallbacks) */}
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
            ⭐ Promovuar
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
            {t.today}
          </div>
        ) : null}
        {isToday && isVipSeller ? (
          <div className="absolute top-10 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            {t.today}
          </div>
        ) : null}
        {daysLeft?.urgent && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-lg shadow-sm">
            <AlertCircle size={11} />
            {daysLeft.text}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3
          data-testid={`text-title-${listing.id}`}
          className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors"
        >
          {listing.title}
        </h3>

        <div data-testid={`text-price-${listing.id}`} className="text-blue-600 font-black text-base mb-2">
          {listing.price ? convertPrice(listing.price, market, rates) : t.agreement}
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
            title={t.views}
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

        {daysLeft && !daysLeft.urgent && (
          <div className="text-sm text-gray-400 mb-1.5">{daysLeft.text}</div>
        )}

        {catName && listing.category_id && (
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
        )}
      </div>
    </Link>
  );
}
