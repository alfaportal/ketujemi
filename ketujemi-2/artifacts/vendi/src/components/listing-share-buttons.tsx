import { useCallback } from "react";
import { FaFacebook } from "react-icons/fa";
import { Link2, Share2, Smartphone } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  variant?: "full" | "compact";
  /** @deprecated unused — kept for call-site compatibility */
  title?: string;
};

const GREEN_TOAST_CLASS = "border-green-200 bg-green-50 text-green-900";

export function listingPublicUrl(listingId: number): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/listings/${listingId}`;
  }
  return `https://ketujemi.com/listings/${listingId}`;
}

export function ListingShareButtons({ url, variant = "full" }: Props) {
  const { t } = useMarket();
  const { toast } = useToast();
  const tx = t as Record<string, string | undefined>;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }, [url]);

  const onFacebookShare = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [url]);

  const onCopyLink = useCallback(() => {
    void copyToClipboard().then((ok) => {
      if (ok) {
        toast({
          title: tx.share_copied
            ?? "✓ Linku u kopjua! Ngarkoje në Instagram ose TikTok për më shumë klientë 🚀",
          className: GREEN_TOAST_CLASS,
        });
      }
    });
  }, [copyToClipboard, toast, tx.share_copied]);

  const onSocialAppsShare = useCallback(() => {
    void copyToClipboard().then((ok) => {
      if (ok) {
        toast({
          title: tx.share_toastSocial
            ?? "✓ Linku u kopjua! Hape Instagram ose TikTok dhe ngarkoje te historia ose postimi yt 📲",
        });
      }
    });
  }, [copyToClipboard, toast, tx.share_toastSocial]);

  if (!url) return null;

  const facebookLabel = tx.share_facebook ?? "📘 Facebook";
  const copyLinkLabel = tx.share_copyLink ?? "🔗 Kopjo Linkun";
  const socialAppsLabel = tx.share_socialApps ?? "📲 Instagram / TikTok";
  const compactLabel = tx.share_compactLabel ?? "Shpërndaje";

  const btnClass =
    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors touch-manipulation";

  if (variant === "compact") {
    const iconBtn =
      "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors touch-manipulation";
    return (
      <div className="flex flex-wrap items-center gap-1.5" data-testid="listing-share-buttons-compact">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          {compactLabel}
        </span>
        <button
          type="button"
          onClick={onFacebookShare}
          className={cn(iconBtn, "border-[#1877F2]/30 bg-[#1877F2]/5 text-[#1877F2] hover:bg-[#1877F2]/10")}
          title={facebookLabel}
          aria-label={facebookLabel}
          data-testid="share-facebook"
        >
          <FaFacebook className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onCopyLink}
          className={cn(iconBtn, "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100")}
          title={copyLinkLabel}
          aria-label={copyLinkLabel}
          data-testid="share-copy-link"
        >
          <Link2 className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onSocialAppsShare}
          className={cn(iconBtn, "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100")}
          title={socialAppsLabel}
          aria-label={socialAppsLabel}
          data-testid="share-social-apps"
        >
          <Smartphone className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    );
  }

  const sectionTitle = tx.share_sectionTitle ?? "Shpërndaje këtë shpallje";
  const motivation =
    tx.share_motivation
    ?? "💡 Shpërndaje shpalljen tënde — çdo klik sjell klientë të rinj te dyqani yt falas!";

  return (
    <section
      className="bg-white rounded-2xl border border-gray-100 p-5"
      data-testid="listing-share-section"
    >
      <h2 className="font-bold text-gray-900 mb-2">{sectionTitle}</h2>
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{motivation}</p>
      <div className="flex flex-wrap items-center gap-2" data-testid="listing-share-buttons">
        <button
          type="button"
          onClick={onFacebookShare}
          className={cn(btnClass, "border-[#1877F2]/30 bg-[#1877F2]/5 text-[#1877F2] hover:bg-[#1877F2]/10")}
          data-testid="share-facebook"
        >
          {facebookLabel}
        </button>
        <button
          type="button"
          onClick={onCopyLink}
          className={cn(btnClass, "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100")}
          data-testid="share-copy-link"
        >
          {copyLinkLabel}
        </button>
        <button
          type="button"
          onClick={onSocialAppsShare}
          className={cn(btnClass, "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100")}
          data-testid="share-social-apps"
        >
          {socialAppsLabel}
        </button>
      </div>
    </section>
  );
}
