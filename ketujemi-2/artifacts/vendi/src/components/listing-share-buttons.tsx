import { useCallback, useMemo, useState } from "react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Link2 } from "lucide-react";
import { useMarket } from "@/lib/market-context";

type Props = {
  title: string;
  url: string;
};

export function ListingShareButtons({ title, url }: Props) {
  const { t } = useMarket();
  const [copied, setCopied] = useState(false);
  const copyLinkLabel = (t as { share_copyLink?: string }).share_copyLink ?? "Kopjo linkun";
  const copiedLabel = (t as { share_copied?: string }).share_copied ?? "U kopjua!";

  const facebookHref = useMemo(
    () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    [url],
  );

  const whatsappHref = useMemo(
    () => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    [title, url],
  );

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [url]);

  if (!url) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1" data-testid="listing-share-buttons">
      <a
        href={facebookHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#1877F2]/30 bg-[#1877F2]/5 px-3 py-2 text-xs font-semibold text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors"
        data-testid="share-facebook"
      >
        <FaFacebook className="h-4 w-4 shrink-0" aria-hidden />
        Facebook
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-500/10 transition-colors"
        data-testid="share-whatsapp"
      >
        <FaWhatsapp className="h-4 w-4 shrink-0" aria-hidden />
        WhatsApp
      </a>
      <a
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-pink-300/50 bg-gradient-to-r from-[#fdf497]/20 via-[#fd5949]/10 to-[#d6249f]/10 px-3 py-2 text-xs font-semibold text-[#C13584] hover:from-[#fdf497]/30 hover:via-[#fd5949]/15 hover:to-[#d6249f]/15 transition-colors"
        data-testid="share-instagram"
        title="Instagram does not support direct link sharing — open Instagram to post manually"
      >
        <FaInstagram className="h-4 w-4 shrink-0" aria-hidden />
        Instagram
      </a>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        data-testid="share-copy-link"
      >
        <Link2 className="h-4 w-4 shrink-0" aria-hidden />
        {copyLinkLabel}
      </button>
      {copied ? (
        <span
          className="text-xs font-semibold text-green-600 animate-in fade-in duration-200"
          data-testid="share-copied"
          role="status"
        >
          {copiedLabel}
        </span>
      ) : null}
    </div>
  );
}
