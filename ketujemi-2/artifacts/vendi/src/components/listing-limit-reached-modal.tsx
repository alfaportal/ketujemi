import { X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { useListingLimitCopy } from "@/lib/listing-limit-i18n";

export type ListingLimitReachedDetails = {
  categoryName: string;
  resetDateLabel: string;
  walletBalanceEur: string;
  listingPriceEur: string;
  used: number;
  limit: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAddBalance: () => void;
  details: ListingLimitReachedDetails | null;
};

export function formatQuotaResetLabel(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ListingLimitReachedModal({ open, onClose, onAddBalance, details }: Props) {
  const c = useListingLimitCopy();

  if (!open || !details) return null;

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal
      aria-labelledby="listing-limit-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h2 id="listing-limit-title" className="text-lg font-black text-gray-900">
            {c.title}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label={c.closeAria}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm text-gray-800">
          <p className="leading-relaxed">
            {c.intro}
          </p>
          <p className="text-base font-black text-gray-900">{details.categoryName}</p>

          <dl className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
            <div className="flex justify-between gap-2">
              <dt className="text-gray-600">{c.usedLabel}</dt>
              <dd className="font-bold">
                {details.used} / {details.limit}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-gray-600">{c.resetLabel}</dt>
              <dd className="font-bold text-right">{details.resetDateLabel}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-gray-600">{c.balanceLabel}</dt>
              <dd className="font-bold">€{details.walletBalanceEur}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-gray-600">{c.priceLabel}</dt>
              <dd className="font-bold" style={{ color: BRAND_BLUE }}>
                €{details.listingPriceEur}
                {c.perListing}
              </dd>
            </div>
          </dl>

          <p className="text-gray-600 leading-relaxed">{c.body}</p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              type="button"
              className="flex-1 min-h-12 font-bold gap-2"
              style={{ backgroundColor: BRAND_BLUE }}
              onClick={onAddBalance}
            >
              <Wallet className="h-4 w-4" />
              {c.addBalance}
            </Button>
            <Button type="button" variant="outline" className="flex-1 min-h-12 font-semibold" onClick={onClose}>
              {c.cancel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
