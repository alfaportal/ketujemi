import { useCallback, useState } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { Share2, Link2, ExternalLink } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";
import { BRAND_BLUE, BRAND_ORANGE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  url: string;
  fbPosted: boolean;
  igPosted: boolean;
  title?: string;
};

const GREEN_TOAST_CLASS = "border-green-200 bg-green-50 text-green-900";

export function ListingSocialPostedShare({ url, fbPosted, igPosted, title }: Props) {
  const { t } = useMarket();
  const { toast } = useToast();
  const tx = t as Record<string, string>;
  const [igDialogOpen, setIgDialogOpen] = useState(false);

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
      "facebook-share",
      "noopener,noreferrer,width=600,height=400",
    );
  }, [url]);

  const onInstagramShareClick = useCallback(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      void navigator
        .share({
          title: title?.trim() || "KetuJemi",
          text: title?.trim() || undefined,
          url,
        })
        .catch(() => setIgDialogOpen(true));
      return;
    }
    setIgDialogOpen(true);
  }, [title, url]);

  const onCopyForInstagram = useCallback(() => {
    void copyToClipboard().then((ok) => {
      if (ok) {
        toast({
          title: tx.share_socialPostedIgCopied,
          className: GREEN_TOAST_CLASS,
        });
      }
    });
  }, [copyToClipboard, toast, tx.share_socialPostedIgCopied]);

  if (!url || (!fbPosted && !igPosted)) return null;

  const sectionTitle = tx.share_socialPostedTitle;
  const sectionHint = tx.share_socialPostedHint;
  const facebookLabel = tx.share_facebook;
  const instagramLabel = tx.share_instagram;
  const igDialogTitle = tx.share_socialPostedIgDialogTitle;
  const igDialogBody = tx.share_socialPostedIgDialogBody;
  const copyLinkLabel = tx.share_copyLink;
  const openInstagramLabel = tx.share_socialPostedOpenInstagram;

  const btnClass =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors touch-manipulation shadow-sm";

  return (
    <>
      <section
        className="rounded-2xl border border-gray-100 bg-white p-5 overflow-hidden shadow-sm"
        data-testid="listing-social-posted-share"
      >
        <div
          className="mb-3 h-1 rounded-full"
          style={{ background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})` }}
          aria-hidden
        />
        <div className="flex items-start gap-2 mb-2">
          <Share2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: BRAND_BLUE }} aria-hidden />
          <h2 className="font-bold text-gray-900">{sectionTitle}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{sectionHint}</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {fbPosted ? (
            <button
              type="button"
              onClick={onFacebookShare}
              className={cn(btnClass, "text-white hover:opacity-90")}
              style={{ backgroundColor: BRAND_BLUE }}
              data-testid="share-posted-facebook"
            >
              <FaFacebook className="h-4 w-4" aria-hidden />
              {facebookLabel}
            </button>
          ) : null}
          {igPosted ? (
            <button
              type="button"
              onClick={onInstagramShareClick}
              className={cn(btnClass, "text-white hover:opacity-90")}
              style={{ backgroundColor: BRAND_ORANGE }}
              data-testid="share-posted-instagram"
            >
              <FaInstagram className="h-4 w-4" aria-hidden />
              {instagramLabel}
            </button>
          ) : null}
        </div>
      </section>

      <Dialog open={igDialogOpen} onOpenChange={setIgDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FaInstagram className="h-5 w-5" style={{ color: BRAND_ORANGE }} aria-hidden />
              {igDialogTitle}
            </DialogTitle>
            <DialogDescription className="text-left pt-1 leading-relaxed">
              {igDialogBody}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-2 font-semibold"
              onClick={onCopyForInstagram}
              data-testid="share-posted-ig-copy"
            >
              <Link2 className="h-4 w-4" aria-hidden />
              {copyLinkLabel}
            </Button>
            <Button
              type="button"
              className="w-full justify-center gap-2 font-semibold text-white"
              style={{ backgroundColor: BRAND_ORANGE }}
              onClick={() => {
                window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
              }}
              data-testid="share-posted-ig-open"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              {openInstagramLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
