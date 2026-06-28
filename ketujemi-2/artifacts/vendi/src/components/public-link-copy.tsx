import { useCallback, useMemo, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { copyTextToClipboard, shopPublicAbsoluteUrl } from "@/lib/shop-public-url";

type Props = {
  /** Path (/dyqani/x) or full https URL */
  href: string;
  /** WhatsApp share label prefix */
  shareTitle?: string;
  className?: string;
  variant?: "bar" | "inline";
};

const GREEN_TOAST_CLASS = "border-green-200 bg-green-50 text-green-900";

function resolvePath(href: string): { path: string; absoluteUrl: string } {
  const trimmed = href.trim();
  if (!trimmed) return { path: "", absoluteUrl: "" };
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      return { path: `${u.pathname}${u.search}`, absoluteUrl: trimmed };
    } catch {
      return { path: trimmed, absoluteUrl: shopPublicAbsoluteUrl(trimmed) };
    }
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return { path, absoluteUrl: shopPublicAbsoluteUrl(path) };
}

function whatsAppShareHref(url: string, shareTitle?: string): string {
  const text = shareTitle?.trim() ? `${shareTitle.trim()}: ${url}` : url;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function PublicLinkCopy({
  href,
  shareTitle,
  className,
  variant = "bar",
}: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { path, absoluteUrl } = useMemo(() => resolvePath(href), [href]);

  const onCopy = useCallback(async () => {
    if (!absoluteUrl) return;
    const ok = await copyTextToClipboard(absoluteUrl);
    if (ok) {
      setCopied(true);
      toast({ title: "Linku u kopjua", className: GREEN_TOAST_CLASS });
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: "Nuk u kopjua linku",
        variant: "destructive",
      });
    }
  }, [absoluteUrl, toast]);

  if (!path || !absoluteUrl) return null;

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <a
          href={path}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-600 underline font-semibold truncate max-w-[min(100%,14rem)]"
        >
          {path}
        </a>
        <button
          type="button"
          onClick={() => void onCopy()}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 min-h-9"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          {copied ? "U kopjua" : "Kopjo"}
        </button>
        <a
          href={whatsAppShareHref(absoluteUrl, shareTitle)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-green-200 bg-green-50 text-xs font-semibold text-green-800 min-h-9"
        >
          WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-blue-200 bg-blue-50/60 p-3 space-y-2", className)}>
      <p className="text-xs font-semibold text-blue-900">Linku (krijohet automatikisht)</p>
      <p className="text-xs text-blue-800 break-all font-mono leading-relaxed">{absoluteUrl}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 min-h-11 bg-white border-blue-200 text-blue-900 font-semibold"
          onClick={() => void onCopy()}
        >
          {copied ? (
            <>
              <Check size={16} className="mr-2 text-green-600" />
              U kopjua!
            </>
          ) : (
            <>
              <Copy size={16} className="mr-2" />
              Kopjo linkun
            </>
          )}
        </Button>
        <Button type="button" variant="outline" className="flex-1 min-h-11 bg-white border-green-200 text-green-900 font-semibold" asChild>
          <a href={whatsAppShareHref(absoluteUrl, shareTitle)} target="_blank" rel="noreferrer">
            Dërgo në WhatsApp
          </a>
        </Button>
        <Button type="button" variant="outline" className="flex-1 min-h-11 bg-white border-blue-200 text-blue-900 font-semibold" asChild>
          <a href={path} target="_blank" rel="noreferrer">
            <ExternalLink size={16} className="mr-2" />
            Hape
          </a>
        </Button>
      </div>
    </div>
  );
}
