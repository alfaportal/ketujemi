import { X, RotateCcw } from "lucide-react";
import { readListingPostDraft } from "@/lib/listing-post-draft";

type Props = {
  onDismiss: () => void;
  onRestore: () => void;
};

export function ListingPostRecoveryBanner({ onDismiss, onRestore }: Props) {
  const draft = readListingPostDraft();
  const count = draft?.images.length ?? 0;
  const hasVideo = !!draft?.videoUrl;

  if (!draft || (count === 0 && !hasVideo)) return null;

  const label =
    count > 0 && hasVideo
      ? `${count} foto dhe video u rikthyen nga draft-i.`
      : count > 0
        ? `${count} foto u rikthyen nga draft-i.`
        : "Video u rikthye nga draft-i.";

  return (
    <div
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex flex-wrap items-center gap-2 justify-between"
      role="status"
      data-testid="listing-post-recovery-banner"
    >
      <p className="text-sm font-semibold text-emerald-900 flex-1 min-w-[12rem]">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRestore}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Rikthe
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-100"
          aria-label="Mbyll"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
