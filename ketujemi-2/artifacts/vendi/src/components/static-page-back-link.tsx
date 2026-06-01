import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useLocation } from "wouter";
import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";

type StaticPageBackLinkProps = {
  className?: string;
  /** Override default back (history.back or home). */
  onBack?: () => void;
  fallbackPath?: string;
};

/** Back control for footer / legal / partner static pages. */
export function StaticPageBackLink({
  className,
  onBack,
  fallbackPath = "/",
}: StaticPageBackLinkProps) {
  const { t } = useMarket();
  const [, setLocation] = useLocation();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    setLocation(fallbackPath);
  }, [onBack, fallbackPath, setLocation]);

  return (
    <button
      type="button"
      onClick={handleBack}
      data-testid="button-static-page-back"
      className={cn(
        "inline-flex items-center gap-2 min-h-10 px-1 -ml-1 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors touch-manipulation",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {t.back}
    </button>
  );
}
