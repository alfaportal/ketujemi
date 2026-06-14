import { AuthToolbar } from "@/components/auth-toolbar";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import { useMarket } from "@/lib/market-context";
import { cnPrimaryBlue } from "@/lib/primary-button-classes";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Phone row 2: Hyr + Posto Falas as grid cells (parent must be grid-cols-3). */
  mobileBar?: boolean;
  /** Classic home header — taller buttons; fragment layout for grid-cols-3 parent. */
  largeTouch?: boolean;
};

const mobileBtnDense =
  "w-full min-w-0 justify-center px-2 text-xs font-bold max-md:min-h-9";
const mobileBtnLarge =
  "w-full min-w-0 justify-center px-2.5 text-sm font-bold max-md:min-h-12";

/** Shared header actions: blue login + compact “Posto Falas” (all pages). */
export function SiteHeaderToolbar({ className, mobileBar, largeTouch }: Props) {
  const goToPostListing = useGoToPostListing();
  const { t } = useMarket();

  if (mobileBar) {
    const mobileBtn = largeTouch ? mobileBtnLarge : mobileBtnDense;
    const authBtnCls = largeTouch
      ? "[&_button]:w-full [&_button]:min-h-12 [&_button]:justify-center max-md:[&_button]:text-sm"
      : "[&_button]:w-full [&_button]:min-h-9 [&_button]:justify-center max-md:[&_button]:text-xs";

    const cells = (
      <>
        <AuthToolbar variant="compact" className={cn(mobileBtn, authBtnCls)} />
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

    if (largeTouch) {
      return <>{cells}</>;
    }

    return (
      <div className={cn("grid grid-cols-2 items-stretch gap-2 min-w-0", className)}>
        {cells}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 shrink-0", className)}>
      <AuthToolbar variant="compact" />
      <button
        type="button"
        data-testid="button-new-listing"
        onClick={goToPostListing}
        className={cnPrimaryBlue("font-bold shrink-0 whitespace-nowrap")}
      >
        {t.postFree}
      </button>
    </div>
  );
}
