import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminFollowersList,
  getAdminFollowersStats,
  importAdminInstagramFollowers,
  syncAdminFollowers,
  type AdminSocialFollowerRow,
  type AdminSocialFollowersStats,
  type SocialFollowerPlatform,
} from "@/lib/admin-api";
import { useMarket } from "@/lib/market-context";
import { fillPlaceholders } from "@/lib/app-extra-i18n";
import { ChevronLeft, ChevronRight, RefreshCw, Upload, Users } from "lucide-react";

type PlatformFilter = SocialFollowerPlatform | "all";
type StatusFilter = "active" | "unfollowed" | "all";

const PLATFORMS: PlatformFilter[] = ["all", "instagram", "facebook", "tiktok"];

function formatDt(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function platformLabel(platform: string, t: Record<string, string>): string {
  const key = `adm_followers_platform_${platform}` as keyof typeof t;
  const v = t[key];
  return typeof v === "string" ? v : platform;
}

export default function AdminFollowers() {
  const { t } = useMarket();
  const tr = t as Record<string, string>;

  const [stats, setStats] = useState<AdminSocialFollowersStats | null>(null);
  const [rows, setRows] = useState<AdminSocialFollowerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const PAGE_SIZE = 30;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        getAdminFollowersStats(),
        getAdminFollowersList({
          platform,
          status,
          from: fromDate || undefined,
          to: toDate || undefined,
          page,
          limit: PAGE_SIZE,
        }),
      ]);
      setStats(statsRes.stats);
      setRows(listRes.rows);
      setTotal(listRes.total);
    } finally {
      setLoading(false);
    }
  }, [platform, status, fromDate, toDate, page]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    setPage(1);
  }, [platform, status, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const statCards = useMemo(() => {
    if (!stats) return [];
    return (["instagram", "facebook", "tiktok"] as SocialFollowerPlatform[]).map((p) => ({
      platform: p,
      active: stats[p].active,
      unfollowed: stats[p].unfollowed,
      apiCount: stats[p].api_count,
      apiSynced: stats[p].api_synced_at,
    }));
  }, [stats]);

  const runSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await syncAdminFollowers();
      setMessage({
        type: res.listSynced ? "ok" : "err",
        text: res.message,
      });
      await fetchAll();
    } catch (e) {
      setMessage({
        type: "err",
        text: e instanceof Error ? e.message : tr.adm_followers_sync_fail,
      });
    } finally {
      setSyncing(false);
    }
  };

  const onImportFile = async (file: File) => {
    setImporting(true);
    setMessage(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;
      const res = await importAdminInstagramFollowers(data);
      setMessage({
        type: "ok",
        text: fillPlaceholders(tr.adm_followers_import_ok, {
          parsed: String(res.parsed),
          added: String(res.added),
          unfollowed: String(res.unfollowed),
        }),
      });
      await fetchAll();
    } catch (e) {
      setMessage({
        type: "err",
        text: e instanceof Error ? e.message : tr.adm_followers_import_fail,
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{tr.adm_followers_intro}</p>
          <p className="text-xs text-amber-700 mt-1">{tr.adm_followers_api_note}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
            <Upload size={14} />
            {importing ? tr.adm_followers_importing : tr.adm_followers_import}
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              disabled={importing}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImportFile(f);
                e.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => fetchAll()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {tr.adm_followers_refresh}
          </button>
          <button
            type="button"
            onClick={runSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            <Users size={14} />
            {syncing ? tr.adm_followers_syncing : tr.adm_followers_sync}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-sm ${
            message.type === "ok"
              ? "bg-green-50 text-green-800 border border-green-100"
              : "bg-amber-50 text-amber-900 border border-amber-100"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statCards.map((card) => (
          <div key={card.platform} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {platformLabel(card.platform, tr)}
            </div>
            <div className="mt-2 text-2xl font-black text-gray-900">{card.active}</div>
            <div className="text-xs text-gray-500 mt-1">
              {tr.adm_followers_stat_active}
              {card.apiCount != null && (
                <span className="block mt-0.5">
                  {fillPlaceholders(tr.adm_followers_stat_api, { count: String(card.apiCount) })}
                </span>
              )}
            </div>
            <div className="text-xs text-red-600 mt-2">
              {fillPlaceholders(tr.adm_followers_stat_unfollowed, {
                count: String(card.unfollowed),
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">{tr.adm_followers_filter_platform}</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as PlatformFilter)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? tr.adm_followers_filter_all : platformLabel(p, tr)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">{tr.adm_followers_filter_status}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="active">{tr.adm_followers_status_active}</option>
            <option value="unfollowed">{tr.adm_followers_status_unfollowed}</option>
            <option value="all">{tr.adm_followers_filter_all}</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">{tr.adm_followers_filter_from}</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">{tr.adm_followers_filter_to}</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="p-3">{tr.adm_followers_col_user}</th>
                <th className="p-3">{tr.adm_followers_col_platform}</th>
                <th className="p-3">{tr.adm_followers_col_followed}</th>
                <th className="p-3">{tr.adm_followers_col_unfollowed}</th>
                <th className="p-3">{tr.adm_followers_col_status}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    {tr.adm_followers_loading}
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    {tr.adm_followers_empty}
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50/80">
                    <td className="p-3 font-medium text-gray-900">@{r.follower_username}</td>
                    <td className="p-3">{platformLabel(r.platform, tr)}</td>
                    <td className="p-3 text-gray-600">{formatDt(r.followed_at)}</td>
                    <td className="p-3 text-gray-600">{formatDt(r.unfollowed_at)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.is_active
                          ? tr.adm_followers_status_active
                          : tr.adm_followers_status_unfollowed}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
            <span className="text-gray-500">
              {fillPlaceholders(tr.adm_followers_page_info, {
                page: String(page),
                total: String(totalPages),
              })}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
