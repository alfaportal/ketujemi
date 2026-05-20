import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";

export type VipPartnersSectionVariant = "home" | "hub";

type TrustedPartner = {
  id: number;
  business_name: string;
  partner_logo_url: string | null;
  profile_photo_url: string | null;
  profile_path: string;
};

type VipPartnersSectionProps = {
  className?: string;
  /** home = up to 12 partners (6×2); hub = up to 8 (4×2) */
  variant?: VipPartnersSectionVariant;
  /** When set (category hub), API returns only VIP partners with listings in this category tree. */
  categoryId?: number;
};

const VARIANT_CONFIG: Record<
  VipPartnersSectionVariant,
  { limit: number; gridClass: string; testIdPrefix: string }
> = {
  home: {
    limit: 12,
    gridClass: "grid grid-cols-2 md:grid-cols-6 gap-4 sm:gap-6",
    testIdPrefix: "trusted-partner",
  },
  hub: {
    limit: 8,
    gridClass: "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4",
    testIdPrefix: "trusted-partner",
  },
};

const PARTNER_SLOT_FRAME = cn(
  "h-14 sm:h-16 w-full rounded-xl overflow-hidden transition-all duration-200",
  "border-2 border-amber-400/75 bg-gradient-to-br from-white via-amber-50/40 to-amber-100/30",
  "shadow-[0_2px_10px_rgba(245,158,11,0.12)]",
  "hover:border-amber-500 hover:shadow-[0_4px_16px_rgba(245,158,11,0.22)]",
);

function partnerImageUrl(p: TrustedPartner): string | null {
  const url = p.partner_logo_url?.trim() || p.profile_photo_url?.trim();
  return url || null;
}

function partnerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "B";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

function recordPartnerClick(partnerId: number) {
  void fetch("/api/partners/analytics/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ partner_id: partnerId }),
  }).catch(() => {});
}

function PartnerLogoSlot({
  partner,
  variant,
}: {
  partner: TrustedPartner;
  variant: VipPartnersSectionVariant;
}) {
  const img = partnerImageUrl(partner);
  const href = partner.profile_path;

  return (
    <Link
      href={href}
      onClick={() => recordPartnerClick(partner.id)}
      className={cn(
        PARTNER_SLOT_FRAME,
        "relative group block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
      )}
      title={partner.business_name}
      data-testid={`trusted-partner-${partner.id}`}
    >
      {variant === "hub" ? (
        <span className="absolute top-0 right-0 z-[2] bg-gradient-to-l from-amber-500 to-yellow-400 text-[8px] font-black text-amber-950 px-1.5 py-0.5 rounded-bl-md tracking-wide">
          VIP
        </span>
      ) : null}
      {img ? (
        <img
          src={img}
          alt={partner.business_name}
          className="relative z-[1] h-full w-full object-contain p-2 bg-white/90 group-hover:scale-[1.03] transition-transform"
          loading="lazy"
        />
      ) : (
        <div
          className="relative z-[1] h-full w-full flex flex-col items-center justify-center px-2 bg-gradient-to-br from-[#1A56A0] to-[#2563b8] text-white"
          aria-hidden
        >
          <span className="text-lg sm:text-xl font-black leading-none">
            {partnerInitials(partner.business_name)}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide mt-1 text-center line-clamp-2 leading-tight opacity-95">
            {partner.business_name}
          </span>
        </div>
      )}
    </Link>
  );
}

function EmptyPartnerSlot({ label }: { label: string }) {
  return (
    <div
      className={cn(
        PARTNER_SLOT_FRAME,
        "relative flex flex-col items-center justify-center gap-0.5 px-2 border-dashed border-amber-400/90",
        "from-amber-50/80 via-white to-amber-50/50",
      )}
      aria-hidden
    >
      <Sparkles className="h-3.5 w-3.5 text-amber-500/90" strokeWidth={2.25} />
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-700/90 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

export function VipPartnersSection({
  className,
  variant = "hub",
  categoryId,
}: VipPartnersSectionProps) {
  const { t } = useMarket();
  const config = VARIANT_CONFIG[variant];
  const [partners, setPartners] = useState<TrustedPartner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const impressionsSent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    impressionsSent.current = false;
    setLoaded(false);

    const params = new URLSearchParams({ limit: String(config.limit) });
    if (categoryId != null && categoryId > 0) {
      params.set("category_id", String(categoryId));
    }

    void fetch(`/api/partners/trusted?${params}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { partners: [] }))
      .then((data: { partners?: TrustedPartner[] }) => {
        if (!cancelled) {
          setPartners(Array.isArray(data.partners) ? data.partners : []);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPartners([]);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [config.limit, categoryId]);

  useEffect(() => {
    if (!loaded || partners.length === 0 || impressionsSent.current) return;
    impressionsSent.current = true;
    void fetch("/api/partners/analytics/impressions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ partner_ids: partners.map((p) => p.id) }),
    }).catch(() => {});
  }, [loaded, partners]);

  const emptySlots = Math.max(0, config.limit - partners.length);
  const emptyLabel =
    variant === "home" ? t.home_partnerPlaceholder : t.hub_partnerPlaceholder;

  return (
    <section
      className={cn(
        variant === "home"
          ? "bg-gray-50 border-t border-gray-200/80"
          : "bg-gradient-to-b from-amber-50/30 to-gray-50 rounded-2xl border border-amber-200/60 shadow-sm",
        className,
      )}
      aria-labelledby="vip-partners-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <h2
          id="vip-partners-heading"
          className={cn(
            "text-center text-lg font-black text-gray-900",
            variant === "home" ? "mb-8" : "mb-6 sm:mb-8",
          )}
        >
          {t.home_partnerHeading}
        </h2>
        <div className={config.gridClass}>
          {partners.map((p) => (
            <PartnerLogoSlot key={p.id} partner={p} variant={variant} />
          ))}
          {loaded && emptySlots > 0
            ? Array.from({ length: emptySlots }, (_, i) => (
                <EmptyPartnerSlot key={`empty-${i}`} label={emptyLabel} />
              ))
            : null}
          {!loaded
            ? Array.from({ length: config.limit }, (_, i) => (
                <div
                  key={`sk-${i}`}
                  className={cn(PARTNER_SLOT_FRAME, "animate-pulse border-amber-200/60 bg-amber-50/50")}
                />
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
