import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAdminShop,
  getAdminShopApplications,
  updateAdminShop,
  type AdminShopApplication,
} from "@/lib/admin-api";
import { ShopPublicLinkCopy } from "@/components/shop-public-link-copy";
import { shopPublicAbsoluteUrl, shopPublicPath, copyTextToClipboard } from "@/lib/shop-public-url";
import { SHOP_DIRECTORY_CATEGORIES } from "@/lib/shop-directory-taxonomy";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type DraftRow = {
  shop_name: string;
  slug: string;
  phone: string;
  whatsapp: string;
};

const EMPTY_DRAFT: DraftRow = {
  shop_name: "",
  slug: "",
  phone: "",
  whatsapp: "",
};

const PLACEHOLDER_LOGO =
  "https://res.cloudinary.com/ddwebeeek/image/upload/v1779999301/ketujemi-logo_jerh6s.png";

function approvedShops(rows: AdminShopApplication[]): AdminShopApplication[] {
  return rows.filter((r) => r.status === "approved" && r.shop_id);
}

export default function AdminShopLinks() {
  const { toast } = useToast();
  const [rows, setRows] = useState<AdminShopApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<DraftRow>(EMPTY_DRAFT);
  const [edits, setEdits] = useState<
    Record<number, { slug: string; phone: string; whatsapp: string }>
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminShopApplications();
      setRows(data.applications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approved = useMemo(() => approvedShops(rows), [rows]);

  function rowEdits(row: AdminShopApplication) {
    const id = row.shop_id!;
    if (edits[id]) return edits[id];
    return {
      slug: row.slug ?? "",
      phone: row.phone ?? "",
      whatsapp: row.whatsapp ?? "",
    };
  }

  function patchEdit(
    row: AdminShopApplication,
    patch: Partial<{ slug: string; phone: string; whatsapp: string }>,
  ) {
    const id = row.shop_id!;
    setEdits((prev) => ({
      ...prev,
      [id]: { ...rowEdits(row), ...patch },
    }));
  }

  async function saveRow(row: AdminShopApplication) {
    if (!row.shop_id) return;
    const id = row.shop_id;
    const e = rowEdits(row);
    setSavingId(id);
    try {
      await updateAdminShop(id, {
        slug: e.slug.trim() || null,
        phone: e.phone.trim(),
        whatsapp: e.whatsapp.trim() || null,
      });
      toast({ title: "U ruajt" });
      await load();
      setEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      toast({
        title: "Gabim",
        description: err instanceof Error ? err.message : "Ruajtja dështoi",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.shop_name.trim() || !draft.phone.trim()) {
      toast({ title: "Plotësoni emrin dhe telefonin", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const cat = SHOP_DIRECTORY_CATEGORIES[0];
      const sub = cat?.subcategories[0];
      await createAdminShop({
        shop_name: draft.shop_name.trim(),
        logo_url: PLACEHOLDER_LOGO,
        description: draft.shop_name.trim(),
        directory_category_slug: cat?.slug ?? "biznes-sherbime",
        directory_subcategory_slug: sub?.slug ?? "dyqane-te-pergjithshme",
        country: "XK",
        city: "Prishtinë",
        region: "Prishtinë",
        address: "—",
        contact_name: "Admin",
        phone: draft.phone.trim(),
        email: "admin@ketujemi.com",
        whatsapp: draft.whatsapp.trim() || draft.phone.trim(),
        slug: draft.slug.trim() || undefined,
      });
      toast({ title: "Linku u krijua" });
      setDraft(EMPTY_DRAFT);
      setShowAdd(false);
      await load();
    } catch (err) {
      toast({
        title: "Gabim",
        description: err instanceof Error ? err.message : "Krijimi dështoi",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  async function copyPhone(phone: string) {
    const ok = await copyTextToClipboard(phone.trim());
    toast({
      title: ok ? "Telefoni u kopjua" : "Kopjimi dështoi",
      variant: ok ? "default" : "destructive",
    });
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Linka dyqanesh</h2>
        <p className="text-sm text-gray-500 mt-1">
          Një rresht për çdo link — slug, telefon, WhatsApp dhe kopjim me një klik. Pa kufizim.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-h-11" onClick={() => setShowAdd((v) => !v)}>
          <Plus size={16} className="mr-2" />
          Shto link të ri
        </Button>
        <Button type="button" variant="outline" className="min-h-11" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={16} className={cn("mr-2", loading && "animate-spin")} />
          Rifresko
        </Button>
      </div>

      {showAdd ? (
        <form
          onSubmit={(e) => void onCreate(e)}
          className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-gray-900">Link i ri</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Emri i dyqanit *</Label>
              <Input
                value={draft.shop_name}
                onChange={(e) => setDraft((d) => ({ ...d, shop_name: e.target.value }))}
                className="min-h-11 bg-white"
                placeholder="Mobileria Rinia"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (URL)</Label>
              <Input
                value={draft.slug}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  }))
                }
                className="min-h-11 bg-white font-mono text-sm"
                placeholder="mobileria-rinia"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telefoni *</Label>
              <Input
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                className="min-h-11 bg-white"
                placeholder="+38344123456"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>WhatsApp (Porosit)</Label>
              <Input
                value={draft.whatsapp}
                onChange={(e) => setDraft((d) => ({ ...d, whatsapp: e.target.value }))}
                className="min-h-11 bg-white"
                placeholder="+38344123456"
              />
            </div>
          </div>
          {draft.slug.trim() ? (
            <p className="text-xs text-blue-700 font-mono">
              Preview: {shopPublicAbsoluteUrl(shopPublicPath({ slug: draft.slug }) ?? "")}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="min-h-11" disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Krijo linkun"}
            </Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setShowAdd(false)}>
              Anulo
            </Button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : approved.length === 0 ? (
        <p className="text-sm text-gray-500 rounded-xl border border-dashed border-gray-200 p-8 text-center">
          Nuk ka linke ende. Kliko «Shto link të ri».
        </p>
      ) : (
        <div className="space-y-3">
          {approved.map((row) => {
            const id = row.shop_id!;
            const e = rowEdits(row);
            const path = shopPublicPath({ slug: e.slug || row.slug, shopId: id, publicPath: row.public_path });
            return (
              <article
                key={id}
                className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-gray-900">{row.shop_name}</h3>
                  {path ? (
                    <ShopPublicLinkCopy
                      variant="inline"
                      slug={e.slug || row.slug}
                      shopId={id}
                      publicPath={row.public_path}
                      shopName={row.shop_name}
                    />
                  ) : null}
                </div>
                <div className="grid sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Slug</Label>
                    <Input
                      value={e.slug}
                      onChange={(ev) =>
                        patchEdit(row, {
                          slug: ev.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                        })
                      }
                      className="min-h-10 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Telefoni</Label>
                    <Input
                      value={e.phone}
                      onChange={(ev) => patchEdit(row, { phone: ev.target.value })}
                      className="min-h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">WhatsApp</Label>
                    <Input
                      value={e.whatsapp}
                      onChange={(ev) => patchEdit(row, { whatsapp: ev.target.value })}
                      className="min-h-10"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-10"
                    disabled={savingId === id}
                    onClick={() => void saveRow(row)}
                  >
                    {savingId === id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ruaj"}
                  </Button>
                  {e.phone.trim() ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="min-h-10"
                      onClick={() => void copyPhone(e.phone)}
                    >
                      Kopjo telefonin
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
