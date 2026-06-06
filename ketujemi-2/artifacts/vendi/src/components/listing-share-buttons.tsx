import { useCallback, useMemo } from "react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { Link2 } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  url: string;
  variant?: "full" | "compact";
};

export function listingPublicUrl(listingId: number): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/listings/${listingId}`;
  }
  return `https://ketujemi.com/listings/${listingId}`;
}

export function ListingShareButtons({ title, url, variant = "full" }: Props) {
  const { t } = useMarket();
  const { toast } = useToast();
  const tx = t as Record<string, string | undefined>;

  const facebookHref = useMemo(
    () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    [url],
  );

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }, [url]);

  const onCopyLink = useCallback(() => {
    void copyToClipboard().then((ok) => {
      if (ok) {
        toast({ title: tx.share_copied ?? "Linku u kopjua! ✓" });
      }
    });
  }, [copyToClipboard, toast, tx.share_copied]);

  const onInstagramShare = useCallback(() => {
    void copyToClipboard();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    toast({
      title: tx.share_toastInstagram
        ?? "Kopjo linkun dhe ngarkoje te historia ose postimi yt në Instagram 📲",
    });
  }, [copyToClipboard, toast, tx.share_toastInstagram]);

  const onTiktokShare = useCallback(() => {
    void copyToClipboard();
    window.open("https://www.tiktok.com/", "_blank", "noopener,noreferrer");
    toast({
      title: tx.share_toastTiktok
        ?? "Kopjo linkun dhe ngarkoje te historia ose postimi yt në TikTok 📲",
    });
  }, [copyToClipboard, toast, tx.share_toastTiktok]);

  if (!url) return null;

  const facebookLabel = tx.share_facebook ?? "📘 Shpërndaje në Facebook";
  const instagramLabel = tx.share_instagram ?? "📸 Shpërndaje në Instagram";
  const tiktokLabel = tx.share_tiktok ?? "🎵 Shpërndaje në TikTok";
  const copyLinkLabel = tx.share_copyLink ?? "🔗 Kopjo Linkun";

  if (variant === "compact") {
    const compactBtn =
      "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors touch-manipulation";
    return (
      <div className="flex flex-wrap items-center gap-1.5" data-testid="listing-share-buttons-compact">
        <a
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(compactBtn, "border-[#1877F2]/30 bg-[#1877F2]/5 text-[#1877F2] hover:bg-[#1877F2]/10")}
          title={facebookLabel}
          aria-label={facebookLabel}
          data-testid="share-facebook"
        >
          <FaFacebook className="h-4 w-4" aria-hidden />
        </a>
        <button
          type="button"
          onClick={onInstagramShare}
          className={cn(
            compactBtn,
            "border-pink-300/50 bg-gradient-to-r from-[#fdf497]/20 via-[#fd5949]/10 to-[#d6249f]/10 text-[#C13584]",
          )}
          title={instagramLabel}
          aria-label={instagramLabel}
          data-testid="share-instagram"
        >
          <FaInstagram className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onTiktokShare}
          className={cn(compactBtn, "border-gray-800/20 bg-gray-900/5 text-gray-900 hover:bg-gray-900/10")}
          title={tiktokLabel}
          aria-label={tiktokLabel}
          data-testid="share-tiktok"
        >
          <FaTiktok className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onCopyLink}
          className={cn(compactBtn, "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100")}
          title={copyLinkLabel}
          aria-label={copyLinkLabel}
          data-testid="share-copy-link"
        >
          <Link2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  const fullBtn =
    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1" data-testid="listing-share-buttons">
      <a
        href={facebookHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(fullBtn, "border-[#1877F2]/30 bg-[#1877F2]/5 text-[#1877F2] hover:bg-[#1877F2]/10")}
        data-testid="share-facebook"
      >
        {facebookLabel}
      </a>
      <button
        type="button"
        onClick={onInstagramShare}
        className={cn(
          fullBtn,
          "border-pink-300/50 bg-gradient-to-r from-[#fdf497]/20 via-[#fd5949]/10 to-[#d6249f]/10 text-[#C13584] hover:from-[#fdf497]/30 hover:via-[#fd5949]/15 hover:to-[#d6249f]/15",
        )}
        data-testid="share-instagram"
      >
        {instagramLabel}
      </button>
      <button
        type="button"
        onClick={onTiktokShare}
        className={cn(fullBtn, "border-gray-800/20 bg-gray-900/5 text-gray-900 hover:bg-gray-900/10")}
        data-testid="share-tiktok"
      >
        {tiktokLabel}
      </button>
      <button
        type="button"
        onClick={onCopyLink}
        className={cn(fullBtn, "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100")}
        data-testid="share-copy-link"
      >
        {copyLinkLabel}
      </button>
    </div>
  );
}
