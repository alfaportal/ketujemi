import { cn } from "@/lib/utils";

const base = "fill-none stroke-current stroke-[1.5] text-slate-700";

export function SilhouetteSedan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 30" className={cn(base, className)} aria-hidden>
      <path d="M4 20 L12 15 L26 13 L46 13 L60 15 L68 20 L68 24 L4 24 Z" />
      <path d="M28 13 L32 9 L40 9 L44 13" />
      <circle cx="16" cy="24" r="3.2" />
      <circle cx="56" cy="24" r="3.2" />
    </svg>
  );
}

export function SilhouetteSuv({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 34" className={cn(base, className)} aria-hidden>
      <path d="M4 23 L14 17 L26 14 L52 14 L64 17 L68 23 L68 28 L4 28 Z" />
      <path d="M28 14 L34 11 L42 11 L46 14" />
      <circle cx="17" cy="28" r="3.6" />
      <circle cx="55" cy="28" r="3.6" />
    </svg>
  );
}

export function SilhouetteHatchback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 30" className={cn(base, className)} aria-hidden>
      <path d="M8 21 L14 17 L46 17 L62 21 L62 25 L8 25 Z" />
      <path d="M18 17 L46 17 L54 21" />
      <path d="M14 17 L26 13 L42 13 L46 17" />
      <circle cx="20" cy="25" r="3" />
      <circle cx="52" cy="25" r="3" />
    </svg>
  );
}

export function SilhouetteMinivan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 32" className={cn(base, className)} aria-hidden>
      <path d="M6 21 L14 17 L54 17 L66 21 L66 26 L6 26 Z" />
      <path d="M18 17 L54 17" />
      <path d="M16 17 L22 13 L52 13 L58 17" />
      <circle cx="19" cy="26" r="3" />
      <circle cx="56" cy="26" r="3" />
    </svg>
  );
}

export function SilhouetteConvertible({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 28" className={cn(base, className)} aria-hidden>
      <path d="M4 19 L12 16 L28 14 L48 14 L62 16 L68 19 L68 22 L4 22 Z" />
      <path d="M30 14 L36 10 L44 10 L50 14" />
      <circle cx="16" cy="22" r="3" />
      <circle cx="56" cy="22" r="3" />
    </svg>
  );
}

export function SilhouetteCoupe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 30" className={cn(base, className)} aria-hidden>
      <path d="M6 20 L16 15 L50 13 L62 17 L68 21 L68 24 L6 24 Z" />
      <path d="M32 13 L40 11 L46 13" />
      <circle cx="18" cy="24" r="3" />
      <circle cx="56" cy="24" r="3" />
    </svg>
  );
}

export function SilhouetteEv({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 28" className={cn(base, className)} aria-hidden>
      <path d="M4 19 L12 16 L58 14 L66 16 L68 19 L68 22 L4 22 Z" opacity="0.45" />
      <path
        d="M38 7 L40 12 L36 12 L40 20 L32 12 L36 12 Z"
        strokeWidth={1.4}
        fill="currentColor"
        className="opacity-50"
        stroke="none"
      />
    </svg>
  );
}
