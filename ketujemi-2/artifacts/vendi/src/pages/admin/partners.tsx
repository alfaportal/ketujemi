import { useCallback, useEffect, useMemo, useState } from "react";
import {
  changeAdminPartnerPackage,
  getAdminPartnerApplications,
  reactivateAdminPartner,
  rejectAdminPartner,
  suspendAdminPartner,
  type AdminPartnerApplication,
  type AdminPartnerApplicationsResponse,
} from "@/lib/admin-api";
import { PARTNER_CONTRACT_TEXT } from "@/lib/partner-contract-text";
import {
  Ban,
  Building2,
  Eye,
  FileText,
  Loader2,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useMarket } from "@/lib/market-context";
import { dateFnsLocale } from "@/lib/app-extra-i18n";
import { cn } from "@/lib/utils";

type Filter = "all" | "pending" | "active" | "suspended" | "rejected";

function statusBadge(status: string) {
  if (status === "active") return "bg-green-100 text-green-800 border-green-200";
  if (status === "pending") return "bg-amber-100 text-amber-900 border-amber-200";
  if (status === "suspended") return "bg-orange-100 text-orange-900 border-orange-200";
  if (status === "rejected") return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function paymentBadge(paymentStatus: string) {
  if (paymentStatus === "paid") return "bg-emerald-100 text-emerald-800";
  if (paymentStatus === "pending") return "bg-orange-100 text-orange-800";
  return "bg-gray-100 text-gray-600";
}

function statusLabel(status: string) {
  if (status === "active") return "Aktiv";
  if (status === "pending") return "Në pritje";
  if (status === "suspended") return "Pezulluar";
  if (status === "rejected") return "Refuzuar";
  return status;
}

export default function AdminPartners() {
  const { market } = useMarket();
  const [data, setData] = useState<AdminPartnerApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [contractRow, setContractRow] = useState<AdminPartnerApplication | null>(null);
  const [rejectRow, setRejectRow] = useState<AdminPartnerApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [packageRow, setPackageRow] = useState<AdminPartnerApplication | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getAdminPartnerApplications());
    } catch {
      setToast({ type: "err", text: "S’u ngarkua lista e partnerëve." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const rows = data?.applications ?? [];
  const stats = data?.stats ?? { pending: 0, active: 0, suspended: 0, rejected: 0 };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "pending") {
        if (!(r.status === "pending" && r.payment_status !== "paid")) return false;
      } else if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return (
        r.business_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.contact_name.toLowerCase().includes(q)
      );
    });
  }, [rows, search, filter]);

  async function runAction(id: number, fn: () => Promise<unknown>, okMsg: string) {
    setBusyId(id);
    try {
      await fn();
      setToast({ type: "ok", text: okMsg });
      await load();
    } catch (e) {
      setToast({
        type: "err",
        text: e instanceof Error ? e.message : "Veprimi dështoi.",
      });
    } finally {
      setBusyId(null);
    }
  }

  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: "all", label: "Të gjithë" },
    { id: "pending", label: "Në pritje", count: stats.pending },
    { id: "active", label: "Aktiv", count: stats.active },
    { id: "suspended", label: "Pezulluar", count: stats.suspended },
    { id: "rejected", label: "Refuzuar", count: stats.rejected },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#1A56A0]" aria-hidden />
            Partnerët
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Aktivizimi automatik pas pagesës Stripe — vetëm veprime manuale këtu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="min-h-11 min-w-11 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 touch-manipulation"
          aria-label="Rifresko"
        >
          <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(
          [
            ["Në pritje", stats.pending, "text-amber-800 bg-amber-50 border-amber-200"],
            ["Aktiv", stats.active, "text-green-800 bg-green-50 border-green-200"],
            ["Pezulluar", stats.suspended, "text-orange-800 bg-orange-50 border-orange-200"],
            ["Refuzuar", stats.rejected, "text-red-800 bg-red-50 border-red-200"],
          ] as const
        ).map(([label, count, cls]) => (
          <div key={label} className={cn("rounded-xl border px-3 py-2.5 text-center", cls)}>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</p>
            <p className="text-2xl font-black">{count}</p>
          </div>
        ))}
      </div>

      {toast ? (
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-medium border",
            toast.type === "ok"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800",
          )}
        >
          {toast.text}
        </div>
      ) : null}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kërko emër, email, telefon…"
          className="w-full min-h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-base outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex-shrink-0 min-h-10 px-4 rounded-full text-sm font-bold border transition-colors touch-manipulation",
              filter === f.id
                ? "bg-[#1A56A0] text-white border-[#1A56A0]"
                : "bg-white text-gray-600 border-gray-200",
            )}
          >
            {f.label}
            {f.count != null && f.count > 0 ? (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-white/25 text-[10px]">
                {f.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Nuk u gjet asnjë partner.</div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => {
            const isVip = p.package === "vip";
            const busy = busyId === p.id;
            return (
              <li
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden",
                        isVip ? "bg-amber-100" : "bg-blue-100",
                      )}
                    >
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" className="w-full h-full object-contain" />
                      ) : isVip ? (
                        <Star className="h-5 w-5 text-amber-600 fill-amber-400" />
                      ) : (
                        <Building2 className="h-5 w-5 text-[#1A56A0]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{p.business_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.package_label} · {p.contact_name} · #
                        {formatDistanceToNow(new Date(p.created_at), {
                          addSuffix: true,
                          locale: dateFnsLocale(market.code),
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "text-xs font-bold uppercase px-2.5 py-1 rounded-lg border",
                        statusBadge(p.status),
                      )}
                    >
                      {statusLabel(p.status)}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-lg",
                        paymentBadge(p.payment_status),
                      )}
                    >
                      {p.payment_label}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="truncate">
                      <span className="font-medium text-gray-700">Email:</span> {p.email}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Tel:</span> {p.phone}
                    </p>
                    <p className="font-mono text-xs break-all">
                      <span className="font-medium text-gray-700 font-sans">IBAN:</span> {p.iban}
                    </p>
                    <p className="text-xs truncate">
                      <span className="font-medium text-gray-700">Link:</span> {p.link_url}
                    </p>
                    {p.last_payment_at ? (
                      <p className="text-xs text-gray-500">
                        Pagesa e fundit: {format(new Date(p.last_payment_at), "dd.MM.yyyy HH:mm")}
                      </p>
                    ) : null}
                    {p.rejected_reason ? (
                      <p className="text-xs text-red-700 bg-red-50 rounded-lg px-2 py-1">
                        Refuzuar: {p.rejected_reason}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setContractRow(p)}
                      className="min-h-11 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 touch-manipulation"
                    >
                      <Eye className="h-4 w-4" />
                      Shiko Kontratën
                    </button>
                    <button
                      type="button"
                      disabled={busy || p.status === "rejected"}
                      onClick={() => setPackageRow(p)}
                      className="min-h-11 flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 text-[#1A56A0] text-sm font-bold touch-manipulation"
                    >
                      <Pencil className="h-4 w-4" />
                      Ndrysho Paketën
                    </button>
                    {p.status !== "rejected" && p.status !== "suspended" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setRejectRow(p)}
                        className="min-h-11 flex items-center justify-center gap-1.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-800 text-sm font-bold touch-manipulation"
                      >
                        <Ban className="h-4 w-4" />
                        Refuzo
                      </button>
                    ) : null}
                    {p.status === "active" || (p.status === "pending" && p.payment_status === "paid") ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(p.id, () => suspendAdminPartner(p.id), "Partneri u pezullua.")
                        }
                        className="min-h-11 flex items-center justify-center gap-1.5 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-900 text-sm font-bold touch-manipulation"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                        Pezullo
                      </button>
                    ) : null}
                    {p.status === "suspended" || p.status === "rejected" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(
                            p.id,
                            () => reactivateAdminPartner(p.id),
                            "Partneri u riaktivizua.",
                          )
                        }
                        className="col-span-2 min-h-11 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 text-white text-sm font-bold touch-manipulation"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        Riktivo
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {contractRow ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-h-[85vh] w-full max-w-lg overflow-hidden flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#1A56A0]" />
                Kontrata — {contractRow.business_name}
              </h3>
              <button type="button" onClick={() => setContractRow(null)} aria-label="Mbyll">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 text-sm">
              <p>
                <strong>Kontakt:</strong> {contractRow.contact_name} · {contractRow.email}
              </p>
              <p>
                <strong>IBAN:</strong> {contractRow.iban}
              </p>
              <p>
                <strong>Pranuar kushtet:</strong> {contractRow.accepted_terms ? "Po" : "Jo"} · IP:{" "}
                {contractRow.client_ip ?? "—"}
              </p>
              <pre
                className="whitespace-pre-wrap font-sans leading-relaxed border-t pt-3"
                style={{ fontSize: "11px", color: "#999" }}
              >
                {PARTNER_CONTRACT_TEXT}
              </pre>
            </div>
          </div>
        </div>
      ) : null}

      {rejectRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900">Refuzo — {rejectRow.business_name}</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Arsyeja e refuzimit…"
              className="w-full min-h-[100px] rounded-xl border border-gray-200 p-3 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 min-h-11 rounded-xl border font-bold"
                onClick={() => {
                  setRejectRow(null);
                  setRejectReason("");
                }}
              >
                Anulo
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || busyId === rejectRow.id}
                className="flex-1 min-h-11 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50"
                onClick={() =>
                  void runAction(
                    rejectRow.id,
                    () => rejectAdminPartner(rejectRow.id, rejectReason.trim()),
                    "Partneri u refuzua.",
                  ).then(() => {
                    setRejectRow(null);
                    setRejectReason("");
                  })
                }
              >
                Refuzo
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {packageRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900">Ndrysho paketën</h3>
            <p className="text-sm text-gray-600">{packageRow.business_name}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={busyId === packageRow.id}
                className={cn(
                  "min-h-12 rounded-xl border-2 font-bold text-sm",
                  packageRow.package === "standard"
                    ? "border-[#1A56A0] bg-blue-50 text-[#1A56A0]"
                    : "border-gray-200",
                )}
                onClick={() =>
                  void runAction(
                    packageRow.id,
                    () => changeAdminPartnerPackage(packageRow.id, "standard"),
                    "Paketa u ndryshua në Standard.",
                  ).then(() => setPackageRow(null))
                }
              >
                Standard €30
              </button>
              <button
                type="button"
                disabled={busyId === packageRow.id}
                className={cn(
                  "min-h-12 rounded-xl border-2 font-bold text-sm",
                  packageRow.package === "vip"
                    ? "border-amber-500 bg-amber-50 text-amber-900"
                    : "border-gray-200",
                )}
                onClick={() =>
                  void runAction(
                    packageRow.id,
                    () => changeAdminPartnerPackage(packageRow.id, "vip"),
                    "Paketa u ndryshua në VIP.",
                  ).then(() => setPackageRow(null))
                }
              >
                VIP €50
              </button>
            </div>
            <button
              type="button"
              className="w-full min-h-10 text-sm text-gray-500"
              onClick={() => setPackageRow(null)}
            >
              Mbyll
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
