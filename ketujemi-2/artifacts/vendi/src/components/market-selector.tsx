import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MARKETS, useMarket } from "@/lib/market-context";

type MarketSelectorProps = {
  /** `on-dark` for hero overlay; `on-light` for white navbar. */
  variant?: "on-dark" | "on-light";
};

export function MarketSelector({ variant = "on-light" }: MarketSelectorProps) {
  const { market, setMarket } = useMarket();
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-testid="button-market-selector"
        aria-label={market.name}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-full border text-xl leading-none touch-manipulation transition-all",
          onDark
            ? "border-white/25 bg-white/10 hover:bg-white/20"
            : "border-gray-200 bg-white shadow-sm hover:bg-gray-50",
        )}
      >
        <span aria-hidden>{market.flag}</span>
      </button>
      {open && (
        <div
          className={cn(
            "absolute top-full right-0 z-50 mt-1.5 max-w-[min(100vw-2rem,12.5rem)] rounded-2xl border p-2 shadow-2xl",
            onDark ? "border-white/20 bg-gray-900/95" : "border-gray-100 bg-white",
          )}
        >
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
            {MARKETS.map((m) => (
              <button
                key={m.code}
                type="button"
                title={m.name}
                aria-label={m.name}
                data-testid={`option-market-${m.code}`}
                onClick={() => {
                  setMarket(m);
                  setOpen(false);
                }}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none transition-colors touch-manipulation",
                  m.code === market.code
                    ? onDark
                      ? "bg-white/25 ring-2 ring-white/60"
                      : "bg-blue-50 ring-2 ring-blue-500"
                    : onDark
                      ? "hover:bg-white/15"
                      : "hover:bg-gray-100",
                )}
              >
                <span aria-hidden>{m.flag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
