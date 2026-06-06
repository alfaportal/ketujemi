import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetCategories } from "@workspace/api-client-react";
import {
  approveAdminShopApplication,
  getAdminShopApplications,
  rejectAdminShopApplication,
  type AdminShopApplication,
} from "@/lib/admin-api";
import {
  defaultSubcategoryForCategory,
  guessDirectoryCategoryFromListingSlug,
} from "@/lib/shop-directory-taxonomy";
import {
  fetchShopDirectoryTaxonomy,
  type ShopDirectoryTaxonomyCategory,
} from "@/lib/shop-directory-api";
import { Loader2, RefreshCw, Store } from "lucide-react";
import { cn } from "@/lib/utils";

type DirectoryDraft = { categoryId: number; subcategoryId: number };

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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-blue-700" />
          <h2 className="text-xl font-bold text-gray-900">Dyqanet</h2>
        </div>
        <button type="button" onClick={() => void load()} className="p-2 rounded-lg hover:bg-gray-100">
          <RefreshCw size={18} />
        </button>
      </div>

      {toast ? <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2">{toast}</p> : null}

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
    </div>
  );
}
