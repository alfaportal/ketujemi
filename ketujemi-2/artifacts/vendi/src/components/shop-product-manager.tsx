import { useEffect, useMemo, useState } from "react";
import { Loader2, Package, Plus, Pencil, Trash2 } from "lucide-react";
import { useGetCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useToast } from "@/hooks/use-toast";
import { useShopProductsCopy } from "@/lib/shop-products-i18n";
import { SHOP_PRODUCT_BLOCKED_LISTING_ROOT_SLUGS } from "@/lib/shop-storefront-policy";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { translateCategory } from "@/lib/category-translations";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import { parseListingImageUrls } from "@/lib/listing-images";
import type { ShopProductPublic } from "@/components/shop-product-card";
import { ShopProductPhotoUpload } from "@/components/shop-product-photo-upload";

type ProductForm = {
  title: string;
  description: string;
  price: string;
  compare_at_price: string;
  category_id: string;
  collection: string;
  image_urls: string[];
  sku: string;
};

const emptyForm = (): ProductForm => ({
  title: "",
  description: "",
  price: "",
  compare_at_price: "",
  category_id: "",
  collection: "",
  image_urls: [],
  sku: "",
});

type Props = {
  changeToken: string | null;
  storefrontEligible: boolean;
  onProductsChange?: () => void;
};

export function ShopProductManager({ changeToken, storefrontEligible, onProductsChange }: Props) {
  const c = useShopProductsCopy();
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const { toast } = useToast();
  const { data: allCategories } = useGetCategories();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ShopProductPublic[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(() => {
    if (!allCategories?.length) return [];
    return allCategories
      .filter((cat) => {
        if (cat.parent_id != null) return false;
        const slug = cat.slug?.trim();
        return slug && !SHOP_PRODUCT_BLOCKED_LISTING_ROOT_SLUGS.has(slug);
      })
      .map((cat) => ({
        id: cat.id,
        label: translateCategory(cat.name, locale),
      }));
  }, [allCategories, locale]);

  function loadProducts() {
    setLoading(true);
    void fetchWithTimeout("/api/shops/me/products", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("fail");
        return r.json() as Promise<{ products: ShopProductPublic[] }>;
      })
      .then((res) => setProducts(res.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (storefrontEligible) loadProducts();
    else setLoading(false);
  }, [storefrontEligible]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(product: ShopProductPublic) {
    setEditingId(product.id);
    setForm({
      title: product.title === "Produkt" ? "" : product.title,
      description: product.description.startsWith("Produkt nga dyqani") ? "" : product.description,
      price: product.price > 0 ? String(product.price) : "",
      compare_at_price: product.compare_at_price != null ? String(product.compare_at_price) : "",
      category_id: String(product.category_id),
      collection: product.collection ?? "",
      image_urls: product.image_urls?.length
        ? product.image_urls
        : parseListingImageUrls(product.image_url ?? null),
      sku: product.sku ?? "",
    });
    setDialogOpen(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!changeToken) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        profile_change_token: changeToken,
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price.trim() ? Number(form.price) : 0,
        compare_at_price: form.compare_at_price.trim() ? Number(form.compare_at_price) : null,
        image_urls: form.image_urls,
        collection: form.collection.trim() || null,
        sku: form.sku.trim() || null,
      };
      if (form.category_id) body.category_id = Number(form.category_id);

      const url = editingId ? `/api/shops/me/products/${editingId}` : "/api/shops/me/products";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetchWithTimeout(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const payload = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(payload.message ?? "fail");
      toast({ title: c.productSaved });
      setDialogOpen(false);
      loadProducts();
      onProductsChange?.();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : c.productError,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(productId: number) {
    if (!changeToken) return;
    try {
      const res = await fetchWithTimeout(`/api/shops/me/products/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profile_change_token: changeToken }),
      });
      if (!res.ok) throw new Error("fail");
      toast({ title: c.productDeleted });
      loadProducts();
      onProductsChange?.();
    } catch {
      toast({ title: c.productError, variant: "destructive" });
    }
  }

  if (!storefrontEligible) return null;

  return (
    <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" style={{ color: BRAND_BLUE }} />
            <h3 className="font-bold text-gray-900">{c.manageProducts}</h3>
          </div>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{c.autoListingHint}</p>
        </div>
        <Button
          type="button"
          size="sm"
          className="font-semibold text-white shrink-0"
          style={{ backgroundColor: BRAND_BLUE }}
          onClick={openCreate}
          disabled={!changeToken}
        >
          <Plus size={16} className="mr-1" />
          {c.addProduct}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-600 bg-white/70 rounded-xl px-4 py-3 border border-indigo-50">
          {c.noProductsOwner}
        </p>
      ) : (
        <div className="space-y-2">
          {products.map((product) => {
            const thumb =
              product.image_urls?.[0] ?? product.image_url ?? null;
            return (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-xl border border-white bg-white/90 px-3 py-2 shadow-sm"
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover border border-gray-100"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                    🛍️
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{product.title}</p>
                  {product.collection ? (
                    <p className="text-xs text-gray-500 truncate">{product.collection}</p>
                  ) : null}
                  <p className="text-sm text-blue-700 font-bold">
                    {product.price > 0 ? `€${product.price}` : c.priceOnRequest}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(product)}>
                  <Pencil size={16} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="text-red-600">
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{c.deleteProduct}</AlertDialogTitle>
                      <AlertDialogDescription>{product.title}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anulo</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => void onDelete(product.id)}
                      >
                        {c.deleteProduct}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? c.editProduct : c.addProduct}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-gray-500 -mt-2">{c.productFormHint}</p>
          <form className="space-y-4" onSubmit={onSave}>
            <ShopProductPhotoUpload
              urls={form.image_urls}
              onChange={(image_urls) => setForm((f) => ({ ...f, image_urls }))}
            />

            <div className="space-y-1">
              <Label>{c.productTitle}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={c.productTitlePlaceholder}
              />
            </div>

            <div className="space-y-1">
              <Label>{c.productCollection}</Label>
              <Input
                value={form.collection}
                onChange={(e) => setForm((f) => ({ ...f, collection: e.target.value }))}
                placeholder={c.productCollectionPlaceholder}
              />
            </div>

            <div className="space-y-1">
              <Label>{c.productDescription}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={c.productDescriptionPlaceholder}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>{c.productPrice}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label>{c.productComparePrice}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.compare_at_price}
                  onChange={(e) => setForm((f) => ({ ...f, compare_at_price: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>{c.productCategory}</Label>
              <Select
                value={form.category_id || "__none__"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category_id: v === "__none__" ? "" : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={c.selectCategoryOptional} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{c.selectCategoryOptional}</SelectItem>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{c.productCategoryHint}</p>
            </div>

            <div className="space-y-1">
              <Label>{c.productSku}</Label>
              <Input
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              />
            </div>

            <Button type="submit" className="w-full min-h-11" disabled={saving || !changeToken}>
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : c.saveProduct}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
