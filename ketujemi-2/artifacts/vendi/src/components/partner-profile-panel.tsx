import { useMemo, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type AuthUser } from "@/lib/auth-context";

type LinkType = "website" | "instagram" | "facebook";

function parseBannerUrls(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [""];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [""];
    const urls = arr.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
    return urls.length > 0 ? [...urls, ""].slice(0, 6) : [""];
  } catch {
    return [""];
  }
}

export function PartnerProfilePanel({ user }: { user: AuthUser }) {
  const { refresh } = useAuth();
  const { toast } = useToast();
  const isActive = user.business_status === "active";
  const isVip = user.business_tier === "vip";
  const [linkType, setLinkType] = useState<LinkType>(
    (user.partner_link_type as LinkType) || "website",
  );
  const [linkUrl, setLinkUrl] = useState(user.partner_link_url ?? "");
  const [bannerUrls, setBannerUrls] = useState<string[]>(() =>
    parseBannerUrls(user.partner_banner_urls),
  );
  const [busy, setBusy] = useState(false);

  const filledBanners = useMemo(
    () => bannerUrls.map((u) => u.trim()).filter((u) => u.length > 0),
    [bannerUrls],
  );

  if (user.account_type !== "business") return null;

  if (user.business_status === "pending") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-900">
        <p className="font-bold">Aplikimi në pritje</p>
        <p className="mt-1 text-amber-800/90">
          Llogaria juaj do të aktivizohet nga administratori pas verifikimit të pagesës. Pastaj mund
          të shtoni linkun dhe (për VIP) bannerët lëvizës.
        </p>
      </div>
    );
  }

  if (user.business_status === "blocked") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        <p className="font-bold">Llogaria e bllokuar</p>
        <p className="mt-1">Kontaktoni administratorin për më shumë informacion.</p>
      </div>
    );
  }

  if (!isActive) return null;

  async function savePartnerSettings() {
    if (!linkUrl.trim()) {
      toast({ title: "Shtoni një link (website, Instagram ose Facebook)", variant: "destructive" });
      return;
    }
    if (isVip && filledBanners.length > 5) {
      toast({ title: "Maksimumi 5 foto për bannerin VIP", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          partner_link: { type: linkType, url: linkUrl.trim() },
          ...(isVip ? { partner_banner_urls: filledBanners.slice(0, 5) } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { message?: string }).message ?? (data as { error?: string }).error ?? "Gabim",
          variant: "destructive",
        });
        return;
      }
      await refresh();
      toast({ title: "U ruajt!" });
    } finally {
      setBusy(false);
    }
  }

  function updateBanner(i: number, value: string) {
    setBannerUrls((prev) => {
      const next = [...prev];
      next[i] = value;
      while (next.length < 5 && next[next.length - 1]?.trim()) next.push("");
      return next.slice(0, 5);
    });
  }

  return (
    <div className="rounded-2xl border border-[#1A56A0]/25 bg-blue-50/30 p-5 space-y-4">
      <div>
        <h2 className="font-bold text-gray-900">Profili partner</h2>
        <p className="text-sm text-gray-600 mt-1">
          Një link i vetëm — hapet kur vizitorët klikojnë logon ose bannerin tuaj.
        </p>
        {user.partner_activation_code ? (
          <p className="mt-2 text-sm font-mono bg-white/80 border border-blue-100 rounded-lg px-3 py-2">
            Kodi i aktivizimit: <strong>{user.partner_activation_code}</strong>
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Lloji i linkut</Label>
        <Select value={linkType} onValueChange={(v) => setLinkType(v as LinkType)}>
          <SelectTrigger className="bg-white min-h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="partner-link-url">Linku</Label>
        <Input
          id="partner-link-url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder={
            linkType === "website"
              ? "https://kompaniajuaj.com"
              : linkType === "instagram"
                ? "https://instagram.com/emri ose @emri"
                : "https://facebook.com/faqja"
          }
          className="min-h-12 bg-white"
        />
      </div>

      {isVip ? (
        <div className="space-y-3 pt-2 border-t border-amber-200/60">
          <div className="flex items-center gap-2 text-amber-800">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
            <span className="text-sm font-bold">Banner lëvizës VIP (deri në 5 foto)</span>
          </div>
          {bannerUrls.map((url, i) =>
            i < 5 ? (
              <div key={i} className="space-y-1">
                <Label htmlFor={`banner-${i}`}>Foto {i + 1}</Label>
                <Input
                  id={`banner-${i}`}
                  type="url"
                  value={url}
                  onChange={(e) => updateBanner(i, e.target.value)}
                  placeholder="https://"
                  className="min-h-11 bg-white"
                />
              </div>
            ) : null,
          )}
          <p className="text-xs text-gray-500">
            Nëse shtoni foto këtu, banneri lëvizës shfaqet në vend të logos së vetme.
          </p>
        </div>
      ) : null}

      <Button
        type="button"
        className="w-full min-h-12 bg-[#1A56A0] hover:bg-[#154a8c]"
        disabled={busy}
        onClick={() => void savePartnerSettings()}
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Ruaj profilin partner"}
      </Button>
    </div>
  );
}
