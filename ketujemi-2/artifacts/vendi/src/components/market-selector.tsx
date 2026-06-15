import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MARKETS, useMarket } from "@/lib/market-context";
import { marketDisplayCode, marketDisplayName } from "@/lib/market-labels-i18n";

type MarketSelectorProps = {
  /** `on-dark` for hero overlay; `on-light` for white navbar. */
  variant?: "on-dark" | "on-light";
  /** Tighter control for mobile header action row */
  compact?: boolean;
  /** Classic home header — taller touch targets (min-h-12). */
  largeTouch?: boolean;
  className?: string;
};

export function MarketSelector({
  variant = "on-light",
  compact,
  largeTouch,
  className,
}: MarketSelectorProps) {
  const { market, setMarket, uiLang } = useMarket();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onDark = variant === "on-dark";
  const code = marketDisplayCode(market);

  return (
    <div ref={ref} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        data-testid="button-market-selector"
        aria-label={marketDisplayName(market, uiLang)}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-xl border text-sm font-semibold transition-all touch-manipulation shrink-0 whitespace-nowrap",
          compact
            ? largeTouch
              ? "w-full min-w-0 justify-center px-3 min-h-12 max-md:text-base"
              : "w-full min-w-0 justify-center px-2.5 min-h-9 max-md:text-sm"
            : "gap-1 px-3 min-h-9",
          onDark
            ? "border-white/25 bg-white/10 hover:bg-white/20 text-white shadow-none"
            : "border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-800",
        )}
      >
        <span className="font-bold tracking-wide">{code}</span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 opacity-80 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Choose market"
          className={cn(
            "absolute top-full right-0 z-50 mt-1 max-h-[min(70vh,18rem)] min-w-[10.5rem] overflow-y-auto rounded-lg border py-0.5 shadow-lg",
            onDark ? "border-white/20 bg-gray-900/95" : "border-gray-100 bg-white",
          )}
        >
          {MARKETS.map((m) => {
            const active = m.code === market.code;
            const label = marketDisplayName(m, uiLang);
            return (
              <button
                key={m.code}
                type="button"
                role="option"
                aria-selected={active}
                title={label}
                aria-label={label}
                data-testid={`option-market-${m.code}`}
                onClick={() => {
                  setMarket(m);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full min-h-9 items-center gap-2 px-2.5 py-1.5 text-left text-xs font-semibold transition-colors touch-manipulation",
                  active
                    ? onDark
                      ? "bg-white/15 text-white"
                      : "bg-blue-50 text-blue-700"
                    : onDark
                      ? "text-white/90 hover:bg-white/10"
                      : "text-gray-800 hover:bg-gray-50",
                )}
              >
                <span className="w-7 shrink-0 font-bold text-[11px] tracking-wide">
                  {marketDisplayCode(m)}
                </span>
                <span className="min-w-0 truncate">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
