import { useCallback, useEffect, useState } from "react";
import {
  downloadAdminFollowersCsv,
  getAdminFollowersList,
  getAdminFollowersStats,
  importAdminInstagramFollowers,
  saveAdminFollowersManualCount,
  syncAdminFollowers,
  type AdminSocialFollowerRow,
  type AdminSocialFollowersManualStats,
  type AdminSocialFollowersStats,
  type SocialFollowerPlatform,
  type SocialFollowersManualPlatform,
} from "@/lib/admin-api";
import { useMarket } from "@/lib/market-context";
import { fillPlaceholders } from "@/lib/app-extra-i18n";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Facebook,
  Instagram,
  Music2,
  RefreshCw,
  Upload,
  Users,
} from "lucide-react";

type StatusFilter = "active" | "unfollowed" | "all";

const TABS: SocialFollowerPlatform[] = ["instagram", "facebook", "tiktok"];

const TAB_ICON: Record<SocialFollowerPlatform, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
};

function formatDt(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function platformLabel(platform: SocialFollowerPlatform, t: Record<string, string>): string {
  const key = `adm_followers_platform_${platform}` as keyof typeof t;
  const v = t[key];
  return typeof v === "string" ? v : platform;
}

function displayFollowerCount(
  platform: SocialFollowerPlatform,
  stats: AdminSocialFollowersStats | null,
  manual: AdminSocialFollowersManualStats | null,
): number {
  if (!stats) return 0;
  const row = stats[platform];
  if (platform === "tiktok") {
    return row.api_count ?? manual?.tiktok.count ?? row.active;
  }
  return row.api_count ?? row.active;
}

function ManualCountEditor({
  platform,
  storedCount,
  updatedAt,
  tr,
  onSaved,
}: {
  platform: SocialFollowersManualPlatform;
  storedCount: number | null;
  updatedAt: string | null;
  tr: Record<string, string>;
  onSaved: () => Promise<void>;
}) {
  const [value, setValue] = useState(storedCount != null ? String(storedCount) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(storedCount != null ? String(storedCount) : "");
  }, [storedCount]);

  const save = async () => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError(tr.adm_followers_manual_invalid);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveAdminFollowersManualCount(platform, Math.floor(parsed));
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.adm_followers_manual_save_fail);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 space-y-2">
      <label className="text-xs font-semibold text-gray-600 block">
        {tr.adm_followers_manual_label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? tr.adm_followers_manual_saving : tr.adm_followers_manual_save}
        </button>
        {updatedAt && (
          <span className="text-xs text-gray-500">
            {fillPlaceholders(tr.adm_followers_manual_updated, { date: formatDt(updatedAt) })}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function AdminFollowers() {
  const { t } = useMarket();
  const tr = t as Record<string, string>;

  const [activeTab, setActiveTab] = useState<SocialFollowerPlatform>("instagram");
  const [stats, setStats] = useState<AdminSocialFollowersStats | null>(null);
  const [manual, setManual] = useState<AdminSocialFollowersManualStats | null>(null);
  const [rows, setRows] = useState<AdminSocialFollowerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
          platform: activeTab,
          status,
          from: fromDate || undefined,
          to: toDate || undefined,
          page,
          limit: PAGE_SIZE,
        }),
      ]);
      setStats(statsRes.stats);
      setManual(statsRes.manual);
      setRows(listRes.rows);
      setTotal(listRes.total);
    } finally {
      setLoading(false);
    }
  }, [activeTab, status, fromDate, toDate, page]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, status, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tabStats = stats?.[activeTab];

  const runSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await syncAdminFollowers();
      const parts = [res.instagram, res.facebook, res.tiktok]
        .map((r) => `${r.platform}: ${r.message}`)
        .join(" · ");
      setMessage({ type: "ok", text: parts });
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

  const runExport = async () => {
    setExporting(true);
    setMessage(null);
    try {
      await downloadAdminFollowersCsv({
        platform: activeTab,
        status,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
    } catch (e) {
      setMessage({
        type: "err",
        text: e instanceof Error ? e.message : tr.adm_followers_export_fail,
      });
    } finally {
      setExporting(false);
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
          {activeTab === "instagram" && (
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
          )}
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

      {/* Summary dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TABS.map((p) => {
          const row = stats?.[p];
          const Icon = TAB_ICON[p];
          const followers = displayFollowerCount(p, stats, manual);
          const unfollowedMonth = row?.unfollowed_this_month ?? 0;
          return (
            <div
              key={p}
              className={`bg-white rounded-2xl border p-4 ${
                activeTab === p ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <Icon size={14} />
                {platformLabel(p, tr)}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {fillPlaceholders(tr.adm_followers_summary_line, {
                  followers: String(followers),
                  unfollowed: String(unfollowedMonth),
                })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Platform tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((p) => {
          const Icon = TAB_ICON[p];
          return (
            <button
              key={p}
              type="button"
              onClick={() => setActiveTab(p)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === p
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon size={16} />
              {platformLabel(p, tr)}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-gray-900">
              {displayFollowerCount(activeTab, stats, manual)}
            </p>
            <p className="text-xs text-gray-500">{tr.adm_followers_tab_total}</p>
            {tabStats?.api_count != null && tabStats.api_count !== tabStats.active && (
              <p className="text-xs text-gray-400 mt-0.5">
                {fillPlaceholders(tr.adm_followers_stat_api, { count: String(tabStats.api_count) })}
              </p>
            )}
            {activeTab === "tiktok" && manual?.tiktok.count != null && tabStats?.api_count == null && (
              <p className="text-xs text-gray-400 mt-0.5">
                {fillPlaceholders(tr.adm_followers_stat_manual, { count: String(manual.tiktok.count) })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={runExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={14} />
            {exporting ? tr.adm_followers_exporting : tr.adm_followers_export}
          </button>
        </div>

        {activeTab === "tiktok" && (
          <ManualCountEditor
            platform="tiktok"
            storedCount={manual?.tiktok.count ?? null}
            updatedAt={manual?.tiktok.updated_at ?? null}
            tr={tr}
            onSaved={fetchAll}
          />
        )}

        {activeTab === "facebook" && (
          <div className="rounded-xl border border-gray-100 p-4 space-y-3">
            <div>
              <p className="text-sm font-bold text-gray-900">{tr.adm_followers_facebook_personal_title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{tr.adm_followers_facebook_personal_hint}</p>
            </div>
            {manual?.facebook_personal.count != null && (
              <p className="text-xl font-black text-gray-900">{manual.facebook_personal.count}</p>
            )}
            <ManualCountEditor
              platform="facebook_personal"
              storedCount={manual?.facebook_personal.count ?? null}
              updatedAt={manual?.facebook_personal.updated_at ?? null}
              tr={tr}
              onSaved={fetchAll}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-end">
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

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="p-3">{tr.adm_followers_col_user}</th>
                <th className="p-3">{tr.adm_followers_col_id}</th>
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
                    <td className="p-3 text-gray-600 font-mono text-xs">{r.follower_id ?? "—"}</td>
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
          <div className="flex items-center justify-between text-sm">
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
