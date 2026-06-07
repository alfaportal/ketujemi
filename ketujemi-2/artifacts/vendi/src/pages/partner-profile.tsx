import { useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  Building2,
  Crown,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { translateCategory } from "@/lib/category-translations";
import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";
import {
  ShopSocialProfiles,
  type ShopSocialProfileData,
} from "@/components/shop-social-profiles";

type PartnerPublicProfile = {
  id: number;
  business_name: string;
  logo_url: string | null;
  tier: "vip" | "standard";
  category_name: string | null;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
  shop_id: number | null;
  social_profiles?: Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>;
};

type SocialLink = {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

function buildSocialLinks(
  profile: PartnerPublicProfile,
  skipKeys: Set<string> = new Set(),
): SocialLink[] {
  const links: SocialLink[] = [];
  if (profile.facebook_url) {
    links.push({
      key: "facebook",
      label: "Facebook",
      href: profile.facebook_url,
      icon: Facebook,
      className: "bg-[#1877F2] hover:bg-[#166fe5] text-white",
    });
  }
  if (profile.instagram_url && !skipKeys.has("instagram")) {
    links.push({
      key: "instagram",
      label: "Instagram",
      href: profile.instagram_url,
      icon: Instagram,
      className: "bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95 text-white",
    });
  }
  if (profile.whatsapp_url) {
    links.push({
      key: "whatsapp",
      label: "WhatsApp",
      href: profile.whatsapp_url,
      icon: MessageCircle,
      className: "bg-[#25D366] hover:bg-[#20bd5a] text-white",
    });
  }
  if (profile.tiktok_url && !skipKeys.has("tiktok")) {
    links.push({
      key: "tiktok",
      label: "TikTok",
      href: profile.tiktok_url,
      icon: TikTokIcon,
      className: "bg-black hover:bg-gray-900 text-white",
    });
  }
  if (profile.website_url) {
    links.push({
      key: "website",
      label: "Website",
      href: profile.website_url,
      icon: Globe,
      className: "bg-[#1A56A0] hover:bg-[#154a8c] text-white",
    });
  }
  return links;
}

export default function PartnerProfilePage() {
  const [, params] = useRoute("/partners/:id");
  const { uiLang } = useMarket();
  const id = Number(params?.id);

  const [profile, setProfile] = useState<PartnerPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id) || id === 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    void fetchWithTimeout(`/api/partners/profile/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not_found");
        return r.json() as Promise<{ profile: PartnerPublicProfile }>;
      })
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
      })
      .catch(() => {
        if (cancelled) return;
        setNotFound(true);
        setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (profile?.business_name) {
      document.title = `${profile.business_name} — KetuJemi.com`;
    }
  }, [profile?.business_name]);

  const isVip = profile?.tier === "vip";
  const enrichedSocial = profile?.social_profiles ?? {};
  const skipSocial = new Set(
    (["instagram", "tiktok"] as const).filter((p) => enrichedSocial[p]),
  );
  const socialLinks = profile ? buildSocialLinks(profile, skipSocial) : [];
  const categoryLabel = profile?.category_name
    ? translateCategory(profile.category_name, uiLang)
    : null;

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      <SiteHeader />
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kthehu
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : notFound || !profile ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="font-bold text-gray-900">Partneri nuk u gjet</p>
            <p className="mt-2 text-sm text-gray-600">Ky profil nuk është i disponueshëm.</p>
          </div>
        ) : (
          <article
            className={cn(
              "rounded-3xl bg-white shadow-[0_12px_40px_rgba(26,86,160,0.08)] overflow-hidden",
              isVip
                ? "border-4 border-amber-400 ring-2 ring-amber-200/80"
                : "border-4 border-[#1A56A0] ring-2 ring-blue-200/70",
            )}
          >
            <div
              className={cn(
                "px-5 py-4 text-center",
                isVip ? "bg-gradient-to-r from-amber-500 to-yellow-500" : "text-white",
              )}
              style={isVip ? undefined : { backgroundColor: BRAND_BLUE }}
            >
              {isVip ? (
                <p className="inline-flex items-center gap-1.5 text-sm font-black text-white">
                  <Crown className="h-4 w-4" aria-hidden />
                  VIP Partner
                </p>
              ) : (
                <p className="inline-flex items-center gap-1.5 text-sm font-black">
                  <Building2 className="h-4 w-4" aria-hidden />
                  Partner
                </p>
              )}
            </div>

            <div className="px-5 sm:px-8 py-8 text-center">
              {profile.logo_url ? (
                <div className="mx-auto mb-6 h-32 w-32 sm:h-40 sm:w-40 rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden flex items-center justify-center p-3">
                  <img
                    src={profile.logo_url}
                    alt={profile.business_name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "mx-auto mb-6 h-32 w-32 sm:h-40 sm:w-40 rounded-2xl flex items-center justify-center text-3xl font-black text-white",
                    isVip ? "bg-gradient-to-br from-amber-500 to-yellow-600" : "bg-[#1A56A0]",
                  )}
                  aria-hidden
                >
                  {profile.business_name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {profile.business_name}
              </h1>
              {categoryLabel ? (
                <p className="mt-2 text-sm sm:text-base font-semibold text-gray-600">{categoryLabel}</p>
              ) : null}
            </div>

            {profile.address ? (
              <div className="px-5 sm:px-8 pb-8">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Lokacioni</h2>
                <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-100">
                  <iframe
                    title={`Harta — ${profile.business_name}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(profile.address)}&output=embed`}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">{profile.address}</p>
              </div>
            ) : null}

            {skipSocial.size > 0 ? (
              <div className="px-5 sm:px-8 pb-4">
                <ShopSocialProfiles profiles={enrichedSocial} />
              </div>
            ) : null}

            {socialLinks.length > 0 ? (
              <div className="px-5 sm:px-8 pb-8">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Kontakt & rrjetet sociale</h2>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.key}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "inline-flex items-center gap-2 min-h-11 px-4 rounded-xl text-sm font-bold transition-colors",
                          link.className,
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {link.label}
                        <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </article>
        )}
      </div>
    </div>
  );
}
