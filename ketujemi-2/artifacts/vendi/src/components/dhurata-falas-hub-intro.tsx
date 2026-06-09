import { Link } from "wouter";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";

const DHURATA_POST_PATH = "/listings/new/dhurata-falas";

export function DhurataFalasHubIntro() {
  const { user, loading } = useAuth();
  const { t } = useMarket();
  const tx = t as Record<string, string | undefined>;
  const postHref = !loading && !user ? loginUrlWithReturn(DHURATA_POST_PATH) : DHURATA_POST_PATH;

  return (
    <section className="mb-8 rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6 sm:p-8 shadow-sm">
      <p className="text-lg sm:text-xl font-bold text-green-900 leading-snug mb-4">
        {tx.ui_dhurataHubTitle ?? "Një send i vogël për ju — një botë e tërë për dikë tjetër"}
      </p>
      <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
        <p>
          {tx.ui_dhurataHubP1 ??
            "Ndoshta është një xhaketë që nuk e vesh më. Një lodër që fëmija juaj e ka lënë mënjanë. Një libër që e ke lexuar dhe po rri në raft. Një mobilje që nuk të hyn në dhomë."}
        </p>
        <p>
          {tx.ui_dhurataHubP2 ??
            "Por diku, sot, ka një nënë që kërkon një xhaketë të ngrohtë për fëmijën e saj. Ka një fëmijë që ëndërron pikërisht atë lodër. Ka një student që nuk mund ta blejë atë libër. Ka një familje që ka nevojë për pikërisht atë mobilje."}
        </p>
        <p>
          {tx.ui_dhurataHubP3 ??
            "Ata nuk dinë që ju e keni. Ju nuk dini që ata e kanë nevojë. KetuJemi i bashkon — falas, me dashuri, me dinjitet."}
        </p>
        <p className="font-medium text-green-800">
          {tx.ui_dhurataHubThanks ??
            "Faleminderit që zgjodhët të jepni. Bota bëhet më e mirë me njerëz si ju. ❤️"}
        </p>
      </div>
      <Link
        href={postHref}
        className="mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-green-600 px-8 py-4 text-base font-bold text-white shadow-md shadow-green-600/25 transition-colors hover:bg-green-700"
        data-testid="button-dhurata-post-cta"
      >
        {tx.ui_dhurataHubCta ?? "🎁 Dhurojë Tani — Falas"}
      </Link>
    </section>
  );
}
