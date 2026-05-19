import { AuthToolbar } from "@/components/auth-toolbar";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import { useMarket } from "@/lib/market-context";
import { cnPrimaryBlue } from "@/lib/primary-button-classes";

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
        className={cnPrimaryBlue("font-bold")}
      >
        {t.postFree}
      </button>
    </div>
  );
}
