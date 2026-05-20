import { useEffect, useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import type { AuthUser } from "@/lib/auth-context";

type Stats = {
  month: string;
  views: number;
  clicks: number;
  is_vip_active: boolean;
};

function isVipActive(user: AuthUser): boolean {
  return (
    user.business_tier === "vip" &&
    !!user.vip_expires_at &&
    new Date(user.vip_expires_at) > new Date()
  );
}

export function PartnerLogoAnalyticsCard({ user }: { user: AuthUser }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.account_type !== "business") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void fetch("/api/business/partner-analytics", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Stats | null) => {
        if (!cancelled) setStats(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user.account_type, user.id]);

  if (user.account_type !== "business") return null;

  const vip = isVipActive(user);

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-amber-700" aria-hidden />
        <h2 className="font-bold text-gray-900">Statistika e logos (partner)</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
        </div>
      ) : !vip ? (
        <p className="text-sm text-gray-600">
          Aktivizoni VIP për të shfaqur logon te «Partnerët tanë të besuar» dhe për të parë
          shikimet dhe klikimet këtu.
        </p>
      ) : stats ? (
        <p className="text-sm text-gray-800 leading-relaxed">
          Logoja juaj është parë{" "}
          <span className="font-black text-amber-800">{stats.views.toLocaleString()}</span> herë
          këtë muaj dhe është klikuar{" "}
          <span className="font-black text-amber-800">{stats.clicks.toLocaleString()}</span> herë.
        </p>
      ) : (
        <p className="text-sm text-gray-600">
          Logoja juaj është parë <span className="font-semibold">0</span> herë këtë muaj dhe është
          klikuar <span className="font-semibold">0</span> herë.
        </p>
      )}
    </div>
  );
}
