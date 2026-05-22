import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type TrustedPartner = {
  id: number;
  business_name: string;
  partner_logo_url: string | null;
  profile_photo_url: string | null;
  profile_path: string;
};

type CategoryPartnersBannerProps = {
  categoryId: number;
  className?: string;
};

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

function BannerLogo({
  partner,
  tier,
}: {
  partner: TrustedPartner;
  tier: "vip" | "standard";
}) {
  const img = partnerImageUrl(partner);
  const isVip = tier === "vip";

  return (
    <Link
      href={partner.profile_path}
      onClick={() => recordPartnerClick(partner.id)}
      className={cn(
        "relative flex-shrink-0 h-14 w-[7.5rem] sm:h-16 sm:w-32 rounded-xl overflow-hidden transition-all duration-200",
        "border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isVip
          ? "border-amber-400/90 bg-gradient-to-br from-amber-50 via-yellow-50/90 to-amber-100/50 shadow-[0_2px_10px_rgba(217,119,6,0.18)] hover:border-amber-500 hover:shadow-[0_4px_14px_rgba(217,119,6,0.28)] focus-visible:ring-amber-500"
          : "border-[#1A56A0]/60 bg-gradient-to-br from-white via-blue-50/40 to-blue-50/20 shadow-[0_2px_8px_rgba(26,86,160,0.1)] hover:border-[#1A56A0] hover:shadow-[0_4px_12px_rgba(26,86,160,0.18)] focus-visible:ring-[#1A56A0]",
      )}
      title={partner.business_name}
      data-testid={`category-partner-${tier}-${partner.id}`}
    >
      <span
        className={cn(
          "absolute top-0 right-0 z-[2] flex items-center gap-0.5 px-1 py-0.5 rounded-bl-md text-[7px] sm:text-[8px] font-black tracking-wide leading-tight",
          isVip
            ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
            : "bg-[#1A56A0] text-white",
        )}
      >
        {isVip ? <Star className="h-2 w-2 fill-white shrink-0" aria-hidden /> : null}
        {isVip ? "VIP" : "Partner"}
      </span>
      {img ? (
        <img
          src={img}
          alt={partner.business_name}
          className="relative z-[1] h-full w-full object-contain p-1.5 bg-white/90"
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            "relative z-[1] h-full w-full flex items-center justify-center text-xs font-black",
            isVip ? "bg-amber-600 text-white" : "bg-[#1A56A0] text-white",
          )}
          aria-hidden
        >
          {partnerInitials(partner.business_name)}
        </div>
      )}
    </Link>
  );
}

async function fetchTierPartners(
  tier: "vip" | "standard",
  categoryId: number,
  limit: number,
): Promise<TrustedPartner[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    tier,
    category_id: String(categoryId),
  });
  const r = await fetch(`/api/partners/trusted?${params}`, { credentials: "include" });
  if (!r.ok) return [];
  const data = (await r.json()) as { partners?: TrustedPartner[] };
  return Array.isArray(data.partners) ? data.partners : [];
}

export function CategoryPartnersBanner({ categoryId, className }: CategoryPartnersBannerProps) {
  const [vipPartners, setVipPartners] = useState<TrustedPartner[]>([]);
  const [standardPartners, setStandardPartners] = useState<TrustedPartner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const impressionsSent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    impressionsSent.current = false;
    setLoaded(false);

    void Promise.all([
      fetchTierPartners("vip", categoryId, 12),
      fetchTierPartners("standard", categoryId, 12),
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
  }, [categoryId]);

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

  if (loaded && allPartners.length === 0) return null;

  return (
    <div
      className={cn(
        "border-b border-gray-200/80 bg-gradient-to-r from-slate-50 via-white to-blue-50/40",
        className,
      )}
      data-testid="category-partners-banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300">
          {!loaded
            ? Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`sk-${i}`}
                  className="h-14 w-28 sm:h-16 sm:w-32 flex-shrink-0 rounded-xl animate-pulse bg-gray-200/80"
                />
              ))
            : null}
          {loaded
            ? vipPartners.map((p) => <BannerLogo key={`vip-${p.id}`} partner={p} tier="vip" />)
            : null}
          {loaded
            ? standardPartners.map((p) => (
                <BannerLogo key={`std-${p.id}`} partner={p} tier="standard" />
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
