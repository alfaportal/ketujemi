import { Link } from "wouter";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { KERKOJ_POST_PATH } from "@/lib/special-listing-categories";

export function KerkojTeBlejHubIntro() {
  const { user, loading } = useAuth();
  const { t } = useMarket();
  const postHref = !loading && !user ? loginUrlWithReturn(KERKOJ_POST_PATH, "register") : KERKOJ_POST_PATH;

  return (
    <section className="mb-8 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 sm:p-8 shadow-sm">
      <p className="text-lg sm:text-xl font-bold text-blue-900 leading-snug mb-4">
        {t.kerkojHubIntroTitle}
      </p>
      <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
        <p>{t.kerkojEmptySub}</p>
        <p className="font-medium text-blue-800">{t.kerkojFormDescNote}</p>
      </div>
      <Link
        href={postHref}
        className="mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-md shadow-blue-600/25 transition-colors hover:bg-blue-700"
        data-testid="button-kerkoj-post-cta"
      >
        {t.kerkojEmptyPost}
      </Link>
    </section>
  );
}
