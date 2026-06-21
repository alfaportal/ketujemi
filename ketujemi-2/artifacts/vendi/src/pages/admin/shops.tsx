import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetCategories } from "@workspace/api-client-react";
import {
  approveAdminShopApplication,
  createAdminShop,
  deleteAdminShop,
  getAdminShopApplications,
  rejectAdminShopApplication,
  updateAdminShop,
  updateAdminShopApplication,
  type AdminShopApplication,
} from "@/lib/admin-api";
import {
  ShopEditForm,
  adminRowToFormValues,
  type ShopEditFormValues,
} from "@/components/shop-edit-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  defaultSubcategoryForCategory,
  guessDirectoryCategoryFromListingSlug,
} from "@/lib/shop-directory-taxonomy";
import {
  fetchShopDirectoryTaxonomy,
  staticShopDirectoryTaxonomy,
  type ShopDirectoryTaxonomyCategory,
} from "@/lib/shop-directory-api";
import { Loader2, Plus, RefreshCw, Store } from "lucide-react";
import { cn } from "@/lib/utils";

type DirectoryDraft = { categoryId: number; subcategoryId: number };

const BLANK_SHOP_CREATE: ShopEditFormValues = {
  shop_name: "",
  logo_url: "",
  description: "",
  category: "",
  category_id: null,
  directory_category_id: null,
  directory_subcategory_id: null,
  country: "XK",
  city: "",
  region: "",
  address: "",
  latitude: null,
  longitude: null,
  facebook: "",
  instagram: "",
  tiktok: "",
  whatsapp: "",
  website: "",
  contact_name: "",
  phone: "",
  email: "",
  admin_notes: "",
};

function statusBadge(status: string) {
  if (status === "approved") return "bg-green-100 text-green-800";
  if (status === "pending") return "bg-amber-100 text-amber-900";
  if (status === "rejected") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-700";
}

export default function AdminShops() {
  const [rows, setRows] = useState<AdminShopApplication[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [directoryDrafts, setDirectoryDrafts] = useState<Record<number, DirectoryDraft>>({});
  const [taxonomy, setTaxonomy] = useState<ShopDirectoryTaxonomyCategory[]>([]);
  const [editRow, setEditRow] = useState<AdminShopApplication | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createInitial, setCreateInitial] = useState<ShopEditFormValues>(BLANK_SHOP_CREATE);
  const [deleteRow, setDeleteRow] = useState<AdminShopApplication | null>(null);
  const { data: categories } = useGetCategories();

  const categorySlugById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categories ?? []) {
      if (c.id != null && c.slug) map.set(c.id, c.slug);
    }
    return map;
  }, [categories]);

  const taxonomyBySlug = useMemo(() => {
    const map = new Map<string, ShopDirectoryTaxonomyCategory>();
    for (const cat of taxonomy) map.set(cat.slug, cat);
    return map;
  }, [taxonomy]);

  useEffect(() => {
    void fetchShopDirectoryTaxonomy().then(setTaxonomy);
  }, []);

  function openCreateShop() {
    const source = taxonomy.length > 0 ? taxonomy : staticShopDirectoryTaxonomy();
    const cat = source[0];
    const sub = cat?.subcategories[0];
    setCreateInitial({
      ...BLANK_SHOP_CREATE,
      directory_category_id: cat?.id && cat.id > 0 ? cat.id : null,
      directory_subcategory_id: sub?.id && sub.id > 0 ? sub.id : null,
      directory_category_slug: cat?.slug ?? null,
      directory_subcategory_slug: sub?.slug ?? null,
    });
    setCreateOpen(true);
  }

  function defaultDirectoryDraft(row: AdminShopApplication): DirectoryDraft {
    const listingSlug = row.category_id ? categorySlugById.get(row.category_id) : null;
    const categorySlug =
      row.directory_category_slug ??
      guessDirectoryCategoryFromListingSlug(listingSlug) ??
      "biznes-sherbime";
    const subcategorySlug =
      row.directory_subcategory_slug ?? defaultSubcategoryForCategory(categorySlug) ?? "";

    const cat =
      taxonomyBySlug.get(categorySlug) ??
      taxonomy.find((c) => c.slug === categorySlug) ??
      taxonomy[0];
    const sub =
      cat?.subcategories.find((s) => s.slug === subcategorySlug) ?? cat?.subcategories[0];

    return {
      categoryId: row.directory_category_id ?? cat?.id ?? 0,
      subcategoryId: row.directory_subcategory_id ?? sub?.id ?? 0,
    };
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminShopApplications();
      setRows(data.applications);
      setStats(data.stats);
      const drafts: Record<number, DirectoryDraft> = {};
      for (const row of data.applications) {
        if (row.status === "pending") drafts[row.id] = defaultDirectoryDraft(row);
      }
      setDirectoryDrafts(drafts);
    } finally {
      setLoading(false);
    }
  }, [categorySlugById, taxonomy, taxonomyBySlug]);

  useEffect(() => {
    void load();
  }, [load]);

  function subcategoriesForCategoryId(categoryId: number) {
    return taxonomy.find((c) => c.id === categoryId)?.subcategories ?? [];
  }

  async function onApprove(id: number) {
    setBusyId(id);
    const draft = directoryDrafts[id];
    try {
      await approveAdminShopApplication(id, {
        directory_category_id: draft?.categoryId,
        directory_subcategory_id: draft?.subcategoryId,
      });
      setToast("Dyqani u aprovua.");
      await load();
    } catch {
      setToast("Gabim gjatë aprovimit.");
    } finally {
      setBusyId(null);
    }
  }

  async function onCreateShop(values: ShopEditFormValues) {
    setCreateSaving(true);
    try {
      const result = await createAdminShop(values);
      setCreateOpen(false);
      setToast(`Dyqani u krijua (#${result.shop_id}). Shfaqet në /dyqanet.`);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gabim gjatë krijimit të dyqanit.";
      setToast(msg);
    } finally {
      setCreateSaving(false);
    }
  }

  async function onSaveEdit(values: ShopEditFormValues) {
    if (!editRow) return;
    setEditSaving(true);
    try {
      if (editRow.shop_id) {
        await updateAdminShop(editRow.shop_id, values);
      } else {
        await updateAdminShopApplication(editRow.id, values);
      }
      setEditRow(null);
      setToast("Dyqani u përditësua.");
      await load();
    } catch {
      setToast("Gabim gjatë përditësimit.");
    } finally {
      setEditSaving(false);
    }
  }

  async function onConfirmDelete(row: AdminShopApplication) {
    if (!row.shop_id) {
      setToast("Gabim gjatë fshirjes.");
      setDeleteRow(null);
      return;
    }
    setBusyId(row.shop_id);
    try {
      await deleteAdminShop(row.shop_id);
      setDeleteRow(null);
      setRows((prev) => prev.filter((r) => r.shop_id !== row.shop_id));
      setStats((prev) => ({
        pending: prev.pending - (row.status === "pending" ? 1 : 0),
        approved: prev.approved - (row.status === "approved" ? 1 : 0),
        rejected: prev.rejected - (row.status === "rejected" ? 1 : 0),
      }));
      setToast("Dyqani u fshi me sukses.");
    } catch {
      setToast("Gabim gjatë fshirjes.");
    } finally {
      setBusyId(null);
    }
  }

  async function onReject(id: number) {
    setBusyId(id);
    try {
      await rejectAdminShopApplication(id, rejectReason);
      setRejectId(null);
      setRejectReason("");
      setToast("Kërkesa u refuzua.");
      await load();
    } catch {
      setToast("Gabim gjatë refuzimit.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-blue-700" />
          <h2 className="text-xl font-bold text-gray-900">Dyqanet</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateShop}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold min-h-10"
          >
            <Plus size={16} /> Dyqan i ri
          </button>
          <button type="button" onClick={() => void load()} className="p-2 rounded-lg hover:bg-gray-100 min-h-10 min-w-10">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {toast ? (
        <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2" role="status">
          {toast}
        </p>
      ) : null}

      <p className="text-sm text-gray-500">
        Dyqanet janë veçmas nga shpalljet e thjeshta: shfaqen vetëm në{" "}
        <a href="/dyqanet" target="_blank" rel="noreferrer" className="text-blue-600 underline">
          /dyqanet
        </a>
        . Shpalljet e dyqanit shtohen këtu me «Shpallje» dhe shfaqen te faqja e dyqanit — jo te
        marketplace i përgjithshëm.
      </p>

      <div className="flex gap-3 text-sm">
        <span className="px-3 py-1 rounded-full bg-amber-100">Në pritje: {stats.pending}</span>
        <span className="px-3 py-1 rounded-full bg-green-100">Aprovuar: {stats.approved}</span>
        <span className="px-3 py-1 rounded-full bg-red-100">Refuzuar: {stats.rejected}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const draft = directoryDrafts[row.id] ?? defaultDirectoryDraft(row);
            const subcategories = subcategoriesForCategoryId(draft.categoryId);

            return (
              <article key={row.id} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-start gap-4">
                  <img src={row.logo_url} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-900">{row.shop_name}</h3>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", statusBadge(row.status))}>
                        {row.status}
                      </span>
                      {row.shop_id ? (
                        <a
                          href={`/dyqani/${row.shop_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 underline"
                        >
                          Shiko dyqanin
                        </a>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-600">
                      {row.category} · {row.city}, {row.country}
                      {row.shop_id ? ` · ${row.listing_count ?? 0} shpallje` : null}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{row.description}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  <span>
                    Kontakt: {row.contact_name} · {row.phone}
                  </span>
                  <span>Email: {row.email}</span>
                  <span>
                    Adresa: {row.address}, {row.region}
                  </span>
                  {row.facebook ? <span>FB: {row.facebook}</span> : null}
                  {row.instagram ? <span>IG: {row.instagram}</span> : null}
                  {row.website ? <span>Web: {row.website}</span> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                  {row.shop_id && row.status === "approved" ? (
                    <a
                      href={`/listings/new?adminPost=1&shopId=${row.shop_id}`}
                      className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold min-h-10 shadow-sm inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Shpallje
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setEditRow(row)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold min-h-10 shadow-sm"
                  >
                    ✏️ Edito
                  </button>
                  <button
                    type="button"
                    disabled={busyId === row.shop_id}
                    onClick={() => setDeleteRow(row)}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold min-h-10 shadow-sm"
                  >
                    🗑️ Fshi
                  </button>
                </div>
                {row.admin_notes ? (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-semibold">Shënime admin:</span> {row.admin_notes}
                  </p>
                ) : null}
                {row.status === "pending" ? (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <label className="text-xs text-gray-600 space-y-1">
                        <span>Kategoria e direktorisë</span>
                        <select
                          className="w-full border rounded-lg px-2 py-2 text-sm min-h-10"
                          value={draft.categoryId || ""}
                          onChange={(e) => {
                            const categoryId = Number(e.target.value);
                            const cat = taxonomy.find((c) => c.id === categoryId);
                            const firstSub = cat?.subcategories[0];
                            setDirectoryDrafts((prev) => ({
                              ...prev,
                              [row.id]: {
                                categoryId,
                                subcategoryId: firstSub?.id ?? 0,
                              },
                            }));
                          }}
                        >
                          {taxonomy.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.emoji} {c.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs text-gray-600 space-y-1">
                        <span>Nënkategoria</span>
                        <select
                          className="w-full border rounded-lg px-2 py-2 text-sm min-h-10"
                          value={draft.subcategoryId || ""}
                          onChange={(e) => {
                            const subcategoryId = Number(e.target.value);
                            setDirectoryDrafts((prev) => ({
                              ...prev,
                              [row.id]: {
                                categoryId: prev[row.id]?.categoryId ?? draft.categoryId,
                                subcategoryId,
                              },
                            }));
                          }}
                        >
                          {subcategories.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => void onApprove(row.id)}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold min-h-10"
                      >
                        Aprovo
                      </button>
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => setRejectId(row.id)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold min-h-10"
                      >
                        Refuzo
                      </button>
                    </div>
                  </div>
                ) : null}
                {rejectId === row.id ? (
                  <div className="space-y-2 pt-2 border-t">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Arsyeja e refuzimit (opsionale)"
                      className="w-full border rounded-lg p-2 text-sm min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void onReject(row.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg"
                      >
                        Konfirmo refuzimin
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectId(null)}
                        className="px-3 py-1.5 text-sm rounded-lg border"
                      >
                        Anulo
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Shto dyqan të ri</DialogTitle>
          </DialogHeader>
          <ShopEditForm
            key={createOpen ? `create-${createInitial.directory_category_id ?? 0}` : "closed"}
            initial={createInitial}
            onSubmit={onCreateShop}
            onCancel={() => setCreateOpen(false)}
            saving={createSaving}
            showAdminNotes
            labels={{
              save: "Krijo dyqanin",
              cancel: "Anulo",
              adminNotes: "Shënime të brendshme (admin)",
              directoryCategory: "Kategoria e direktorisë",
              directorySubcategory: "Nënkategoria",
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRow} onOpenChange={(open) => !open && setEditRow(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edito dyqanin — {editRow?.shop_name}</DialogTitle>
          </DialogHeader>
          {editRow ? (
            <ShopEditForm
              initial={adminRowToFormValues(editRow)}
              onSubmit={onSaveEdit}
              onCancel={() => setEditRow(null)}
              saving={editSaving}
              showStatus
              showAdminNotes
              labels={{
                save: "Ruaj",
                cancel: "Anulo",
                status: "Statusi",
                adminNotes: "Shënime të brendshme (admin)",
                directoryCategory: "Kategoria e direktorisë",
                directorySubcategory: "Nënkategoria",
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteRow != null} onOpenChange={(open) => !open && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fshi dyqanin?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteRow
                ? `A jeni i sigurt që dëshironi ta fshini dyqanin '${deleteRow.shop_name}'? Ky veprim do të fshijë dyqanin dhe të gjitha shpalljet e tij.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300">
              Anulo
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteRow && void onConfirmDelete(deleteRow)}
            >
              Po, fshije
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
