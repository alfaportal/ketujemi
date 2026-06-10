import { useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Loader2 } from "lucide-react";
import { formatQuotaResetLabel } from "@/components/listing-limit-reached-modal";
import { useMarket } from "@/lib/market-context";
import { fillMyListingsPlaceholders, useMyListingsMonthCopy } from "@/lib/my-listings-month-i18n";
import { translateCategory, type UiCategoryLocale } from "@/lib/category-translations";

type PostRow = { id: number; title: string; created_at: string };

type CategoryBlock = {
  root_category_id: number;
  root_category_name: string;
  used: number;
  limit: number;
  posts: PostRow[];
};

type HistoryResponse = {
  quota_resets_at: string;
  free_limit_per_category: number;
  categories: CategoryBlock[];
};

function formatPostDateTime(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MyListingsThisMonth() {
  const m = useMyListingsMonthCopy();
  const { uiLang } = useMarket();
  const locale =
    uiLang === "mk"
      ? "mk-MK"
      : uiLang === "mne"
        ? "sr-ME"
        : uiLang === "en"
          ? "en-GB"
          : uiLang === "fr"
            ? "fr-FR"
            : uiLang === "de"
              ? "de-DE"
              : uiLang === "it"
                ? "it-IT"
                : "sq-AL";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HistoryResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchWithTimeout("/api/listings/monthly-posting-history", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { message?: string };
          throw new Error(j.message ?? m.loadError);
        }
        return r.json() as Promise<HistoryResponse>;
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : m.genericError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resetLabel = data
    ? formatQuotaResetLabel(data.quota_resets_at, locale)
    : "";

  return (
    <section className="space-y-3 pt-4 border-t border-gray-100" aria-labelledby="my-listings-month-title">
      <div>
        <h2 id="my-listings-month-title" className="text-base font-bold text-gray-900">
          {m.sectionTitle}
        </h2>
        {data ? (
          <p className="text-xs text-gray-500 mt-1">
            {fillMyListingsPlaceholders(m.freeLimitNote, {
              limit: data.free_limit_per_category,
              date: resetLabel,
            })}
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {data?.categories.map((cat) => {
        const catLocale: UiCategoryLocale =
          uiLang === "sq" ? "ks" : uiLang === "mne" ? "mne" : uiLang;
        const name = translateCategory(cat.root_category_name, catLocale);
        const catReset = formatQuotaResetLabel(data.quota_resets_at, locale);
        return (
          <div
            key={cat.root_category_id}
            className="rounded-xl border border-gray-100 bg-gray-50/80 overflow-hidden"
          >
            <div className="px-3 py-2.5 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-gray-900 text-sm">{name}</p>
              <p className="text-sm font-semibold text-blue-800">
                {cat.used} / {cat.limit} {m.usedLabel}
              </p>
            </div>
            <div className="px-3 py-2 text-xs text-gray-500">
              {m.resetsOn} {catReset}
            </div>
            {cat.posts.length === 0 ? (
              <p className="px-3 pb-3 text-sm text-gray-400">{m.emptyCategory}</p>
            ) : (
              <ul className="divide-y divide-gray-100 border-t border-gray-100 bg-white">
                {cat.posts.map((p) => (
                  <li key={p.id} className="px-3 py-2.5 text-sm">
                    <p className="font-medium text-gray-900 line-clamp-2">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatPostDateTime(p.created_at, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}
