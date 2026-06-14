import { useEffect, useRef, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { cn } from "@/lib/utils";
import { PartnerSlot, type PartnerSlotData } from "@/components/partner-slot";

const VIP_FRAME = cn(
  "h-24 w-[7.5rem] sm:h-28 sm:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden flex flex-col",
  "border-[3px] border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50/90 to-amber-100/50",
  "shadow-[0_2px_10px_rgba(217,119,6,0.18)] hover:border-amber-500",
);

const STANDARD_FRAME = cn(
  "h-20 w-[7.5rem] sm:h-24 sm:w-32 flex-shrink-0 rounded-xl overflow-hidden flex flex-col",
  "border-2 border-[#1A56A0]/60 bg-gradient-to-br from-white via-blue-50/40 to-blue-50/20",
  "shadow-[0_2px_8px_rgba(26,86,160,0.1)] hover:border-[#1A56A0]",
);

type CategoryPartnersBannerProps = {
  categoryId: number;
  className?: string;
};

async function fetchTierPartners(
  tier: "vip" | "standard",
  categoryId: number,
  limit: number,
): Promise<PartnerSlotData[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    tier,
    category_id: String(categoryId),
  });
  const r = await fetchWithTimeout(`/api/partners/trusted?${params}`, { credentials: "include" });
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

export function CategoryPartnersBanner({ categoryId, className }: CategoryPartnersBannerProps) {
  const [vipPartners, setVipPartners] = useState<PartnerSlotData[]>([]);
  const [standardPartners, setStandardPartners] = useState<PartnerSlotData[]>([]);
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
    if (!loaded || impressionsSent.current) return;
    const partnerIds = allPartners
      .map((p) => p.id)
      .filter((id) => Number.isFinite(id) && id > 0);
    if (partnerIds.length === 0) return;
    impressionsSent.current = true;
    void fetchWithTimeout("/api/partners/analytics/impressions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ partner_ids: partnerIds }),
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
        <div className="flex gap-3 overflow-x-auto pb-1">
          {!loaded
            ? Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`sk-${i}`}
                  className="h-14 w-28 sm:h-16 sm:w-32 flex-shrink-0 rounded-xl animate-pulse bg-gray-200/80"
                />
              ))
            : null}
          {vipPartners.map((p) => (
            <PartnerSlot key={`vip-${p.id}`} partner={p} frameClass={VIP_FRAME} variant="banner" />
          ))}
          {standardPartners.map((p) => (
            <PartnerSlot
              key={`std-${p.id}`}
              partner={p}
              frameClass={STANDARD_FRAME}
              variant="banner"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
