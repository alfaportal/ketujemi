import { Link } from "wouter";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  testId?: string;
  /** header = nav (large); compact = footer */
  size?: "header" | "compact";
};

const SIZE = {
  header: {
    wrap: "rounded-2xl px-4 py-2.5 sm:px-5 sm:py-2.5 shadow-[0_4px_14px_rgba(37,99,235,0.45)]",
    text: "text-[1.2rem] sm:text-[1.35rem] md:text-[1.5rem] leading-none",
    domain: "text-[0.92em] font-bold opacity-95",
  },
  compact: {
    wrap: "rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-[0_3px_10px_rgba(37,99,235,0.35)]",
    text: "text-base sm:text-lg leading-none",
    domain: "text-[0.9em] font-bold opacity-95",
  },
} as const;

/** KetuJemi.com brand mark — gradient pill wordmark, sharp on all screens. */
export function SiteLogo({ className, testId = "link-logo", size = "header" }: Props) {
  const s = SIZE[size];

  return (
    <Link
      href="/"
      data-testid={testId}
      className={cn("inline-flex shrink-0 items-center select-none touch-manipulation", className)}
      aria-label="KetuJemi.com"
    >
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden border border-white/25",
          "bg-gradient-to-b from-[#4a9eff] via-[#2563eb] to-[#1d4ed8]",
          s.wrap,
        )}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-white/35 to-transparent"
          aria-hidden
        />
        <span
          className={cn(
            "relative z-[1] whitespace-nowrap font-black tracking-tight text-white",
            "[text-shadow:0_1px_2px_rgba(15,23,42,0.35)]",
            s.text,
          )}
        >
          KetuJemi
          <span className={s.domain}>.com</span>
        </span>
      </span>
    </Link>
  );
}
