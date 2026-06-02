import { FaFacebook, FaGoogle, FaInstagram, FaTiktok } from "react-icons/fa";

type Props = {
  returnTo: string;
  googleEnabled: boolean;
  facebookEnabled: boolean;
  tiktokEnabled: boolean;
  instagramEnabled: boolean;
  labels: {
    or: string;
    google: string;
    facebook: string;
    tiktok: string;
    instagram: string;
  };
};

function instagramStartUrl(returnTo: string): string {
  const params = new URLSearchParams({ return: returnTo });
  return `/api/auth/oauth/instagram/start?${params}`;
}

function googleStartUrl(): string {
  return "/auth/google/start";
}

function facebookStartUrl(): string {
  return "/auth/facebook/start";
}

function tiktokStartUrl(): string {
  return "/auth/tiktok/start";
}

export function SocialOAuthButtons({
  returnTo,
  googleEnabled,
  facebookEnabled,
  tiktokEnabled,
  instagramEnabled,
  labels,
}: Props) {
  if (!googleEnabled && !facebookEnabled && !tiktokEnabled && !instagramEnabled) return null;

  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs text-gray-500 uppercase tracking-wide text-center">{labels.or}</p>

      {googleEnabled ? (
        <a
          href={googleStartUrl()}
          className="flex w-full min-h-12 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <FaGoogle className="h-5 w-5 shrink-0 text-[#4285F4]" aria-hidden />
          {labels.google}
        </a>
      ) : null}

      {facebookEnabled ? (
        <a
          href={facebookStartUrl()}
          className="flex w-full min-h-12 items-center justify-center gap-2 rounded-md border border-[#1877F2]/30 bg-[#1877F2]/5 px-4 text-sm font-semibold text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors"
        >
          <FaFacebook className="h-5 w-5 shrink-0" aria-hidden />
          {labels.facebook}
        </a>
      ) : null}

      {tiktokEnabled ? (
        <a
          href={tiktokStartUrl()}
          className="flex w-full min-h-12 items-center justify-center gap-2 rounded-md border border-black/20 bg-black px-4 text-sm font-semibold text-white hover:bg-gray-900 transition-colors"
        >
          <FaTiktok className="h-5 w-5 shrink-0" aria-hidden />
          {labels.tiktok}
        </a>
      ) : null}

      {instagramEnabled ? (
        <a
          href={instagramStartUrl(returnTo)}
          className="flex w-full min-h-12 items-center justify-center gap-2 rounded-md border border-pink-300/50 bg-gradient-to-r from-[#fdf497]/20 via-[#fd5949]/10 to-[#d6249f]/10 px-4 text-sm font-semibold text-[#C13584] hover:from-[#fdf497]/30 hover:via-[#fd5949]/15 hover:to-[#d6249f]/15 transition-colors"
        >
          <FaInstagram className="h-5 w-5 shrink-0" aria-hidden />
          {labels.instagram}
        </a>
      ) : null}
    </div>
  );
}
