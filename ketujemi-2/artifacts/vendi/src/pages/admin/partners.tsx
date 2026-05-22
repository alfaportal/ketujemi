import { useCallback, useEffect, useMemo, useState } from "react";
import {
  activateAdminBusiness,
  blockAdminBusiness,
  deactivateAdminBusiness,
  getAdminBusinesses,
  type AdminBusinessAccount,
} from "@/lib/admin-api";
import {
  Ban,
  Building2,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMarket } from "@/lib/market-context";
import { dateFnsLocale } from "@/lib/app-extra-i18n";
import { cn } from "@/lib/utils";

type Filter = "all" | "pending" | "active" | "blocked";

function statusBadge(status: string | null) {
  if (status === "active") return "bg-green-100 text-green-800 border-green-200";
  if (status === "pending") return "bg-amber-100 text-amber-900 border-amber-200";
  if (status === "blocked") return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function paymentBadge(payment: AdminBusinessAccount["payment"]) {
  if (!payment) return "bg-gray-100 text-gray-600";
  if (payment.status === "paid") return "bg-emerald-100 text-emerald-800";
  if (payment.status === "pending") return "bg-orange-100 text-orange-800";
  return "bg-gray-100 text-gray-600";
}

export default function AdminPartners() {
  const { market } = useMarket();
  const [rows, setRows] = useState<AdminBusinessAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await getAdminBusinesses());
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

  const pendingCount = rows.filter((r) => r.business_status === "pending").length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.business_status !== filter) return false;
      if (!q) return true;
      return (
        (r.business_name ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.phone_e164_digits ?? "").includes(q)
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
    { id: "pending", label: "Në pritje", count: pendingCount },
    { id: "active", label: "Aktivë" },
    { id: "blocked", label: "Bllokuar" },
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
            {rows.length} regjistruar
            {pendingCount > 0 ? ` · ${pendingCount} në pritje` : ""}
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
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-amber-400 text-amber-950 text-[10px]">
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
          {filtered.map((b) => {
            const isVip = b.business_tier === "vip";
            const busy = busyId === b.id;
            return (
              <li
                key={b.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                        isVip ? "bg-amber-100" : "bg-blue-100",
                      )}
                    >
                      {isVip ? (
                        <Star className="h-5 w-5 text-amber-600 fill-amber-400" />
                      ) : (
                        <Building2 className="h-5 w-5 text-[#1A56A0]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {b.business_name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {b.package_label ?? (isVip ? "VIP Partner" : "Partner")}
                        {" · "}
                        {formatDistanceToNow(new Date(b.created_at), {
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
                        statusBadge(b.business_status),
                      )}
                    >
                      {b.business_status === "active"
                        ? "Aktiv"
                        : b.business_status === "pending"
                          ? "Në pritje"
                          : b.business_status === "blocked"
                            ? "Bllokuar"
                            : b.business_status ?? "—"}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-lg",
                        paymentBadge(b.payment),
                      )}
                    >
                      {b.payment?.label ?? "Pa pagesë"}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    {b.email ? (
                      <p className="flex items-center gap-2 min-w-0">
                        <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="truncate">{b.email}</span>
                      </p>
                    ) : (
                      <p className="text-amber-700 text-xs font-medium">Pa email — nuk dërgohet aktivizimi</p>
                    )}
                    {b.phone_e164_digits ? (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                        +{b.phone_e164_digits}
                      </p>
                    ) : null}
                    {b.partner_activation_code ? (
                      <p className="text-xs font-mono bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100">
                        Kodi: <strong>{b.partner_activation_code}</strong>
                        {b.partner_activation_sent_at ? " · email dërguar" : ""}
                      </p>
                    ) : null}
                    {b.partner_link_url ? (
                      <p className="text-xs text-[#1A56A0] truncate">
                        Link: {b.partner_link_type} → {b.partner_link_url}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 pt-1">
                    {b.business_status === "pending" ? (
                      <button
                        type="button"
                        disabled={busy || !b.email}
                        onClick={() =>
                          void (async () => {
                            setBusyId(b.id);
                            try {
                              const res = await activateAdminBusiness(b.id);
                              const msg = res.email_sent
                                ? `Aktivizuar. Kodi ${res.partner_activation_code ?? ""} u dërgua me email.`
                                : res.email_error
                                  ? `Aktivizuar, por emaili dështoi: ${res.email_error}`
                                  : "Aktivizuar.";
                              setToast({ type: "ok", text: msg });
                              await load();
                            } catch (e) {
                              setToast({
                                type: "err",
                                text: e instanceof Error ? e.message : "Aktivizimi dështoi.",
                              });
                            } finally {
                              setBusyId(null);
                            }
                          })()
                        }
                        className="min-h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold touch-manipulation"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Aktivizo
                      </button>
                    ) : null}
                    {b.business_status === "active" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(
                            b.id,
                            () => deactivateAdminBusiness(b.id),
                            "Partneri u çaktivizua.",
                          )
                        }
                        className="min-h-12 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-900 text-sm font-bold touch-manipulation"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Çaktivizo
                      </button>
                    ) : null}
                    {b.business_status !== "blocked" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(
                            b.id,
                            () => blockAdminBusiness(b.id),
                            "Partneri u bllokua.",
                          )
                        }
                        className="min-h-12 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 text-red-800 text-sm font-bold touch-manipulation"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                        Blloko
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy || !b.email}
                        onClick={() =>
                          void runAction(
                            b.id,
                            () => activateAdminBusiness(b.id),
                            "Partneri u riaktivizua.",
                          )
                        }
                        className="min-h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white text-sm font-bold touch-manipulation"
                      >
                        Riaktivizo
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
