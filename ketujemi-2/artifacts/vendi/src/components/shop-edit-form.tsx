import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShopFormCopy } from "@/lib/shop-application-i18n";
import { citiesForShopCountry } from "@/lib/shop-application-locations";
import { fetchShopDirectoryTaxonomy, isApiShopDirectoryTaxonomy, staticShopDirectoryTaxonomy, type ShopDirectoryTaxonomyCategory } from "@/lib/shop-directory-api";
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
  directory_category_slug?: string | null;
  directory_subcategory_slug?: string | null;
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
  youtube: string;
  contact_name: string;
  phone: string;
  email: string;
  status?: string;
  admin_notes?: string;
};

function validateShopEditForm(values: ShopEditFormValues): string | null {
  if (!values.shop_name.trim()) return "Plotësoni emrin e dyqanit.";
  if (!values.logo_url.trim()) return "Plotësoni URL-në e logos.";
  if (!values.description.trim()) return "Plotësoni përshkrimin.";
  if (!values.country.trim()) return "Zgjidhni shtetin.";
  if (!values.city.trim()) return "Zgjidhni ose shkruani qytetin.";
  if (!values.address.trim()) return "Plotësoni adresën.";
  const hasApiIds = !!(values.directory_category_id && values.directory_subcategory_id);
  const hasSlugs = !!(values.directory_category_slug && values.directory_subcategory_slug);
  if (!hasApiIds && !hasSlugs) return "Zgjidhni kategorinë dhe nënkategorinë e dyqanit.";
  if (!values.contact_name.trim()) return "Plotësoni emrin e kontaktit.";
  if (!values.phone.trim()) return "Plotësoni telefonin.";
  if (!values.email.trim()) return "Plotësoni email-in.";
  return null;
}

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
  const [taxonomy, setTaxonomy] = useState<ShopDirectoryTaxonomyCategory[]>(staticShopDirectoryTaxonomy);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const taxonomyUsesApiIds = isApiShopDirectoryTaxonomy(taxonomy);

  const [values, setValues] = useState(initial);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  useEffect(() => {
    void fetchShopDirectoryTaxonomy()
      .then(setTaxonomy)
      .finally(() => setTaxonomyLoading(false));
  }, []);

  useEffect(() => {
    if (taxonomy.length === 0) return;
    setValues((prev) => {
      const hasApiPick = !!(prev.directory_category_id && prev.directory_subcategory_id);
      const hasSlugPick = !!(prev.directory_category_slug && prev.directory_subcategory_slug);
      if (hasApiPick || hasSlugPick) return prev;

      const cat =
        taxonomy.find((t) => t.id === prev.directory_category_id) ??
        taxonomy.find((t) => t.slug === prev.directory_category_slug) ??
        taxonomy[0];
      if (!cat) return prev;
      const sub =
        cat.subcategories.find((s) => s.id === prev.directory_subcategory_id) ??
        cat.subcategories.find((s) => s.slug === prev.directory_subcategory_slug) ??
        cat.subcategories[0];

      if (taxonomyUsesApiIds) {
        return {
          ...prev,
          directory_category_id: cat.id,
          directory_subcategory_id: sub?.id ?? null,
          directory_category_slug: cat.slug,
          directory_subcategory_slug: sub?.slug ?? null,
        };
      }
      return {
        ...prev,
        directory_category_id: null,
        directory_subcategory_id: null,
        directory_category_slug: cat.slug,
        directory_subcategory_slug: sub?.slug ?? null,
      };
    });
  }, [taxonomy, taxonomyUsesApiIds]);

  const cityOptions = citiesForShopCountry(values.country);

  const activeDirectoryCategory = useMemo(() => {
    if (taxonomyUsesApiIds && values.directory_category_id) {
      return taxonomy.find((t) => t.id === values.directory_category_id);
    }
    if (values.directory_category_slug) {
      return taxonomy.find((t) => t.slug === values.directory_category_slug);
    }
    return undefined;
  }, [taxonomy, taxonomyUsesApiIds, values.directory_category_id, values.directory_category_slug]);

  const subcategories = activeDirectoryCategory?.subcategories ?? [];

  function setField<K extends keyof ShopEditFormValues>(key: K, value: ShopEditFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateShopEditForm(values);
    if (validationError) {
      setSubmitError(validationError);
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    setSubmitError(null);

    const hasApiIds = !!(values.directory_category_id && values.directory_subcategory_id);
    const hasSlugs = !!(values.directory_category_slug && values.directory_subcategory_slug);
    if (!hasApiIds && !hasSlugs) {
      setSubmitError("Zgjidhni kategorinë dhe nënkategorinë e dyqanit.");
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    const dirCat =
      activeDirectoryCategory ??
      taxonomy.find((t) => t.slug === values.directory_category_slug) ??
      taxonomy.find((t) => t.id === values.directory_category_id);
    const sub =
      subcategories.find((s) => s.id === values.directory_subcategory_id) ??
      subcategories.find((s) => s.slug === values.directory_subcategory_slug);
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
      youtube: values.youtube,
    });
    try {
      await onSubmit({
        ...values,
        region: values.region.trim() || values.city.trim() || "—",
        category: categoryName,
        category_id: null,
        directory_category_slug: dirCat?.slug ?? values.directory_category_slug ?? null,
        directory_subcategory_slug: sub?.slug ?? values.directory_subcategory_slug ?? null,
        facebook: social.facebook ?? "",
        instagram: social.instagram ?? "",
        tiktok: social.tiktok ?? "",
        whatsapp: social.whatsapp ?? "",
        website: social.website ?? "",
        youtube: social.youtube ?? "",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gabim gjatë ruajtjes së dyqanit.";
      setSubmitError(msg);
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  const saveLabel = labels?.save ?? c.submitBtn;
  const cancelLabel = labels?.cancel ?? c.aiCancelBtn;

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col max-h-[75vh] min-h-0"
    >
      {submitError ? (
        <p
          ref={errorRef}
          className="mb-3 text-sm text-red-700 rounded-lg border border-red-200 bg-red-50 px-3 py-2 shrink-0"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{c.shopName}</Label>
          <Input value={values.shop_name} onChange={(e) => setField("shop_name", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{c.logo}</Label>
          <Input value={values.logo_url} onChange={(e) => setField("logo_url", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{c.description}</Label>
          <Textarea
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            className="min-h-[100px]"
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
            <Input value={values.city} onChange={(e) => setField("city", e.target.value)} />
          )}
        </div>
        <div className="space-y-1.5">
          <Label>{c.region}</Label>
          <Input value={values.region} onChange={(e) => setField("region", e.target.value)} placeholder="Lagja / rajoni (opsionale)" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{c.address}</Label>
          <ShopAddressAutocomplete
            value={values.address}
            country={values.country}
            placeholder={c.addressAutocompleteHint}
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
        <p className="text-xs text-gray-500">Duke sinkronizuar kategoritë me serverin…</p>
      ) : null}
      {!taxonomyUsesApiIds ? (
        <p className="text-xs text-amber-800 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
          Kategoritë u ngarkuan nga lista lokale — serveri do t&apos;i sinkronizojë gjatë ruajtjes.
        </p>
      ) : null}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{labels?.directoryCategory ?? c.directoryCategory} *</Label>
          <select
                className="w-full border rounded-lg px-3 py-2 text-sm min-h-10"
                value={
                  taxonomyUsesApiIds
                    ? (values.directory_category_id ?? "")
                    : (values.directory_category_slug ?? "")
                }
                required={false}
                onChange={(e) => {
                  if (taxonomyUsesApiIds) {
                    const directory_category_id = Number(e.target.value) || null;
                    const cat = taxonomy.find((t) => t.id === directory_category_id);
                    const firstSub = cat?.subcategories[0];
                    setValues((prev) => ({
                      ...prev,
                      directory_category_id,
                      directory_subcategory_id: firstSub?.id ?? null,
                      directory_category_slug: cat?.slug ?? null,
                      directory_subcategory_slug: firstSub?.slug ?? null,
                    }));
                    return;
                  }
                  const directory_category_slug = e.target.value || null;
                  const cat = taxonomy.find((t) => t.slug === directory_category_slug);
                  const firstSub = cat?.subcategories[0];
                  setValues((prev) => ({
                    ...prev,
                    directory_category_id: null,
                    directory_subcategory_id: null,
                    directory_category_slug,
                    directory_subcategory_slug: firstSub?.slug ?? null,
                  }));
                }}
              >
                {taxonomy.map((cat) => {
                  const catDef = SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === cat.slug);
                  const label = catDef
                    ? translateDirectoryCategory(catDef, locale)
                    : cat.name;
                  return (
                    <option
                      key={cat.slug}
                      value={taxonomyUsesApiIds ? cat.id : cat.slug}
                    >
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
                value={
                  taxonomyUsesApiIds
                    ? (values.directory_subcategory_id ?? "")
                    : (values.directory_subcategory_slug ?? "")
                }
                required={false}
                onChange={(e) => {
                  if (taxonomyUsesApiIds) {
                    const directory_subcategory_id = Number(e.target.value) || null;
                    const sub = subcategories.find((s) => s.id === directory_subcategory_id);
                    setValues((prev) => ({
                      ...prev,
                      directory_subcategory_id,
                      directory_subcategory_slug: sub?.slug ?? prev.directory_subcategory_slug,
                    }));
                    return;
                  }
                  setValues((prev) => ({
                    ...prev,
                    directory_subcategory_id: null,
                    directory_subcategory_slug: e.target.value || null,
                  }));
                }}
              >
                {subcategories.map((sub) => (
                  <option
                    key={sub.slug}
                    value={taxonomyUsesApiIds ? sub.id : sub.slug}
                  >
                    {translateDirectorySubcategory({ slug: sub.slug, nameSq: sub.name }, locale)}
                  </option>
                ))}
              </select>
            </div>
          </div>

      <ShopSocialUrlFields
        values={{
          facebook: values.facebook,
          instagram: values.instagram,
          tiktok: values.tiktok,
          whatsapp: values.whatsapp,
          website: values.website,
          youtube: values.youtube,
        }}
        onChange={(field: ShopSocialField, v) => setField(field, v)}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{c.contactName}</Label>
          <Input value={values.contact_name} onChange={(e) => setField("contact_name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{c.phone}</Label>
          <Input value={values.phone} onChange={(e) => setField("phone", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{c.email}</Label>
          <Input type="email" value={values.email} onChange={(e) => setField("email", e.target.value)} />
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

      </div>

      <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-gray-100 shrink-0 bg-white">
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
    directory_category_slug: row.directory_category_slug ?? null,
    directory_subcategory_slug: row.directory_subcategory_slug ?? null,
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
