import { AuthToolbar } from "@/components/auth-toolbar";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import { useMarket } from "@/lib/market-context";
import { cnPrimaryBlue } from "@/lib/primary-button-classes";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Phone row 2: Hyr + Posto Falas as grid cells (parent must be grid-cols-3). */
  mobileBar?: boolean;
};

const mobileBtn =
  "w-full min-w-0 justify-center px-2.5 text-sm font-bold max-md:min-h-12";

/** Shared header actions: blue login + compact “Posto Falas” (all pages). */
export function SiteHeaderToolbar({ className, mobileBar }: Props) {
  const goToPostListing = useGoToPostListing();
  const { t } = useMarket();

  if (mobileBar) {
    return (
      <>
        <AuthToolbar
          variant="compact"
          className={cn(mobileBtn, "[&_button]:w-full [&_button]:min-h-12 [&_button]:justify-center max-md:[&_button]:text-sm")}
        />
        <button
          type="button"
          data-testid="button-new-listing"
          onClick={goToPostListing}
          className={cnPrimaryBlue(mobileBtn)}
        >
          {t.postFree}
        </button>
      </>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 shrink-0", className)}>
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
