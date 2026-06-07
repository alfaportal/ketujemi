import { useCallback, useEffect, useState } from "react";
import { Instagram, Music2, RefreshCw } from "lucide-react";
import {
  getAdminShopSocialEnrichments,
  syncAdminShopSocialEnrichments,
  type AdminShopSocialRow,
} from "@/lib/admin-api";
import { useMarket } from "@/lib/market-context";

function formatDt(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatFollowers(count: number | null): string {
  if (count == null || count < 0) return "—";
  return count.toLocaleString();
}

export default function AdminShopSocialEnrichments() {
  const { t } = useMarket();
  const [rows, setRows] = useState<AdminShopSocialRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminShopSocialEnrichments({ page, limit });
      setRows(data.rows);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const result = await syncAdminShopSocialEnrichments();
      setSyncMsg(
        `${result.processed}/${result.total} OK, ${result.errors} errors`,
      );
      await load();
    } catch {
      setSyncMsg("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">{t.adm_shop_social_title}</h2>
        <button
          type="button"
          onClick={() => void onSync()}
          disabled={syncing}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {t.adm_shop_social_sync}
        </button>
      </div>

      {syncMsg ? (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          {syncMsg}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="px-4 py-3">{t.adm_shop_social_col_shop}</th>
              <th className="px-4 py-3">{t.adm_shop_social_col_platform}</th>
              <th className="px-4 py-3">{t.adm_shop_social_col_handle}</th>
              <th className="px-4 py-3">{t.adm_shop_social_col_followers}</th>
              <th className="px-4 py-3">{t.adm_shop_social_col_link}</th>
              <th className="px-4 py-3">{t.adm_shop_social_col_oauth}</th>
              <th className="px-4 py-3">{t.adm_shop_social_col_status}</th>
              <th className="px-4 py-3">{t.adm_shop_social_col_fetched}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  …
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  —
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.shop_name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 capitalize">
                      {row.platform === "instagram" ? (
                        <Instagram className="h-3.5 w-3.5" />
                      ) : (
                        <Music2 className="h-3.5 w-3.5" />
                      )}
                      {row.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3">@{row.handle}</td>
                  <td className="px-4 py-3 tabular-nums">{formatFollowers(row.follower_count)}</td>
                  <td className="px-4 py-3">
                    {row.link_valid ? t.adm_shop_social_link_yes : t.adm_shop_social_link_no}
                  </td>
                  <td className="px-4 py-3">
                    {row.oauth_verified ? t.adm_shop_social_oauth_yes : t.adm_shop_social_oauth_no}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.fetch_status}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDt(row.fetched_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {page} / {totalPages} ({total})
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
            >
              ←
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
