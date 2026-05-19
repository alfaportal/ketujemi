import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";

export type VipPartnersSectionVariant = "home" | "hub";

type VipPartnersSectionProps = {
  className?: string;
  /** home = 12 partners (6×2); hub = 8 partners (4×2) between search and listings */
  variant?: VipPartnersSectionVariant;
};

const VARIANT_CONFIG: Record<
  VipPartnersSectionVariant,
  { count: number; gridClass: string; testIdPrefix: string; labelClass: string }
> = {
  home: {
    count: 12,
    gridClass: "grid grid-cols-2 md:grid-cols-6 gap-4 sm:gap-6",
    testIdPrefix: "sponsor-placeholder",
    labelClass: "text-sm font-semibold text-gray-500 uppercase tracking-wide",
  },
  hub: {
    count: 8,
    gridClass: "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4",
    testIdPrefix: "partner-placeholder",
    labelClass:
      "text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide text-center",
  },
};

export function VipPartnersSection({
  className,
  variant = "hub",
}: VipPartnersSectionProps) {
  const { t } = useMarket();
  const config = VARIANT_CONFIG[variant];
  const placeholders = Array.from({ length: config.count }, (_, i) => i + 1);
  const slotLabel =
    variant === "home" ? t.home_partnerPlaceholder : t.hub_partnerPlaceholder;

  return (
    <section
      className={cn(
        "bg-gray-50",
        variant === "home"
          ? "border-t border-gray-200/80"
          : "rounded-2xl border border-gray-200/80",
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
          {placeholders.map((n) => (
            <div
              key={n}
              className={cn(
                "h-14 sm:h-16 w-full rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center px-2",
                config.labelClass,
              )}
              data-testid={`${config.testIdPrefix}-${n}`}
            >
              {slotLabel}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
