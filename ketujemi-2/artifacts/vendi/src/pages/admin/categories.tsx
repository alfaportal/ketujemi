import { useEffect, useState } from "react";
import {
  getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory,
  type AdminCategory,
} from "@/lib/admin-api";
import { Plus, Pencil, Trash2, X, ChevronRight, Tag, RefreshCw } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { fillPlaceholders } from "@/lib/app-extra-i18n";

interface EditState { id: number | null; name: string; slug: string; icon: string; parent_id: string }

const BLANK: EditState = { id: null, name: "", slug: "", icon: "Tag", parent_id: "" };

const ICON_OPTIONS = [
  "Car","Home","Smartphone","Laptop","Sofa","Shirt","Baby","Dumbbell","Briefcase","Tractor",
  "GraduationCap","Music","PawPrint","Tv","Package","Tag","Truck","Wrench","ShoppingBag","Globe",
];

export default function AdminCategories() {
  const { t } = useMarket();
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const reload = () => {
    setLoading(true);
    getAdminCategories().then(setCats).finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, []);

  const parentCats = cats.filter((c) => !c.parent_id);
  const childrenOf = (id: number) => cats.filter((c) => c.parent_id === id);

  const openCreate = (parentId?: number) => {
    setEditing({ ...BLANK, parent_id: parentId ? String(parentId) : "" });
  };

  const openEdit = (cat: AdminCategory) => {
    setEditing({ id: cat.id, name: cat.name, slug: cat.slug ?? "", icon: cat.icon, parent_id: cat.parent_id ? String(cat.parent_id) : "" });
  };

  const save = async () => {
    if (!editing) return;
    if (editing.id) {
      await updateAdminCategory(editing.id, { name: editing.name, slug: editing.slug || undefined, icon: editing.icon });
    } else {
      await createAdminCategory({
        name: editing.name,
        slug: editing.slug || undefined,
        icon: editing.icon || "Tag",
        parent_id: editing.parent_id ? parseInt(editing.parent_id, 10) : undefined,
      });
    }
    setEditing(null);
    reload();
  };

  const handleDelete = async (id: number) => {
    await deleteAdminCategory(id);
    setConfirmDelete(null);
    reload();
  };

  const deletingCat = confirmDelete !== null ? cats.find((c) => c.id === confirmDelete) : undefined;

  const modalTitle =
    editing === null ? "" :
    editing.id ? t.adm_cat_ttl_edit :
    editing.parent_id ? t.adm_cat_ttl_addSub :
    t.adm_cat_ttl_newTop;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900">{t.adm_cat_head}</h2>
          <p className="text-sm text-gray-400">{fillPlaceholders(t.adm_cat_top, { n: parentCats.length.toLocaleString() })}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={reload} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
            <RefreshCw size={14} /> {t.adm_cat_refresh}
          </button>
          <button
            type="button"
            onClick={() => openCreate()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus size={15} /> {t.adm_cat_new}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-16 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {parentCats.map((cat) => {
            const children = childrenOf(cat.id);
            return (
              <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Tag size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900">{cat.name}</div>
                    <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{t.adm_cat_icon}: {cat.icon}</span>
                      {cat.slug && <span>· {t.adm_cat_slugFld}: {cat.slug}</span>}
                      <span className="text-blue-500">· {cat.listing_count ?? 0} {t.adm_cat_lc}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openCreate(cat.id)}
                      title={t.adm_cat_tip_addSubBtn}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus size={12} /> {t.adm_cat_addSub}
                    </button>
                    <button type="button" onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(cat.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {children.length > 0 && (
                  <div className="border-t border-gray-50 px-5 py-3 space-y-2">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{t.adm_cat_subsection}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {children.map((child) => (
                        <div key={child.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                          <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700 flex-1 truncate">{child.name}</span>
                          <span className="text-xs text-gray-400">{child.listing_count ?? 0}</span>
                          <button type="button" onClick={() => openEdit(child)} className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0">
                            <Pencil size={12} />
                          </button>
                          <button type="button" onClick={() => setConfirmDelete(child.id)} className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{modalTitle}</h3>
              <button type="button" onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="adm-cat-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t.adm_cat_nameReq}</label>
                <input
                  id="adm-cat-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder={t.adm_cat_namePh}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>
              <div>
                <label htmlFor="adm-cat-slug" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t.adm_cat_slugFld}</label>
                <input
                  id="adm-cat-slug"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder={t.adm_cat_slugPh}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>
              <div>
                <label htmlFor="adm-cat-icon" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t.adm_cat_icnFld}</label>
                <select
                  id="adm-cat-icon"
                  value={editing.icon}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                >
                  {ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </div>
              {!editing.id && (
                <div>
                  <label htmlFor="adm-cat-parent" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{t.adm_cat_parent}</label>
                  <select
                    id="adm-cat-parent"
                    value={editing.parent_id}
                    onChange={(e) => setEditing({ ...editing, parent_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="">{t.adm_cat_noneTop}</option>
                    {parentCats.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                {t.adm_btn_cancel}
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!editing.name.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {editing.id ? t.saveChanges : t.adm_cat_create}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">
              {deletingCat ? fillPlaceholders(t.adm_cat_del_q, { name: deletingCat.name }) : t.adm_cat_del_btn}
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-left">{t.adm_cat_modal_body}</p>
            <p className="text-xs text-gray-400 mb-6 text-left">{t.adm_cat_warn_sub}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">{t.adm_btn_cancel}</button>
              <button type="button" onClick={() => handleDelete(confirmDelete)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">{t.adm_cat_del_btn}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
