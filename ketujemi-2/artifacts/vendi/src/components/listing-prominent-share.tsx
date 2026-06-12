import { useCallback, useState } from "react";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { Link2, Share2 } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  title?: string;
  /** Post-success headline: "Shpallja u postua! Shpërndale tani:" */
  postSuccess?: boolean;
};

function whatsAppShareUrl(title: string, url: string): string {
  const text = title.trim() ? `${title.trim()} ${url}` : url;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function facebookShareUrl(url: string, title: string): string {
  const base = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  if (!title.trim()) return base;
  return `${base}&quote=${encodeURIComponent(title.trim())}`;
}

export function ListingProminentShare({ url, title = "", postSuccess = false }: Props) {
  const { t } = useMarket();
  const tx = t as Record<string, string>;
  const [copied, setCopied] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const copyUrl = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }, [url]);

  const showAlert = useCallback((message: string) => {
    setAlertMsg(message);
    window.setTimeout(() => setAlertMsg(null), 4000);
  }, []);

  const onFacebookShare = useCallback(() => {
    window.open(
      facebookShareUrl(url, title),
      "facebook-share",
      "noopener,noreferrer,width=600,height=400",
    );
  }, [url, title]);

  const onWhatsAppShare = useCallback(() => {
    window.open(whatsAppShareUrl(title, url), "_blank", "noopener,noreferrer");
  }, [title, url]);

  const onInstagramShare = useCallback(() => {
    void copyUrl().then((ok) => {
      if (!ok) return;
      showAlert(tx.share_instagramCopiedAlert);
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    });
  }, [copyUrl, showAlert, tx.share_instagramCopiedAlert]);

  const onTikTokShare = useCallback(() => {
    void copyUrl().then((ok) => {
      if (!ok) return;
      showAlert(tx.share_tiktokCopiedAlert);
      window.open("https://www.tiktok.com/", "_blank", "noopener,noreferrer");
    });
  }, [copyUrl, showAlert, tx.share_tiktokCopiedAlert]);

  const onCopyLink = useCallback(() => {
    void copyUrl().then((ok) => {
      if (!ok) return;
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }, [copyUrl]);

  if (!url) return null;

  const sectionTitle = postSuccess ? tx.share_postSuccessTitle : tx.share_sectionTitle;
  const facebookLabel = tx.share_facebookProminent;
  const whatsappLabel = tx.share_whatsappProminent;
  const instagramLabel = tx.share_instagramProminent;
  const tiktokLabel = tx.share_tiktokProminent;
  const copyLabel = copied ? tx.share_linkCopied : tx.share_copyLinkProminent;

  const btnClass =
    "w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-bold transition-all touch-manipulation shadow-sm hover:shadow-md active:scale-[0.98]";

  return (
    <section
      className={cn(
        "rounded-2xl border-2 p-5 sm:p-6 shadow-lg",
        postSuccess
          ? "border-emerald-300/80 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50"
          : "border-blue-200/80 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50",
      )}
      data-testid={postSuccess ? "listing-share-post-success" : "listing-prominent-share"}
    >
      <div className="flex items-start gap-2.5 mb-4">
        <Share2
          className={cn("h-6 w-6 shrink-0 mt-0.5", postSuccess ? "text-emerald-600" : "text-blue-600")}
          aria-hidden
        />
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">{sectionTitle}</h2>
          {!postSuccess && tx.share_motivation ? (
            <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{tx.share_motivation}</p>
          ) : null}
        </div>
      </div>

      {alertMsg ? (
        <p
          role="alert"
          className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
          data-testid="share-prominent-alert"
        >
          {alertMsg}
        </p>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <button
          type="button"
          onClick={onFacebookShare}
          className={cn(btnClass, "bg-[#1877F2] text-white hover:bg-[#166FE5]")}
          data-testid="share-prominent-facebook"
        >
          <FaFacebook className="h-5 w-5" aria-hidden />
          {facebookLabel}
        </button>
        <button
          type="button"
          onClick={onWhatsAppShare}
          className={cn(btnClass, "bg-[#25D366] text-white hover:bg-[#20BD5A]")}
          data-testid="share-prominent-whatsapp"
        >
          <FaWhatsapp className="h-5 w-5" aria-hidden />
          {whatsappLabel}
        </button>
        <button
          type="button"
          onClick={onInstagramShare}
          className={cn(
            btnClass,
            "text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90",
          )}
          data-testid="share-prominent-instagram"
        >
          <FaInstagram className="h-5 w-5" aria-hidden />
          {instagramLabel}
        </button>
        <button
          type="button"
          onClick={onTikTokShare}
          className={cn(btnClass, "bg-black text-white hover:bg-gray-900")}
          data-testid="share-prominent-tiktok"
        >
          <FaTiktok className="h-5 w-5" aria-hidden />
          {tiktokLabel}
        </button>
        <button
          type="button"
          onClick={onCopyLink}
          className={cn(
            btnClass,
            copied
              ? "bg-emerald-600 text-white hover:bg-emerald-600"
              : "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
          )}
          data-testid="share-prominent-copy"
        >
          <Link2 className="h-5 w-5" aria-hidden />
          {copyLabel}
        </button>
      </div>
    </section>
  );
}
