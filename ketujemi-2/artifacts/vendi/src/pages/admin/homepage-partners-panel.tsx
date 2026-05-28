import { useCallback, useEffect, useState } from "react";
import {
  createAdminHomepagePartner,
  deleteAdminHomepagePartner,
  getAdminHomepagePartners,
  updateAdminHomepagePartner,
  type AdminHomepagePartner,
} from "@/lib/admin-api";
import { Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminHomepagePartnersPanel() {
  const [partners, setPartners] = useState<AdminHomepagePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [tier, setTier] = useState<"vip" | "standard">("standard");

  const [editRow, setEditRow] = useState<AdminHomepagePartner | null>(null);
  const [editName, setEditName] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editTier, setEditTier] = useState<"vip" | "standard">("standard");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminHomepagePartners();
      setPartners(data.partners ?? []);
    } catch {
      setToast({ type: "err", text: "S’u ngarkuan partnerët e homepage." });
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

  function openEdit(p: AdminHomepagePartner) {
    setEditRow(p);
    setEditName(p.business_name);
    setEditLogo(p.logo_url);
    setEditLink(p.link_url);
    setEditTier(p.tier === "vip" ? "vip" : "standard");
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createAdminHomepagePartner({
        business_name: businessName.trim(),
        logo_url: logoUrl.trim(),
        link_url: linkUrl.trim(),
        tier,
      });
      setBusinessName("");
      setLogoUrl("");
      setLinkUrl("");
      setTier("standard");
      setToast({ type: "ok", text: "Partneri u shtua në homepage." });
      await load();
    } catch (err) {
      setToast({
        type: "err",
        text: err instanceof Error ? err.message : "Shtimi dështoi.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editRow) return;
    setSaving(true);
    try {
      await updateAdminHomepagePartner(editRow.id, {
        business_name: editName.trim(),
        logo_url: editLogo.trim(),
        link_url: editLink.trim(),
        tier: editTier,
      });
      setToast({ type: "ok", text: "Partneri u përditësua." });
      setEditRow(null);
      await load();
    } catch (err) {
      setToast({
        type: "err",
        text: err instanceof Error ? err.message : "Përditësimi dështoi.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Fshini këtë partner nga homepage?")) return;
    setBusyId(id);
    try {
      await deleteAdminHomepagePartner(id);
      setToast({ type: "ok", text: "Partneri u fshi." });
      await load();
    } catch {
      setToast({ type: "err", text: "Fshirja dështoi." });
    } finally {
      setBusyId(null);
    }
  }

  const vipList = partners.filter((p) => p.tier === "vip");
  const standardList = partners.filter((p) => p.tier !== "vip");

  return (
    <section className="rounded-2xl border border-[#1A56A0]/25 bg-gradient-to-br from-blue-50/80 to-white p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="text-base font-black text-gray-900">Partnerë në homepage</h3>
        <p className="text-xs text-gray-600 mt-1">
          Logo, emër dhe link për seksionin «Partnerët tanë të besuar». VIP = logo më e madhe,
          border i artë; Partner = border blu.
        </p>
      </div>

      {toast ? (
        <div
          className={cn(
            "rounded-xl px-3 py-2 text-sm font-medium border",
            toast.type === "ok"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800",
          )}
        >
          {toast.text}
        </div>
      ) : null}

      <form onSubmit={(e) => void handleAdd(e)} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-bold text-gray-800">Shto partner të ri</p>
        <input
          type="text"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Emri i firmës"
          className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-base"
        />
        <input
          type="url"
          required
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="URL e logos (https://…)"
          className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-base"
        />
        <input
          type="url"
          required
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="Linku i firmës (https://…)"
          className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-base"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTier("standard")}
            className={cn(
              "min-h-11 rounded-xl border-2 font-bold text-sm",
              tier === "standard"
                ? "border-[#1A56A0] bg-blue-50 text-[#1A56A0]"
                : "border-gray-200 text-gray-600",
            )}
          >
            Partner
          </button>
          <button
            type="button"
            onClick={() => setTier("vip")}
            className={cn(
              "min-h-11 rounded-xl border-2 font-bold text-sm inline-flex items-center justify-center gap-1",
              tier === "vip"
                ? "border-amber-500 bg-amber-50 text-amber-900"
                : "border-gray-200 text-gray-600",
            )}
          >
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
            VIP Partner
          </button>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full min-h-12 rounded-xl bg-[#1A56A0] text-white font-bold flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          Shto në homepage
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          <PartnerList
            title="VIP Partner"
            items={vipList}
            busyId={busyId}
            onEdit={openEdit}
            onDelete={handleDelete}
            vip
          />
          <PartnerList
            title="Partner"
            items={standardList}
            busyId={busyId}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {editRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form
            onSubmit={(e) => void handleEditSave(e)}
            className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-gray-900">Ndrysho partnerin</h3>
              <button
                type="button"
                onClick={() => setEditRow(null)}
                className="min-h-10 min-w-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
                aria-label="Mbyll"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 truncate">{editRow.business_name}</p>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Emri i firmës"
              className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-base"
            />
            <input
              type="url"
              required
              value={editLogo}
              onChange={(e) => setEditLogo(e.target.value)}
              placeholder="URL e logos"
              className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-base"
            />
            <input
              type="url"
              required
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              placeholder="Linku i firmës"
              className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-base"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEditTier("standard")}
                className={cn(
                  "min-h-11 rounded-xl border-2 font-bold text-sm",
                  editTier === "standard"
                    ? "border-[#1A56A0] bg-blue-50 text-[#1A56A0]"
                    : "border-gray-200 text-gray-600",
                )}
              >
                Partner
              </button>
              <button
                type="button"
                onClick={() => setEditTier("vip")}
                className={cn(
                  "min-h-11 rounded-xl border-2 font-bold text-sm inline-flex items-center justify-center gap-1",
                  editTier === "vip"
                    ? "border-amber-500 bg-amber-50 text-amber-900"
                    : "border-gray-200 text-gray-600",
                )}
              >
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
                VIP
              </button>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full min-h-12 rounded-xl bg-[#1A56A0] text-white font-bold flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Ruaj ndryshimet"}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function PartnerList({
  title,
  items,
  busyId,
  onEdit,
  onDelete,
  vip = false,
}: {
  title: string;
  items: AdminHomepagePartner[];
  busyId: number | null;
  onEdit: (p: AdminHomepagePartner) => void;
  onDelete: (id: number) => void;
  vip?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "text-xs font-black uppercase tracking-wider mb-2",
          vip ? "text-amber-700" : "text-[#1A56A0]",
        )}
      >
        {title} ({items.length})
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">Asnjë — plotësohen automatikisht nga bizneset aktive.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li
              key={p.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 bg-white",
                vip ? "border-amber-300/80" : "border-[#1A56A0]/40",
              )}
            >
              <div
                className={cn(
                  "rounded-lg overflow-hidden flex items-center justify-center shrink-0 bg-white",
                  vip ? "w-16 h-16 border-2 border-amber-400" : "w-12 h-12 border-2 border-[#1A56A0]/60",
                )}
              >
                <img src={p.logo_url} alt="" className="max-w-full max-h-full object-contain p-1" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-gray-900 truncate">{p.business_name}</p>
                <p className="text-xs text-gray-500 truncate">{p.link_url}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  disabled={busyId === p.id}
                  onClick={() => onEdit(p)}
                  className="min-h-10 min-w-10 flex items-center justify-center rounded-lg border border-blue-200 text-[#1A56A0] hover:bg-blue-50"
                  aria-label="Ndrysho"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={busyId === p.id}
                  onClick={() => void onDelete(p.id)}
                  className="min-h-10 min-w-10 flex items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                  aria-label="Fshi"
                >
                  {busyId === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
