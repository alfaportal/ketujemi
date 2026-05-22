import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminListingPackagePurchases,
  type AdminListingPackagePurchase,
} from "@/lib/admin-api";
import { CreditCard, Loader2, RefreshCw, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type PkgFilter = "all" | "s" | "m" | "l";

export default function AdminPayments() {
  const [rows, setRows] = useState<AdminListingPackagePurchase[]>([]);
  const [revenueMonth, setRevenueMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PkgFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminListingPackagePurchases(
        filter === "all" ? undefined : filter,
      );
      setRows(data.purchases);
      setRevenueMonth(data.revenue_month_eur);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.user_email ?? "").toLowerCase().includes(q) ||
        r.activation_code.toLowerCase().includes(q) ||
        (r.user_name ?? "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const filters: { id: PkgFilter; label: string }[] = [
    { id: "all", label: "Të gjitha" },
    { id: "s", label: "Paketa S" },
    { id: "m", label: "Paketa M" },
    { id: "l", label: "Paketa L" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-[#1A56A0]" />
            Pagesat
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Paketat e shpalljeve ·{" "}
            <span className="font-bold text-emerald-700">
              €{revenueMonth.toFixed(2)} këtë muaj
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="min-h-11 min-w-11 flex items-center justify-center rounded-xl border border-gray-200 bg-white"
          aria-label="Rifresko"
        >
          <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Email, kod, emër…"
          className="w-full min-h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-base"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex-shrink-0 min-h-10 px-4 rounded-full text-sm font-bold border",
              filter === f.id
                ? "bg-[#1A56A0] text-white border-[#1A56A0]"
                : "bg-white text-gray-600 border-gray-200",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12 text-sm">Nuk ka blerje ende.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="bg-white rounded-xl border border-gray-100 p-4 text-sm space-y-1"
            >
              <div className="flex justify-between gap-2">
                <span className="font-bold text-gray-900">{p.package_label}</span>
                <span className="font-black text-emerald-700">€{p.amount_eur}</span>
              </div>
              <p className="text-gray-600 truncate">
                {p.user_email ?? `User #${p.user_id}`}
                {p.user_name ? ` · ${p.user_name}` : ""}
              </p>
              <p className="font-mono text-xs bg-gray-50 rounded px-2 py-1 inline-block">
                {p.activation_code}
              </p>
              <p className="text-xs text-gray-500">
                {p.status === "paid" ? "Paguar" : p.status}
                {p.purchased_at
                  ? ` · ${format(new Date(p.purchased_at), "dd.MM.yyyy HH:mm")}`
                  : ""}
                {p.expires_at ? ` · skadon ${format(new Date(p.expires_at), "dd.MM.yyyy")}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
