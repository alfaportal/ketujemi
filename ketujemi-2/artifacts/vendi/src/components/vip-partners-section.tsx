import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Sparkles, Star } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { partnerSignupHref } from "@/lib/static-page-paths";
import { cn } from "@/lib/utils";
import { PartnerSlot, type PartnerSlotData } from "@/components/partner-slot";

export type VipPartnersSectionVariant = "home" | "hub";

type TrustedPartner = PartnerSlotData;

type PartnerTier = "vip" | "standard";

type VipPartnersSectionProps = {
  className?: string;
  /** home = 6 VIP + 6 standard per row; hub = 4 + 4 */
  variant?: VipPartnersSectionVariant;
  /** When set (category hub), API returns partners with listings in this category tree. */
  categoryId?: number;
};

const VARIANT_CONFIG: Record<
  VipPartnersSectionVariant,
  { rowLimit: number; gridClass: string }
> = {
  home: {
    rowLimit: 6,
    gridClass: "grid grid-cols-2 md:grid-cols-6 gap-4 sm:gap-6",
  },
  hub: {
    rowLimit: 4,
    gridClass: "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4",
  },
};

const STANDARD_SLOT_FRAME = cn(
  "h-14 sm:h-16 w-full rounded-xl overflow-hidden transition-all duration-200 flex flex-col",
  "border-2 border-[#1A56A0]/70 bg-gradient-to-br from-white via-blue-50/40 to-blue-50/20",
  "shadow-[0_2px_10px_rgba(26,86,160,0.12)]",
  "hover:border-[#1A56A0] hover:shadow-[0_4px_16px_rgba(26,86,160,0.22)]",
);

const VIP_SLOT_FRAME = cn(
  "h-24 sm:h-28 md:h-32 w-full rounded-xl overflow-hidden transition-all duration-200 flex flex-col",
  "border-[3px] border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50/90 to-amber-100/50",
  "shadow-[0_3px_14px_rgba(217,119,6,0.28)]",
  "hover:border-amber-500 hover:shadow-[0_5px_20px_rgba(217,119,6,0.38)]",
);

function EmptyPartnerSlot({
  label,
  tier,
  signupAriaLabel,
}: {
  label: string;
  tier: PartnerTier;
  signupAriaLabel: string;
}) {
  const isVip = tier === "vip";
  return (
    <Link
      href={partnerSignupHref(tier)}
      className={cn(
        isVip ? VIP_SLOT_FRAME : STANDARD_SLOT_FRAME,
        "relative flex flex-col items-center justify-center gap-0.5 px-2 border-dashed",
        isVip ? "border-amber-400/80" : "border-[#1A56A0]/70",
        "cursor-pointer hover:scale-[1.02] active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isVip ? "focus-visible:ring-amber-500" : "focus-visible:ring-[#1A56A0]",
      )}
      aria-label={signupAriaLabel}
      data-testid={`trusted-partner-empty-${tier}`}
    >
      {isVip ? (
        <Star className="h-3.5 w-3.5 text-amber-600 fill-amber-400" aria-hidden />
      ) : (
        <Sparkles className="h-3.5 w-3.5 text-[#1A56A0]" strokeWidth={2.25} aria-hidden />
      )}
      <span
        className={cn(
          "text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center leading-tight",
          isVip ? "text-amber-700" : "text-[#1A56A0]",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function PartnerRow({
  tier,
  partners,
  loaded,
  limit,
  gridClass,
  emptyLabel,
  emptySignupAria,
  rowLabel,
}: {
  tier: PartnerTier;
  partners: TrustedPartner[];
  loaded: boolean;
  limit: number;
  gridClass: string;
  emptyLabel: string;
  emptySignupAria: string;
  rowLabel: string;
}) {
  const emptySlots = Math.max(0, limit - partners.length);
  const isVip = tier === "vip";

  return (
    <div className="space-y-3 sm:space-y-4">
      <p
        className={cn(
          "text-center text-xs sm:text-sm font-black uppercase tracking-wider",
          isVip ? "text-amber-700" : "text-[#1A56A0]",
        )}
      >
        {isVip ? (
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
            {rowLabel}
          </span>
        ) : (
          rowLabel
        )}
      </p>
      <div className={gridClass}>
        {partners.map((p) => (
          <PartnerSlot
            key={p.id}
            partner={{ ...p, tier }}
            frameClass={tier === "vip" ? VIP_SLOT_FRAME : STANDARD_SLOT_FRAME}
          />
        ))}
        {loaded && emptySlots > 0
          ? Array.from({ length: emptySlots }, (_, i) => (
              <EmptyPartnerSlot
                key={`empty-${tier}-${i}`}
                label={emptyLabel}
                tier={tier}
                signupAriaLabel={emptySignupAria}
              />
            ))
          : null}
        {!loaded
          ? Array.from({ length: limit }, (_, i) => (
              <div
                key={`sk-${tier}-${i}`}
                className={cn(
                  isVip ? VIP_SLOT_FRAME : STANDARD_SLOT_FRAME,
                  "animate-pulse",
                  isVip ? "border-amber-200/60 bg-amber-50/50" : "border-blue-200/60 bg-blue-50/40",
                )}
              />
            ))
          : null}
      </div>
    </div>
  );
}

async function fetchTierPartners(
  tier: PartnerTier,
  limit: number,
  categoryId?: number,
): Promise<TrustedPartner[]> {
  const params = new URLSearchParams({ limit: String(limit), tier });
  if (categoryId != null && categoryId > 0) {
    params.set("category_id", String(categoryId));
  }
  const r = await fetch(`/api/partners/trusted?${params}`, { credentials: "include" });
  if (!r.ok) return [];
  const data = (await r.json()) as { partners?: PartnerSlotData[] };
  const list = Array.isArray(data.partners) ? data.partners : [];
  return list.map((p) => ({
    ...p,
    click_url: p.click_url ?? null,
    tier: p.tier ?? tier,
    banner_urls: Array.isArray(p.banner_urls) ? p.banner_urls : [],
  }));
}

export function VipPartnersSection({
  className,
  variant = "hub",
  categoryId,
}: VipPartnersSectionProps) {
  const { t } = useMarket();
  const config = VARIANT_CONFIG[variant];
  const [vipPartners, setVipPartners] = useState<TrustedPartner[]>([]);
  const [standardPartners, setStandardPartners] = useState<TrustedPartner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const impressionsSent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    impressionsSent.current = false;
    setLoaded(false);

    void Promise.all([
      fetchTierPartners("vip", config.rowLimit, categoryId),
      fetchTierPartners("standard", config.rowLimit, categoryId),
    ])
      .then(([vip, standard]) => {
        if (!cancelled) {
          setVipPartners(vip);
          setStandardPartners(standard);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVipPartners([]);
          setStandardPartners([]);
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [config.rowLimit, categoryId]);

  const allPartners = [...vipPartners, ...standardPartners];

  useEffect(() => {
    if (!loaded || allPartners.length === 0 || impressionsSent.current) return;
    impressionsSent.current = true;
    void fetch("/api/partners/analytics/impressions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ partner_ids: allPartners.map((p) => p.id) }),
    }).catch(() => {});
  }, [loaded, allPartners]);

  const vipEmpty =
    variant === "home" ? t.home_partnerVipPlaceholder : t.hub_partnerVipPlaceholder;
  const standardEmpty =
    variant === "home" ? t.home_partnerStandardPlaceholder : t.hub_partnerStandardPlaceholder;

  return (
    <section
      className={cn(
        variant === "home"
          ? "bg-gray-50 border-t border-gray-200/80"
          : "bg-gradient-to-b from-blue-50/25 to-gray-50 rounded-2xl border border-[#1A56A0]/20 shadow-sm",
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
        <div className="space-y-8 sm:space-y-10">
          <PartnerRow
            tier="vip"
            partners={vipPartners}
            loaded={loaded}
            limit={config.rowLimit}
            gridClass={config.gridClass}
            emptyLabel={vipEmpty}
            emptySignupAria={t.home_partnerEmptySignupVip}
            rowLabel={t.home_partnerVipRowLabel}
          />
          <PartnerRow
            tier="standard"
            partners={standardPartners}
            loaded={loaded}
            limit={config.rowLimit}
            gridClass={config.gridClass}
            emptyLabel={standardEmpty}
            emptySignupAria={t.home_partnerEmptySignupStandard}
            rowLabel={t.home_partnerStandardRowLabel}
          />
        </div>
      </div>
    </section>
  );
}
