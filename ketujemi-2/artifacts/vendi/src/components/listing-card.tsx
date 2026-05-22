import { Link, useLocation } from "wouter";
import { MapPin, Eye, Clock, AlertCircle, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarket, convertPrice } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { translateCategory } from "@/lib/category-translations";
import { categoryPath } from "@/lib/category-navigation";

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

// ─── Category photo fallbacks ─────────────────────────────────────────────────
const CAT_PHOTOS: Record<string, string> = {
  "Vetura":    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80",
  "Motorr":    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  "Kamion":    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&q=80",
  "Auto":      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80",
  "Banesa":    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
  "Lokale":    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
  "Telefona":  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
  "Kompjuter": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
  "TV":        "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=400&q=80",
  "Mobilje":   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
  "Rroba":     "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80",
  "Fëmijë":   "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
  "Sport":     "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
  "Punë":      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
  "Bujqësi":  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=80",
  "Arsim":     "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
  "Muzikë":   "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80",
  "Kafshë":   "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80",
};

const FALLBACKS = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80",
];

function getPhoto(categoryName: string, id: number): string {
  const key = Object.keys(CAT_PHOTOS).find((k) => categoryName?.startsWith(k));
  return key ? CAT_PHOTOS[key] : FALLBACKS[id % FALLBACKS.length];
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ListingCardProps {
  listing: {
    id: number;
    title: string;
    price?: number | null;
    location?: string | null;
    image_url?: string | null;
    is_featured?: boolean;
    is_top?: boolean;
    is_vip_seller?: boolean;
    views?: number;
    created_at: string;
    expires_at?: string | null;
    category_name?: string | null;
    category_id?: number;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ListingCard({ listing }: ListingCardProps) {
  const { market, rates, t, uiLang } = useMarket();
  const [, navigate] = useLocation();
  const photo = listing.image_url || getPhoto(listing.category_name ?? "", listing.id);
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
      {/* Photo */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={photo}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACKS[0]; }}
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
