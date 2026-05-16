import { useEffect, useState } from "react";
import { getAdminReports, updateAdminReport, deleteAdminReport, type AdminReport } from "@/lib/admin-api";
import { AlertTriangle, Check, X, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMarket } from "@/lib/market-context";
import { dateFnsLocale, fillPlaceholders } from "@/lib/app-extra-i18n";

const FILTERS = ["all", "pending", "reviewed", "dismissed", "removed"] as const;
type ReportFilter = (typeof FILTERS)[number];

function reportStatusTranslation(t: Record<string, string>, status: string): string {
  const map: Record<string, string | undefined> = {
    pending: t.adm_rep_st_pending,
    reviewed: t.adm_rep_st_reviewed,
    dismissed: t.adm_rep_st_dismissed,
    removed: t.adm_rep_st_removed,
  };
  return map[status] ?? status;
}

function filterTabKey(f: ReportFilter): string {
  switch (f) {
    case "all": return "adm_rep_f_all";
    case "pending": return "adm_rep_f_pending";
    case "reviewed": return "adm_rep_f_reviewed";
    case "dismissed": return "adm_rep_f_dismissed";
    case "removed": return "adm_rep_f_removed";
    default: return "adm_rep_f_all";
  }
}

function StatusBadge({ status, t }: { status: string; t: Record<string, string> }) {
  const color: Record<string, string> = {
    pending:   "bg-amber-100 text-amber-700",
    reviewed:  "bg-blue-100 text-blue-700",
    dismissed: "bg-gray-100 text-gray-500",
    removed:   "bg-red-100 text-red-700",
  };
  const label = reportStatusTranslation(t, status);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color[status] ?? color.pending}`}>
      {label}
    </span>
  );
}

export default function AdminReports() {
  const { t, market } = useMarket();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportFilter>("all");

  const reload = () => {
    setLoading(true);
    getAdminReports().then(setReports).finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, []);

  const handleStatus = async (id: number, status: string) => {
    await updateAdminReport(id, status);
    reload();
  };

  const handleDelete = async (id: number) => {
    await deleteAdminReport(id);
    reload();
  };

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900">{t.adm_rep_moderate}</h2>
          <p className="text-sm text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-1">
            {fillPlaceholders(t.adm_rep_total, { n: reports.length.toLocaleString() })}
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                {fillPlaceholders(t.adm_rep_pending, { n: pendingCount })}
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500 mt-2">{t.adm_rep_intro}</p>
        </div>
        <button type="button" onClick={reload} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all self-start">
          <RefreshCw size={14} /> {t.adm_list_refresh}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-fit max-w-full">
        {FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none min-h-[40px] sm:min-h-0 ${
              filter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t[filterTabKey(s)]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-20 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} className="text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">
            {filter === "all"
              ? t.adm_rep_none
              : fillPlaceholders(t.adm_rep_none_status, {
                status: reportStatusTranslation(t, filter),
              })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                r.status === "pending" ? "border-amber-200" : "border-gray-100"
              }`}
            >
              <div className="flex items-start gap-4 p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  r.status === "pending" ? "bg-amber-100" : "bg-gray-100"
                }`}>
                  <AlertTriangle size={18} className={r.status === "pending" ? "text-amber-600" : "text-gray-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-gray-900">{r.listing_title}</span>
                    <StatusBadge status={r.status} t={t} />
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{t.adm_rep_reason_lbl}</span> {r.reason}
                  </div>
                  <div className="text-xs text-gray-400">
                    {fillPlaceholders(t.adm_rep_reportedFmt, { name: r.reporter_name })}
                    {" · "}{formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: dateFnsLocale(market.code) })}
                    {" · "}
                    <a href={`/listings/${r.listing_id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-blue-500 hover:underline">
                      {t.adm_rep_view} <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {r.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatus(r.id, "reviewed")}
                        title={t.adm_rep_tip_mark_reviewed}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatus(r.id, "removed")}
                        title={t.adm_rep_tip_remove_list}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  {r.status !== "pending" && (
                    <button
                      type="button"
                      onClick={() => handleStatus(r.id, "dismissed")}
                      title={t.adm_rep_tip_dismiss}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    title={t.adm_rep_tip_del_report}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
