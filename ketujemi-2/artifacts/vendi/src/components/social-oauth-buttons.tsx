import { FaFacebook, FaGoogle, FaInstagram, FaTiktok } from "react-icons/fa";

type Props = {
  returnTo: string;
  googleEnabled: boolean;
  facebookEnabled: boolean;
  tiktokEnabled: boolean;
  labels: {
    or: string;
    google: string;
    facebook: string;
    tiktok: string;
  };
};

function googleStartUrl(): string {
  return "/auth/google/start";
}

function facebookStartUrl(returnTo: string): string {
  const params = new URLSearchParams({ return: returnTo });
  return `/api/auth/facebook/start?${params}`;
}

function tiktokStartUrl(): string {
  return "/auth/tiktok/start";
}

export function SocialOAuthButtons({
  returnTo,
  googleEnabled,
  facebookEnabled,
  tiktokEnabled,
  labels,
}: Props) {
  if (!googleEnabled && !facebookEnabled && !tiktokEnabled) return null;

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
          href={facebookStartUrl(returnTo)}
          className="flex w-full min-h-12 items-center justify-center gap-2 rounded-md border border-[#1877F2]/30 bg-[#1877F2]/5 px-4 text-sm font-semibold text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors"
        >
          <FaFacebook className="h-5 w-5 shrink-0" aria-hidden />
          <FaInstagram className="h-5 w-5 shrink-0 text-[#C13584]" aria-hidden />
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
    </div>
  );
}
