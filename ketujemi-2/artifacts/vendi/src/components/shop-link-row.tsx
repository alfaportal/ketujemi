import { useCallback, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  copyTextToClipboard,
  normalizeShopSlug,
  shopPublicAbsoluteUrl,
  shopPublicPath,
} from "@/lib/shop-public-url";

type Props = {
  shopName?: string;
  slug?: string | null;
  shopId?: number | null;
  publicPath?: string | null;
  className?: string;
};

const GREEN_TOAST = "border-green-200 bg-green-50 text-green-900";

/** Një rresht i thjeshtë: linku + Kopjo (si POS). */
export function ShopLinkRow({ shopName, slug, shopId, publicPath, className }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const effectiveSlug = useMemo(() => {
    const s = slug?.trim();
    if (s) return s;
    if (shopName?.trim()) return normalizeShopSlug(shopName);
    return "";
  }, [slug, shopName]);

  const path = useMemo(
    () =>
      shopPublicPath({
        slug: effectiveSlug || null,
        shopId,
        publicPath,
      }),
    [effectiveSlug, shopId, publicPath],
  );

  const absoluteUrl = useMemo(() => (path ? shopPublicAbsoluteUrl(path) : ""), [path]);

  const onCopy = useCallback(async () => {
    if (!absoluteUrl) return;
    const ok = await copyTextToClipboard(absoluteUrl);
    if (ok) {
      setCopied(true);
      toast({ title: "Linku u kopjua — dërgoje te dyqani", className: GREEN_TOAST });
      window.setTimeout(() => setCopied(false), 2500);
    }
  }, [absoluteUrl, toast]);

  if (!absoluteUrl) {
    return (
      <div className={className}>
        <Label>Linku i dyqanit</Label>
        <p className="text-xs text-gray-500 mt-1">Shkruani emrin e dyqanit — linku krijohet automatikisht.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Label>Linku i dyqanit — kopjo &amp; dërgo</Label>
      <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
        <Input
          readOnly
          value={absoluteUrl}
          className="min-h-11 font-mono text-xs sm:text-sm bg-green-50 border-green-300 text-green-950 flex-1"
          onFocus={(e) => e.target.select()}
        />
        <Button type="button" className="min-h-11 shrink-0 font-semibold" onClick={() => void onCopy()}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "U kopjua!" : "Kopjo linkun"}
        </Button>
        <Button type="button" variant="outline" className="min-h-11 shrink-0 border-green-300 text-green-800" asChild>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              shopName?.trim() ? `Shiko webfaqen e ${shopName.trim()}: ${absoluteUrl}` : absoluteUrl,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}

export function shopLinkFromParts(input: {
  shopName?: string;
  slug?: string | null;
  shopId?: number | null;
  publicPath?: string | null;
}): string {
  const slug = input.slug?.trim() || (input.shopName?.trim() ? normalizeShopSlug(input.shopName) : "");
  const path = shopPublicPath({ slug: slug || null, shopId: input.shopId, publicPath: input.publicPath });
  return path ? shopPublicAbsoluteUrl(path) : "";
}
