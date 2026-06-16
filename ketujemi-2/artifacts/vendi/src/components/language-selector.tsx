import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UI_LANGUAGES } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";

type LanguageSelectorProps = {
  variant?: "on-dark" | "on-light";
  /** Tighter control for mobile header action row */
  compact?: boolean;
  /** Classic home header — taller touch targets (min-h-12). */
  largeTouch?: boolean;
  className?: string;
};

export function LanguageSelector({
  variant = "on-light",
  compact,
  largeTouch,
  className,
}: LanguageSelectorProps) {
  const { uiLang, setUiLang } = useMarket();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = UI_LANGUAGES.find((l) => l.code === uiLang) ?? UI_LANGUAGES[0];
  const onDark = variant === "on-dark";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        data-testid="button-language-selector"
        aria-label={current.label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-xl border text-sm font-semibold transition-all touch-manipulation shrink-0 whitespace-nowrap",
          compact
            ? largeTouch
              ? "w-full min-w-0 justify-center px-3 min-h-12"
              : "w-full min-w-0 justify-center px-2.5 min-h-9"
            : "gap-1 px-2.5 min-h-9",
          onDark
            ? "border-white/25 bg-white/10 hover:bg-white/20 text-white shadow-none"
            : "border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-800",
        )}
      >
        <span className="text-lg leading-none" aria-hidden>
          {current.flag}
        </span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 opacity-70 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Choose language"
          className={cn(
            "absolute top-full left-0 z-50 mt-1 max-h-[min(70vh,16rem)] min-w-[10rem] overflow-y-auto rounded-lg border py-0.5 shadow-lg",
            onDark ? "border-white/20 bg-gray-900/95" : "border-gray-100 bg-white",
          )}
        >
          {UI_LANGUAGES.map((lang) => {
            const active = lang.code === uiLang;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={active}
                aria-label={lang.label}
                data-testid={`option-language-${lang.code}`}
                onClick={() => {
                  setUiLang(lang.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full min-h-9 items-center gap-2.5 px-2.5 py-1.5 text-left text-xs font-semibold transition-colors touch-manipulation",
                  active
                    ? onDark
                      ? "bg-white/15 text-white"
                      : "bg-blue-50 text-blue-700"
                    : onDark
                      ? "text-white/90 hover:bg-white/10"
                      : "text-gray-800 hover:bg-gray-50",
                )}
              >
                <span className="w-6 shrink-0 text-center text-base leading-none" aria-hidden>
                  {lang.flag}
                </span>
                <span className="min-w-0 truncate">{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
