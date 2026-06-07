import { useCallback, useEffect, useState } from "react";
import { getAdminDeletionFeedback, type AdminDeletionFeedbackRow } from "@/lib/admin-api";
import { useMarket } from "@/lib/market-context";

function formatDt(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminDeletionFeedback() {
  const { t } = useMarket();
  const [rows, setRows] = useState<AdminDeletionFeedbackRow[]>([]);
  const [stats, setStats] = useState<Array<{ reason: string; reason_label: string; count: number }>>(
    [],
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminDeletionFeedback({ page, limit });
      setRows(data.rows);
      setStats(data.stats);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const maxStat = stats.reduce((m, s) => Math.max(m, s.count), 0) || 1;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">{t.adm_deletion_title}</h2>

      {stats.length > 0 ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {t.adm_deletion_stats}
          </h3>
          <div className="space-y-3">
            {stats.map((s) => (
              <div key={s.reason} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-800">{s.reason_label}</span>
                  <span className="font-semibold text-gray-900">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{ width: `${Math.round((s.count / maxStat) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {t.adm_deletion_total.replace("{n}", String(total))}
          </p>
        </section>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="px-4 py-3">{t.adm_deletion_col_date}</th>
              <th className="px-4 py-3">{t.adm_deletion_col_type}</th>
              <th className="px-4 py-3">{t.adm_deletion_col_reason}</th>
              <th className="px-4 py-3">{t.adm_deletion_col_details}</th>
              <th className="px-4 py-3">{t.adm_deletion_col_feedback}</th>
              <th className="px-4 py-3">{t.adm_deletion_col_user}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  …
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {t.adm_deletion_empty}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {formatDt(r.deleted_at)}
                  </td>
                  <td className="px-4 py-3">
                    {r.entity_type === "user" ? t.adm_deletion_type_user : t.adm_deletion_type_shop}
                    {r.shop_name ? (
                      <span className="block text-xs text-gray-500">{r.shop_name}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.reason_label}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">{r.custom_text ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">{r.additional_feedback ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">#{r.user_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-200 px-3 py-2 disabled:opacity-40"
          >
            ←
          </button>
          <span className="text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-gray-200 px-3 py-2 disabled:opacity-40"
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}
