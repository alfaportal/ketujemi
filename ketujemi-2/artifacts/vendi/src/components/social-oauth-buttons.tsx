import { FaFacebook, FaInstagram } from "react-icons/fa";

type Props = {
  returnTo: string;
  facebookEnabled: boolean;
  instagramEnabled: boolean;
};

function oauthStartUrl(provider: "facebook" | "instagram", returnTo: string): string {
  const params = new URLSearchParams({ return: returnTo });
  return `/api/auth/oauth/${provider}/start?${params}`;
}

export function SocialOAuthButtons({ returnTo, facebookEnabled, instagramEnabled }: Props) {
  if (!facebookEnabled && !instagramEnabled) return null;

  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs text-gray-500 uppercase tracking-wide text-center">ose</p>

      {facebookEnabled ? (
        <a
          href={oauthStartUrl("facebook", returnTo)}
          className="flex w-full min-h-12 items-center justify-center gap-2 rounded-md border border-[#1877F2]/30 bg-[#1877F2]/5 px-4 text-sm font-semibold text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors"
        >
          <FaFacebook className="h-5 w-5 shrink-0" aria-hidden />
          Vazhdo me Facebook
        </a>
      ) : null}

      {instagramEnabled ? (
        <a
          href={oauthStartUrl("instagram", returnTo)}
          className="flex w-full min-h-12 items-center justify-center gap-2 rounded-md border border-pink-300/50 bg-gradient-to-r from-[#fdf497]/20 via-[#fd5949]/10 to-[#d6249f]/10 px-4 text-sm font-semibold text-[#C13584] hover:from-[#fdf497]/30 hover:via-[#fd5949]/15 hover:to-[#d6249f]/15 transition-colors"
        >
          <FaInstagram className="h-5 w-5 shrink-0" aria-hidden />
          Vazhdo me Instagram
        </a>
      ) : null}

      <p className="text-[11px] text-gray-500 text-center leading-snug">
        Faqja zyrtare: KetuJemi.com · Instagram @jemi.ketu
      </p>
    </div>
  );
}
