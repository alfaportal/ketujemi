import { useCallback } from "react";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { Link2, Share2 } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { openFacebookShareDialog, listingPublicUrl } from "@/lib/social-share";

type Props = {
  url: string;
  title?: string;
  variant?: "inline" | "compact" | "full";
};

const GREEN_TOAST_CLASS = "border-green-200 bg-green-50 text-green-900";

export { listingPublicUrl };

function whatsAppShareUrl(title: string, url: string): string {
  const text = title.trim() ? `${title.trim()} ${url}` : url;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function ListingShareButtons({ url, title = "", variant = "full" }: Props) {
  const { t } = useMarket();
  const { toast } = useToast();
  const tx = t as Record<string, string>;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }, [url]);

  const onFacebookShare = useCallback(() => {
    openFacebookShareDialog(url, title);
  }, [url, title]);

  const onWhatsAppShare = useCallback(() => {
    window.open(whatsAppShareUrl(title, url), "_blank", "noopener,noreferrer");
  }, [title, url]);

  const onCopyLink = useCallback(() => {
    void copyToClipboard().then((ok) => {
      if (ok) {
        toast({
          title: tx.share_copied,
          className: GREEN_TOAST_CLASS,
        });
      }
    });
  }, [copyToClipboard, toast, tx.share_copied]);

  if (!url) return null;

  const facebookLabel = tx.share_facebook;
  const whatsappLabel = tx.share_whatsapp;
  const instagramLabel = tx.share_instagram;
  const tiktokLabel = tx.share_tiktok;
  const copyLinkLabel = tx.share_copyLink;
  const instagramTooltip = tx.share_instagramCopyTooltip;
  const tiktokTooltip = tx.share_tiktokCopyTooltip;
  const compactLabel = tx.share_compactLabel;

  const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors touch-manipulation";
  const labeledBtn =
    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors touch-manipulation";

  const buttons = (
    <>
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
        onClick={onWhatsAppShare}
        className={cn(iconBtn, "border-[#25D366]/30 bg-[#25D366]/5 text-[#25D366] hover:bg-[#25D366]/10")}
        title={whatsappLabel}
        aria-label={whatsappLabel}
        data-testid="share-whatsapp"
      >
        <FaWhatsapp className="h-3.5 w-3.5" aria-hidden />
      </button>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onCopyLink}
            className={cn(
              iconBtn,
              "border-[#E4405F]/25 bg-gradient-to-br from-[#F58529]/10 via-[#DD2A7B]/10 to-[#8134AF]/10 text-[#C13584] hover:from-[#F58529]/20 hover:via-[#DD2A7B]/20 hover:to-[#8134AF]/20",
            )}
            aria-label={copyLinkLabel}
            data-testid="share-instagram-copy"
          >
            <FaInstagram className="h-3.5 w-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{instagramTooltip}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onCopyLink}
            className={cn(iconBtn, "border-gray-800/20 bg-gray-900/5 text-gray-900 hover:bg-gray-900/10")}
            aria-label={copyLinkLabel}
            data-testid="share-tiktok-copy"
          >
            <FaTiktok className="h-3.5 w-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{tiktokTooltip}</TooltipContent>
      </Tooltip>
    </>
  );

  if (variant === "inline" || variant === "compact") {
    return (
      <TooltipProvider delayDuration={200}>
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5",
            variant === "inline" && "mt-3 pt-3 border-t border-gray-100",
          )}
          data-testid={variant === "inline" ? "listing-share-buttons-inline" : "listing-share-buttons-compact"}
        >
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 mr-0.5">
            <Share2 className="h-3.5 w-3.5" aria-hidden />
            {compactLabel}
          </span>
          {buttons}
        </div>
      </TooltipProvider>
    );
  }

  const sectionTitle = tx.share_sectionTitle;
  const motivation = tx.share_motivation;

  return (
    <TooltipProvider delayDuration={200}>
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
            className={cn(
              labeledBtn,
              "border-[#1877F2]/30 bg-[#1877F2]/5 text-[#1877F2] hover:bg-[#1877F2]/10",
            )}
            data-testid="share-facebook"
          >
            <FaFacebook className="h-3.5 w-3.5" aria-hidden />
            {facebookLabel}
          </button>
          <button
            type="button"
            onClick={onWhatsAppShare}
            className={cn(
              labeledBtn,
              "border-[#25D366]/30 bg-[#25D366]/5 text-[#25D366] hover:bg-[#25D366]/10",
            )}
            data-testid="share-whatsapp"
          >
            <FaWhatsapp className="h-3.5 w-3.5" aria-hidden />
            {whatsappLabel}
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCopyLink}
                className={cn(
                  labeledBtn,
                  "border-[#E4405F]/25 bg-[#E4405F]/5 text-[#C13584] hover:bg-[#E4405F]/10",
                )}
                data-testid="share-instagram-copy"
              >
                <FaInstagram className="h-3.5 w-3.5" aria-hidden />
                <Link2 className="h-3 w-3 opacity-70" aria-hidden />
                {instagramLabel}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{instagramTooltip}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCopyLink}
                className={cn(labeledBtn, "border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100")}
                data-testid="share-tiktok-copy"
              >
                <FaTiktok className="h-3.5 w-3.5" aria-hidden />
                <Link2 className="h-3 w-3 opacity-70" aria-hidden />
                {tiktokLabel}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{tiktokTooltip}</TooltipContent>
          </Tooltip>
        </div>
      </section>
    </TooltipProvider>
  );
}
