import { useEffect, useState, useCallback } from "react";
import { getAdminListings, updateAdminListing, deleteAdminListing, type AdminListing } from "@/lib/admin-api";
import {
  Search, Star, StarOff, Trash2, Pencil, X, Check, RefreshCw, ChevronLeft, ChevronRight, Plus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMarket } from "@/lib/market-context";
import { dateFnsLocale, fillPlaceholders } from "@/lib/app-extra-i18n";
import { primaryListingImageUrl } from "@/lib/listing-images";
import { AdminListingCreatePanel } from "@/components/admin-listing-create-panel";

function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const map: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[color]}`}>
      {children}
    </span>
  );
}

interface EditState {
  id: number;
  title: string;
  price: string;
  location: string;
  condition: string;
}

export default function AdminListings() {
  const { t, market } = useMarket();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timerId);
  }, [search]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminListings({ search: debouncedSearch, page, limit: PAGE_SIZE });
      setListings(data.listings);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const toggleFeature = async (l: AdminListing) => {
    await updateAdminListing(l.id, { is_featured: !l.is_featured });
    fetchListings();
  };

  const handleDelete = async (id: number) => {
    await deleteAdminListing(id);
    setConfirmDelete(null);
    fetchListings();
  };

  const startEdit = (l: AdminListing) => {
    setEditing({ id: l.id, title: l.title, price: String(l.price), location: l.location, condition: l.condition });
  };

  const saveEdit = async () => {
    if (!editing) return;
    await updateAdminListing(editing.id, {
      title: editing.title,
      price: Number(editing.price),
      location: editing.location,
      condition: editing.condition,
    });
    setEditing(null);
    fetchListings();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const conditionColor: Record<string, string> = {
    New: "green", Good: "blue", Used: "amber", Damaged: "red",
  };

  function conditionApiLabel(condition: string) {
    switch (condition) {
      case "New": return t.adm_cond_new;
      case "Good": return t.adm_cond_good;
      case "Used": return t.adm_cond_used;
      case "Damaged": return t.adm_cond_damage;
      default: return condition;
    }
  }

  const condOptions = ["New", "Good", "Used", "Damaged"] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900">{t.adm_list_title}</h2>
          <p className="text-sm text-gray-400">{fillPlaceholders(t.adm_list_total, { n: total.toLocaleString() })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2.5 rounded-xl transition-all"
            title={t.adm_list_post_new_hint as string}
          >
            <Plus size={16} /> {t.adm_list_post_new}
          </button>
          <button type="button" onClick={fetchListings} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
            <RefreshCw size={14} /> {t.adm_list_refresh}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder={t.adm_list_searchPh}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-gray-50 focus:bg-white transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{t.adm_list_col_listing}</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">{t.adm_list_col_seller}</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{t.adm_list_col_price}</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">{t.adm_list_col_condition}</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">{t.adm_list_col_loc}</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden xl:table-cell">{t.adm_list_col_date}</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{t.adm_list_col_featured}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{t.adm_list_col_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-3">
                      <div className="h-5 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    {t.adm_list_empty}
                  </td>
                </tr>
              ) : (
                listings.map((l) => {
                  const thumb = primaryListingImageUrl(l.image_url);
                  return (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 truncate max-w-[180px]">{l.title}</div>
                          <div className="text-xs text-gray-400">#{l.id} · {fillPlaceholders(t.adm_list_views, { n: String(l.views) })}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="font-medium text-gray-700">{l.seller_name}</div>
                      <div className="text-xs text-gray-400">{l.seller_phone}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">€{l.price.toLocaleString()}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge color={conditionColor[l.condition] ?? "gray"}>{conditionApiLabel(l.condition)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{l.location}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden xl:table-cell">
                      {formatDistanceToNow(new Date(l.created_at), { addSuffix: true, locale: dateFnsLocale(market.code) })}
                    </td>
                    <td className="px-4 py-3">
                      {l.is_featured ? (
                        <Badge color="amber">{t.adm_list_feat}</Badge>
                      ) : (
                        <Badge color="gray">{t.adm_list_regular}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleFeature(l)}
                          title={l.is_featured ? t.adm_tip_unfeature : t.adm_tip_feature}
                          className={`p-1.5 rounded-lg transition-colors ${l.is_featured ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:bg-gray-100"}`}
                        >
                          {l.is_featured ? <StarOff size={14} /> : <Star size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(l)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          title={t.adm_tip_edit}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(l.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title={t.adm_tip_delete}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 gap-3 flex-wrap">
            <span className="text-xs text-gray-400">
              {fillPlaceholders(t.adm_list_page, { cur: page, total: totalPages })}
              {" · "}
              {fillPlaceholders(t.adm_list_total, { n: total.toLocaleString() })}
            </span>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{fillPlaceholders(t.adm_modal_edit, { id: `#${editing.id}` })}</h3>
              <button type="button" onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="adm-edit-title" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t.adm_lbl_title}</label>
                <input
                  id="adm-edit-title"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full min-h-12 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="adm-edit-price" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t.adm_lbl_priceEuro}</label>
                  <input
                    id="adm-edit-price"
                    type="number"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                    className="w-full min-h-12 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  />
                </div>
                <div>
                  <label htmlFor="adm-edit-cond" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t.adm_lbl_condition}</label>
                  <select
                    id="adm-edit-cond"
                    value={editing.condition}
                    onChange={(e) => setEditing({ ...editing, condition: e.target.value })}
                    className="w-full min-h-12 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    {condOptions.map((c) => (
                      <option key={c} value={c}>{conditionApiLabel(c)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="adm-edit-loc" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t.adm_lbl_location}</label>
                <input
                  id="adm-edit-loc"
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  className="w-full min-h-12 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 min-h-12 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                {t.adm_btn_cancel}
              </button>
              <button type="button" onClick={saveEdit} className="flex-1 min-h-12 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">{t.adm_modal_del_title}</h3>
            <p className="text-sm text-gray-500 mb-6">{t.adm_modal_del_body}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                {t.adm_btn_cancel}
              </button>
              <button type="button" onClick={() => handleDelete(confirmDelete)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">
                {t.adm_btn_delete}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminListingCreatePanel
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchListings}
      />
    </div>
  );
}
