import { useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Building2, Crown, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { translateCategory } from "@/lib/category-translations";
import { fetchShopMapEmbedSrc, googleMapsEmbedSrc, googleMapsOpenUrl } from "@/lib/google-maps-embed";
import { usePartnerProfileCopy } from "@/lib/partner-profile-i18n";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { cn } from "@/lib/utils";
import { ShopSocialLinks } from "@/components/shop-social-links";
import type { ShopSocialProfileData } from "@/components/shop-social-profiles";

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

export default function PartnerProfilePage() {
  const [, params] = useRoute("/partners/:id");
  const { uiLang } = useMarket();
  const copy = usePartnerProfileCopy();
  const locale = translationKeyForUiLang(uiLang);
  const id = Number(params?.id);

  const [profile, setProfile] = useState<PartnerPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [mapEmbedSrc, setMapEmbedSrc] = useState("");

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

  useEffect(() => {
    const address = profile?.address?.trim();
    if (!address) {
      setMapEmbedSrc("");
      return;
    }
    const mapInput = { address };
    setMapEmbedSrc(googleMapsEmbedSrc(address));

    let cancelled = false;
    void fetchShopMapEmbedSrc(mapInput).then((url) => {
      if (!cancelled && url) setMapEmbedSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.address]);

  const isVip = profile?.tier === "vip";
  const enrichedSocial = profile?.social_profiles ?? {};
  const categoryLabel = profile?.category_name
    ? translateCategory(profile.category_name, locale)
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
          {copy.back}
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : notFound || !profile ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="font-bold text-gray-900">{copy.notFoundTitle}</p>
            <p className="mt-2 text-sm text-gray-600">{copy.notFoundSub}</p>
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
                  {copy.vipBadge}
                </p>
              ) : (
                <p className="inline-flex items-center gap-1.5 text-sm font-black">
                  <Building2 className="h-4 w-4" aria-hidden />
                  {copy.standardBadge}
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
                <h2 className="text-sm font-bold text-gray-900 mb-3">{copy.locationTitle}</h2>
                <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-100">
                  {mapEmbedSrc ? (
                    <iframe
                      title={`${copy.mapTitle} — ${profile.business_name}`}
                      src={mapEmbedSrc}
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <div className="h-full w-full animate-pulse bg-gray-200" aria-hidden />
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-gray-600">{profile.address}</p>
                  <a
                    href={googleMapsOpenUrl(profile.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    {copy.openInMaps}
                  </a>
                </div>
              </div>
            ) : null}

            <div className="px-5 sm:px-8 pb-8">
              <ShopSocialLinks
                fields={{
                  facebook: profile.facebook_url,
                  instagram: profile.instagram_url,
                  tiktok: profile.tiktok_url,
                  whatsapp: profile.whatsapp_url,
                  website: profile.website_url,
                }}
                enriched={enrichedSocial}
                title={copy.contactTitle}
                className="border-0 bg-transparent p-0 shadow-none"
              />
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
