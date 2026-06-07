import { ExternalLink, Instagram } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";

export type ShopSocialProfileData = {
  handle: string;
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number | null;
  profile_url: string;
  link_valid: boolean;
  oauth_verified: boolean;
  fetch_status: string;
};

type Props = {
  profiles: Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>;
  compact?: boolean;
};

function PlatformIcon({ platform }: { platform: "instagram" | "tiktok" }) {
  if (platform === "instagram") {
    return <Instagram className="h-5 w-5 shrink-0" aria-hidden />;
  }
  return <ExternalLink className="h-5 w-5 shrink-0" aria-hidden />;
}

function ProfileCard({
  platform,
  profile,
  compact,
}: {
  platform: "instagram" | "tiktok";
  profile: ShopSocialProfileData;
  compact?: boolean;
}) {
  const { t } = useMarket();
  const label = platform === "instagram" ? "Instagram" : "TikTok";
  const followersText =
    profile.follower_count != null && profile.follower_count >= 0
      ? t.shop_social_followers.replace("{count}", profile.follower_count.toLocaleString())
      : t.shop_social_followers_unknown;

  return (
    <a
      href={profile.profile_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-white transition-shadow hover:shadow-md",
        compact ? "p-3" : "p-4 border-gray-100 shadow-sm",
      )}
    >
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className={cn("rounded-xl object-cover border border-gray-100 shrink-0", compact ? "h-12 w-12" : "h-14 w-14")}
        />
      ) : (
        <div
          className={cn(
            "rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-500",
            compact ? "h-12 w-12" : "h-14 w-14",
          )}
        >
          <PlatformIcon platform={platform} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-gray-900 truncate">
            {profile.display_name || `@${profile.handle}`}
          </span>
          {profile.oauth_verified ? (
            <span className="text-xs font-semibold text-green-800 bg-green-100 border border-green-200 rounded-full px-2 py-0.5">
              {t.shop_social_verified}
            </span>
          ) : profile.link_valid ? (
            <span className="text-xs font-medium text-blue-800 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
              {t.shop_social_link_active}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          {label} · @{profile.handle}
        </p>
        <p className="text-sm text-gray-600 mt-1">{followersText}</p>
      </div>
    </a>
  );
}

export function ShopSocialProfiles({ profiles, compact }: Props) {
  const { t } = useMarket();
  const items = (["instagram", "tiktok"] as const).filter((p) => profiles[p]);

  if (items.length === 0) return null;

  return (
    <section className={cn("space-y-3", compact ? "" : "rounded-2xl bg-white border border-gray-100 p-6 shadow-sm")}>
      {!compact ? (
        <h2 className="text-lg font-bold text-gray-900">{t.shop_social_section_title}</h2>
      ) : null}
      <div className={cn("grid gap-3", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        {items.map((platform) => (
          <ProfileCard key={platform} platform={platform} profile={profiles[platform]!} compact={compact} />
        ))}
      </div>
    </section>
  );
}
