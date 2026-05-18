import { AuthToolbar } from "@/components/auth-toolbar";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import { useMarket } from "@/lib/market-context";

type Props = {
  className?: string;
};

/** Shared header actions: blue login + compact “Posto Falas” (all pages). */
export function SiteHeaderToolbar({ className }: Props) {
  const goToPostListing = useGoToPostListing();
  const { t } = useMarket();

  return (
    <div className={`flex items-center gap-2 shrink-0 ${className ?? ""}`}>
      <AuthToolbar variant="compact" />
      <button
        type="button"
        data-testid="button-new-listing"
        onClick={goToPostListing}
        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 min-h-11 touch-manipulation sm:px-5 sm:text-base sm:min-h-12"
      >
        {t.postFree}
      </button>
    </div>
  );
}
