import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { ProfileMyListings } from "@/components/profile-my-listings";
import { MobileSafeTopSpacer } from "@/components/mobile-safe-top-spacer";
import { UserMenuDropdown } from "@/components/user-menu-dropdown";

export default function MyListingsPage() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { t } = useMarket();

  useEffect(() => {
    if (loading) return;
    if (!user) setLocation(loginUrlWithReturn("/shpalljet-e-mia"));
  }, [user, loading, setLocation]);

  if (loading || !user) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <MobileSafeTopSpacer />
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/profili" className="flex items-center gap-2 text-gray-700 min-h-12">
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">{t.back}</span>
          </Link>
          <UserMenuDropdown variant="compact" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-xl font-black text-gray-900 mb-4">{t.profile_myListings_heading}</h1>
          <ProfileMyListings />
        </div>
      </main>
    </div>
  );
}
