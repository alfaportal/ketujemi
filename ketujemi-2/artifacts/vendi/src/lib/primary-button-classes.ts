import { cn } from "@/lib/utils";

/** Primary blue CTA — unified size (matches filter “Zbato”). */
export const primaryBlueButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all min-h-12 px-5 py-3 md:py-2.5 touch-manipulation shrink-0 whitespace-nowrap";

export function cnPrimaryBlue(...extra: (string | undefined | false)[]) {
  return cn(primaryBlueButtonClass, ...extra);
}

/** Toggle / outline control with the same height as primary blue buttons. */
export const filterToggleButtonBaseClass =
  "inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all min-h-12 px-5 py-3 md:py-2.5 touch-manipulation shrink-0 whitespace-nowrap";
