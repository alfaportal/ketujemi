import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { primaryBlueButtonClass } from "@/lib/primary-button-classes";
import { UI_LANGUAGES } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";

type LanguageSelectorProps = {
  variant?: "on-dark" | "on-light";
  /** Tighter control for mobile header action row */
  compact?: boolean;
};

export function LanguageSelector({ variant = "on-light", compact }: LanguageSelectorProps) {
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
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        data-testid="button-language-selector"
        aria-label={`${current.displayCode} ${current.label}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          primaryBlueButtonClass,
          compact ? "w-full min-w-0 justify-center gap-0.5 px-2.5 min-h-11" : "gap-1 px-4",
          onDark && "border border-white/25 bg-white/10 hover:bg-white/20 shadow-none",
        )}
      >
        <span className="text-base leading-none" aria-hidden>
          {current.flag}
        </span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 opacity-80 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Zgjidh gjuhën"
          className={cn(
            "absolute top-full left-0 z-50 mt-1 min-w-[9.5rem] overflow-hidden rounded-lg border py-0.5 shadow-lg",
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
                data-testid={`option-language-${lang.code}`}
                onClick={() => {
                  setUiLang(lang.code);
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
                <span className="text-sm leading-none" aria-hidden>
                  {lang.flag}
                </span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
