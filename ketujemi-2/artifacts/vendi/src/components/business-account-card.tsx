import { Building2, Crown } from "lucide-react";
import { type AuthUser } from "@/lib/auth-context";
import { Link } from "wouter";

export function BusinessAccountCard({ user }: { user: AuthUser }) {
  const isBusiness = user.account_type === "business";
  const isPending = user.business_status === "pending";
  const isBlocked = user.business_status === "blocked";
  const isActive = user.business_status === "active" || (!user.business_status && isBusiness);
  const isVip =
    user.business_tier === "vip" &&
    !!user.vip_expires_at &&
    new Date(user.vip_expires_at) > new Date();

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-blue-600" aria-hidden />
        <h2 className="font-bold text-gray-900">Llogaria e biznesit / Partner</h2>
      </div>

      {!isBusiness ? (
        <>
          <p className="text-sm text-gray-600">
            Dëshironi të bëheni Partner ose VIP Partner? Plotësoni formularin e aplikimit — ekipi
            ynë do t&apos;ju kontaktojë pas shqyrtimit.
          </p>
          <Link
            href="/partner?step=partner#regjistrohu"
            className="inline-flex items-center justify-center w-full min-h-12 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Apliko si Partner / VIP Partner
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{user.business_name}</span>
            {isVip ? (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-700">
                <Crown className="h-4 w-4" /> VIP Partner
              </span>
            ) : (
              <span className="ml-2 text-[#1A56A0] font-semibold">— Partner</span>
            )}
          </p>
          {isPending ? (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Në pritje të aktivizimit nga administratori.
            </p>
          ) : null}
          {isBlocked ? (
            <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              Llogaria është bllokuar.
            </p>
          ) : null}
          {isActive && !isVip ? (
            <p className="text-xs text-gray-500">
              Për banner lëvizës (5 foto), kontaktoni administratorin për paketën VIP.
            </p>
          ) : null}
          <Link
            href="/business-rules"
            className="block text-center text-sm font-semibold text-blue-600 hover:underline"
          >
            Lexo rregullorjen e biznesit
          </Link>
        </>
      )}
    </div>
  );
}
