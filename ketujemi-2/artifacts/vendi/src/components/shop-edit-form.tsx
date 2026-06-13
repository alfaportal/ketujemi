import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShopFormCopy } from "@/lib/shop-application-i18n";
import { citiesForShopCountry } from "@/lib/shop-application-locations";
import { fetchShopDirectoryTaxonomy, type ShopDirectoryTaxonomyCategory } from "@/lib/shop-directory-api";
import {
  translateDirectoryCategory,
  translateDirectorySubcategory,
} from "@/lib/shop-directory-i18n";
import { SHOP_DIRECTORY_CATEGORIES } from "@/lib/shop-directory-taxonomy";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import { ShopSocialUrlFields } from "@/components/shop-social-url-fields";
import {
  shopSocialFieldsForSubmit,
  shopSocialSuffix,
  type ShopSocialField,
} from "@/lib/shop-social-url-input";
import { ShopAddressAutocomplete } from "@/components/shop-address-autocomplete";

export type ShopEditFormValues = {
  shop_name: string;
  logo_url: string;
  description: string;
  category: string;
  category_id: number | null;
  directory_category_id: number | null;
  directory_subcategory_id: number | null;
  country: string;
  city: string;
  region: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  website: string;
  contact_name: string;
  phone: string;
  email: string;
  status?: string;
  admin_notes?: string;
};

type ShopEditFormProps = {
  initial: ShopEditFormValues;
  onSubmit: (values: ShopEditFormValues) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  showStatus?: boolean;
  showAdminNotes?: boolean;
  labels?: {
    save: string;
    cancel: string;
    status?: string;
    adminNotes?: string;
    directoryCategory?: string;
    directorySubcategory?: string;
  };
};

export function ShopEditForm({
  initial,
  onSubmit,
  onCancel,
  saving = false,
  showStatus = false,
  showAdminNotes = false,
  labels,
}: ShopEditFormProps) {
  const c = useShopFormCopy();
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const [taxonomy, setTaxonomy] = useState<ShopDirectoryTaxonomyCategory[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  const [values, setValues] = useState(initial);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  useEffect(() => {
    void fetchShopDirectoryTaxonomy()
      .then(setTaxonomy)
      .finally(() => setTaxonomyLoading(false));
  }, []);

  const cityOptions = citiesForShopCountry(values.country);

  const subcategories = useMemo(() => {
    return taxonomy.find((t) => t.id === values.directory_category_id)?.subcategories ?? [];
  }, [taxonomy, values.directory_category_id]);

  function setField<K extends keyof ShopEditFormValues>(key: K, value: ShopEditFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dirCat = taxonomy.find((t) => t.id === values.directory_category_id);
    const sub = subcategories.find((s) => s.id === values.directory_subcategory_id);
    const catDef = dirCat ? SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === dirCat.slug) : undefined;
    const categoryName =
      catDef && sub
        ? `${translateDirectoryCategory(catDef, locale)} · ${translateDirectorySubcategory({ slug: sub.slug, nameSq: sub.name }, locale)}`
        : values.category;
    const social = shopSocialFieldsForSubmit({
      facebook: values.facebook,
      instagram: values.instagram,
      tiktok: values.tiktok,
      whatsapp: values.whatsapp,
      website: values.website,
    });
    await onSubmit({
      ...values,
      category: categoryName,
      category_id: null,
      facebook: social.facebook ?? "",
      instagram: social.instagram ?? "",
      tiktok: social.tiktok ?? "",
      whatsapp: social.whatsapp ?? "",
      website: social.website ?? "",
    });
  }

  const saveLabel = labels?.save ?? c.submitBtn;
  const cancelLabel = labels?.cancel ?? c.aiCancelBtn;

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{c.shopName}</Label>
          <Input value={values.shop_name} onChange={(e) => setField("shop_name", e.target.value)} required />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{c.logo}</Label>
          <Input value={values.logo_url} onChange={(e) => setField("logo_url", e.target.value)} required />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{c.description}</Label>
          <Textarea
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            className="min-h-[100px]"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>{c.country}</Label>
          <Select value={values.country} onValueChange={(v) => setField("country", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(c.countryLabels).map(([code, label]) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{c.city}</Label>
          {cityOptions.length > 0 ? (
            <Select value={values.city} onValueChange={(v) => setField("city", v)}>
              <SelectTrigger>
                <SelectValue placeholder={c.city} />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={values.city} onChange={(e) => setField("city", e.target.value)} required />
          )}
        </div>
        <div className="space-y-1.5">
          <Label>{c.region}</Label>
          <Input value={values.region} onChange={(e) => setField("region", e.target.value)} required />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{c.address}</Label>
          <ShopAddressAutocomplete
            value={values.address}
            country={values.country}
            placeholder={c.addressAutocompleteHint}
            required
            onChange={(address) =>
              setValues((prev) => ({
                ...prev,
                address,
                latitude: null,
                longitude: null,
              }))
            }
            onPlaceSelect={(place) => {
              setValues((prev) => ({
                ...prev,
                address: place.address,
                latitude: place.latitude,
                longitude: place.longitude,
                ...(place.city ? { city: place.city } : {}),
                ...(place.region ? { region: place.region } : {}),
              }));
            }}
          />
          {c.addressAutocompleteHint ? (
            <p className="text-xs text-gray-500">{c.addressAutocompleteHint}</p>
          ) : null}
        </div>
      </div>

      {taxonomyLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{labels?.directoryCategory ?? c.directoryCategory} *</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-10"
              value={values.directory_category_id ?? ""}
              onChange={(e) => {
                const directory_category_id = Number(e.target.value) || null;
                const cat = taxonomy.find((t) => t.id === directory_category_id);
                const firstSub = cat?.subcategories[0];
                setValues((prev) => ({
                  ...prev,
                  directory_category_id,
                  directory_subcategory_id: firstSub?.id ?? null,
                }));
              }}
            >
              {taxonomy.map((cat) => {
                const catDef = SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === cat.slug);
                const label = catDef
                  ? translateDirectoryCategory(catDef, locale)
                  : cat.name;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>{labels?.directorySubcategory ?? c.directorySubcategory} *</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-10"
              value={values.directory_subcategory_id ?? ""}
              onChange={(e) => setField("directory_subcategory_id", Number(e.target.value) || null)}
            >
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {translateDirectorySubcategory({ slug: sub.slug, nameSq: sub.name }, locale)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <ShopSocialUrlFields
        values={{
          facebook: values.facebook,
          instagram: values.instagram,
          tiktok: values.tiktok,
          whatsapp: values.whatsapp,
          website: values.website,
        }}
        onChange={(field: ShopSocialField, v) => setField(field, v)}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{c.contactName}</Label>
          <Input value={values.contact_name} onChange={(e) => setField("contact_name", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>{c.phone}</Label>
          <Input value={values.phone} onChange={(e) => setField("phone", e.target.value)} required />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{c.email}</Label>
          <Input type="email" value={values.email} onChange={(e) => setField("email", e.target.value)} required />
        </div>
      </div>

      {showStatus ? (
        <div className="space-y-1.5">
          <Label>{labels?.status ?? "Statusi"}</Label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm min-h-10"
            value={values.status ?? "pending"}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        </div>
      ) : null}

      {showAdminNotes ? (
        <div className="space-y-1.5">
          <Label>{labels?.adminNotes ?? c.adminNotesLabel}</Label>
          <Textarea
            value={values.admin_notes ?? ""}
            onChange={(e) => setField("admin_notes", e.target.value)}
            className="min-h-[80px]"
            placeholder={c.adminNotesPlaceholder}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2 sticky bottom-0 bg-white border-t border-gray-100 py-3">
        <Button type="submit" disabled={saving} className="min-h-10">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saveLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="min-h-10">
          {cancelLabel}
        </Button>
      </div>
    </form>
  );
}

export function adminRowToFormValues(row: {
  shop_name: string;
  logo_url: string;
  description: string;
  category: string;
  category_id: number | null;
  directory_category_id: number | null;
  directory_subcategory_id: number | null;
  country: string;
  city: string;
  region: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  website: string | null;
  contact_name: string;
  phone: string;
  email: string;
  status: string;
  admin_notes?: string | null;
}): ShopEditFormValues {
  return {
    shop_name: row.shop_name,
    logo_url: row.logo_url,
    description: row.description,
    category: row.category,
    category_id: row.category_id,
    directory_category_id: row.directory_category_id,
    directory_subcategory_id: row.directory_subcategory_id,
    country: row.country,
    city: row.city,
    region: row.region,
    address: row.address,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    facebook: shopSocialSuffix(row.facebook, "facebook"),
    instagram: shopSocialSuffix(row.instagram, "instagram"),
    tiktok: shopSocialSuffix(row.tiktok, "tiktok"),
    whatsapp: shopSocialSuffix(row.whatsapp, "whatsapp"),
    website: shopSocialSuffix(row.website, "website"),
    contact_name: row.contact_name,
    phone: row.phone,
    email: row.email,
    status: row.status,
    admin_notes: row.admin_notes ?? "",
  };
}
