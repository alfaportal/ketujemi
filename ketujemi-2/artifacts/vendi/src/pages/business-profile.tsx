import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Building2, Crown, Loader2, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import SharedListingCard from "@/components/listing-card";
import { useMarket } from "@/lib/market-context";

type BusinessProfile = {
  id: number;
  business_name: string;
  partner_logo_url: string | null;
  profile_photo_url: string | null;
  city: string | null;
  about_me: string | null;
  is_vip: boolean;
  active_listing_count: number;
};

type ListingRow = {
  id: number;
  title: string;
  description: string;
  price: number;
  category_name?: string | null;
  location: string;
  seller_name: string;
  image_url?: string | null;
  created_at: string;
  expires_at?: string | null;
  days_left?: number | null;
  is_top?: boolean;
};

function profileLogoUrl(p: BusinessProfile): string | null {
  return p.partner_logo_url?.trim() || p.profile_photo_url?.trim() || null;
}

export default function BusinessProfilePage() {
  const [, params] = useRoute("/biznes/:id");
  const { t } = useMarket();
  const id = Number(params?.id);

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id) || id < 1) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    void Promise.all([
      fetch(`/api/businesses/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/businesses/${id}/listings`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([prof, listData]) => {
        if (cancelled) return;
        if (!prof) {
          setNotFound(true);
          setProfile(null);
          setListings([]);
          return;
        }
        setProfile(prof as BusinessProfile);
        const rows = (listData as { listings?: ListingRow[] })?.listings ?? [];
        setListings(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const logo = profile ? profileLogoUrl(profile) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader showViewAllListings />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 min-h-12"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>

        {loading ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : null}

        {!loading && notFound ? (
          <div className="mt-12 text-center">
            <p className="text-lg font-semibold text-gray-800">Biznesi nuk u gjet.</p>
            <Link href="/listings" className="text-blue-600 font-medium mt-4 inline-block">
              Shiko të gjitha njoftimet
            </Link>
          </div>
        ) : null}

        {!loading && profile ? (
          <>
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start">
              <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {logo ? (
                  <img
                    src={logo}
                    alt={profile.business_name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-blue-600" aria-hidden />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-gray-900">{profile.business_name}</h1>
                {profile.is_vip ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#1A56A0]">
                    <Crown className="h-4 w-4" /> VIP PARTNER
                  </p>
                ) : null}
                {profile.city ? (
                  <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {profile.city}
                  </p>
                ) : null}
                {profile.about_me ? (
                  <p className="mt-3 text-sm text-gray-700 leading-relaxed">{profile.about_me}</p>
                ) : null}
                <p className="mt-3 text-sm font-medium text-gray-500">
                  {profile.active_listing_count}{" "}
                  {profile.active_listing_count === 1 ? "njoftim aktiv" : "njoftime aktive"}
                </p>
              </div>
            </div>

            <h2 className="mt-8 text-lg font-bold text-gray-900">Njoftimet aktive</h2>
            {listings.length === 0 ? (
              <p className="mt-4 text-gray-600 text-sm">
                Ky biznes nuk ka njoftime aktive për momentin.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.map((listing) => (
                  <SharedListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
