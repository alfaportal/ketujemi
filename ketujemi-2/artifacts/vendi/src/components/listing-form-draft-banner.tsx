import { useState } from "react";
import { RotateCcw, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/lib/market-context";
import {
  clearListingFormDraft,
  type ListingFormDraft,
} from "@/lib/listing-form-draft";

type Props = {
  pathname: string;
  restored: boolean;
  onRestore: () => void;
  onDismiss: () => void;
};

export function ListingFormDraftBanner({ pathname, restored, onRestore, onDismiss }: Props) {
  const { t } = useMarket();
  const tx = t as Record<string, string | undefined>;
  const [hidden, setHidden] = useState(false);

  if (hidden && !restored) return null;

  const title = restored
    ? tx.ui_listingDraftRestored ?? "Të dhënat u rikthyen automatikisht."
    : tx.ui_listingDraftSaved ?? "Drafti ruhet automatikisht ndërsa plotësoni formën.";

  const hint =
    tx.ui_listingDraftRestoredHint ??
    "Nëse faqja rifreskohet, të dhënat dhe fotot mbeten të ruajtura.";

  return (
    <div
      role="status"
      className="sticky top-0 z-40 border-b border-amber-200 bg-amber-50 px-4 py-2.5 shadow-sm"
      data-testid="listing-draft-banner"
    >
      <div className="max-w-2xl mx-auto flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-amber-950 leading-snug">{title}</p>
          <p className="text-xs text-amber-900/80 mt-0.5 leading-snug">{hint}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!restored ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-amber-300 bg-white hover:bg-amber-100"
              onClick={() => {
                onRestore();
                setHidden(false);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              {tx.ui_listingDraftRestoreBtn ?? "Rikthe"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-amber-800 hover:bg-amber-100"
            aria-label={tx.ui_listingDraftDismiss ?? "Mbyll"}
            onClick={() => {
              setHidden(true);
              onDismiss();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function applyListingFormDraft(
  draft: ListingFormDraft,
  apply: {
    resetForm: (values: Partial<ListingFormDraft["form"]>) => void;
    setImageUrls: (urls: string[]) => void;
    setVideoUrl: (url: string | null) => void;
    setListingCountry: (code: ListingFormDraft["listingCountry"]) => void;
    markImagesAnalyzed?: () => void;
  },
): void {
  apply.resetForm(draft.form);
  if (draft.imageUrls.length > 0) {
    apply.setImageUrls(draft.imageUrls);
    apply.markImagesAnalyzed?.();
  }
  if (draft.videoUrl) apply.setVideoUrl(draft.videoUrl);
  if (draft.listingCountry) apply.setListingCountry(draft.listingCountry);
}

export function discardListingFormDraft(pathname: string): void {
  clearListingFormDraft(pathname);
}
