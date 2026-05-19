import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";

const VIP_PARTNER_COUNT = 8;

type VipPartnersSectionProps = {
  className?: string;
};

/** Placeholder grid for VIP partners (8 slots, 2×4 on md+). */
export function VipPartnersSection({ className }: VipPartnersSectionProps) {
  const { t } = useMarket();
  const placeholders = Array.from({ length: VIP_PARTNER_COUNT }, (_, i) => i + 1);

  return (
    <section
      className={cn("bg-gray-50 rounded-2xl border border-gray-200/80", className)}
      aria-labelledby="vip-partners-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <h2
          id="vip-partners-heading"
          className="text-center text-lg font-black text-gray-900 mb-6 sm:mb-8"
        >
          {t.home_partnerHeading}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {placeholders.map((n) => (
            <div
              key={n}
              className="h-14 sm:h-16 w-full rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide text-center px-2"
              data-testid={`vip-partner-placeholder-${n}`}
            >
              {t.home_partnerPlaceholder}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
