import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  createAdminListing,
  getAdminCategories,
  type AdminCategory,
} from "@/lib/admin-api";
import { useMarket } from "@/lib/market-context";
import { fillPlaceholders } from "@/lib/app-extra-i18n";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const COND_OPTIONS = ["New", "Good", "Used", "Damaged"] as const;

export function AdminListingCreatePanel({ open, onClose, onCreated }: Props) {
  const { t } = useMarket();
  const tx = t as Record<string, string>;
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("Prishtinë");
  const [condition, setCondition] = useState<(typeof COND_OPTIONS)[number]>("Used");
  const [sellerName, setSellerName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoadingCats(true);
    void getAdminCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, [open]);

  const categoryOptions = useMemo(() => {
    const byId = new Map(categories.map((c) => [c.id, c]));
    return categories
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "sq"))
      .map((c) => {
        const parent = c.parent_id ? byId.get(c.parent_id) : null;
        const label = parent ? `${parent.name} → ${c.name}` : c.name;
        return { id: c.id, label };
      });
  }, [categories]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("0");
    setCategoryId("");
    setLocation("Prishtinë");
    setCondition("Used");
    setSellerName("");
    setSellerPhone("");
    setImageUrl("");
    setError(null);
    setCreatedId(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreatedId(null);

    const cat = Number(categoryId);
    if (!title.trim() || title.trim().length < 3) {
      setError(tx.adm_post_err_title);
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError(tx.adm_post_err_desc);
      return;
    }
    if (!cat || cat < 1) {
      setError(tx.adm_post_err_category);
      return;
    }
    if (!location.trim()) {
      setError(tx.adm_post_err_location);
      return;
    }
    if (!sellerName.trim() || sellerName.trim().length < 2) {
      setError(tx.adm_post_err_seller_name);
      return;
    }
    if (sellerPhone.replace(/\D/g, "").length < 8) {
      setError(tx.adm_post_err_seller_phone);
      return;
    }

    setBusy(true);
    try {
      const row = await createAdminListing({
        title: title.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        category_id: cat,
        location: location.trim(),
        condition,
        seller_name: sellerName.trim(),
        seller_phone: sellerPhone.trim(),
        image_url: imageUrl.trim() || undefined,
      });
      setCreatedId(row.id);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : tx.adm_post_err_generic);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={tx.adm_post_close}
        onClick={handleClose}
      />
      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-xl"
        role="dialog"
        aria-labelledby="adm-post-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3">
          <h3 id="adm-post-title" className="text-lg font-black text-gray-900">
            {tx.adm_post_title}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label={tx.adm_post_close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-4 space-y-3">
          <p className="text-sm text-violet-900 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 leading-snug">
            {tx.adm_post_intro}
          </p>

          {createdId ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-900 space-y-2">
              <p className="font-bold">{tx.adm_post_success}</p>
              <a
                href={`/listings/${createdId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-semibold text-blue-700 hover:underline"
              >
                {fillPlaceholders(tx.adm_post_view_listing, { id: createdId })}
              </a>
              <button
                type="button"
                className="block text-sm font-semibold text-gray-700 hover:underline"
                onClick={() => {
                  resetForm();
                }}
              >
                {tx.adm_post_another}
              </button>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl px-3 py-2" role="alert">
              {error}
            </p>
          ) : null}

          <label className="block space-y-1">
            <span className="text-xs font-bold text-gray-700">{tx.adm_post_lbl_title}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="Golf 7.5 2.0 TDI GTD"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-gray-700">{tx.adm_post_lbl_desc}</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-y"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-bold text-gray-700">{tx.adm_post_lbl_price}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold text-gray-700">{tx.adm_post_lbl_condition}</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as (typeof COND_OPTIONS)[number])}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white"
              >
                {COND_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-gray-700">{tx.adm_post_lbl_category}</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loadingCats}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white"
            >
              <option value="">{loadingCats ? "…" : tx.adm_post_pick_category}</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-gray-700">{tx.adm_post_lbl_location}</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-100">
            <label className="block space-y-1">
              <span className="text-xs font-bold text-gray-700">{tx.adm_post_lbl_seller_name}</span>
              <input
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold text-gray-700">{tx.adm_post_lbl_seller_phone}</span>
              <input
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                placeholder="+383…"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-gray-700">{tx.adm_post_lbl_images}</span>
            <textarea
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono text-xs resize-y"
              placeholder="https://…, https://…"
            />
            <p className="text-[11px] text-gray-500">{tx.adm_post_images_hint}</p>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-11 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm inline-flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {tx.adm_post_submit}
          </button>
        </form>
      </div>
    </div>
  );
}
