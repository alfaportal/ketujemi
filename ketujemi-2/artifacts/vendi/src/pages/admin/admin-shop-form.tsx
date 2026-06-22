import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShopFormCopy } from "@/lib/shop-application-i18n";
import { citiesForShopCountry } from "@/lib/shop-application-locations";
import { SHOP_DIRECTORY_CATEGORIES } from "@/lib/shop-directory-taxonomy";
import {
  translateDirectoryCategory,
  translateDirectorySubcategory,
} from "@/lib/shop-directory-i18n";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import { ShopSocialUrlFields } from "@/components/shop-social-url-fields";
import {
  shopSocialFieldsForSubmit,
  shopSocialSuffix,
  type ShopSocialField,
} from "@/lib/shop-social-url-input";
import { ShopAddressAutocomplete } from "@/components/shop-address-autocomplete";

export type AdminShopFormValues = {
  shop_name: string;
  logo_url: string;
  description: string;
  directory_category_slug: string;
  directory_subcategory_slug: string;
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

export const BLANK_ADMIN_SHOP: AdminShopFormValues = {
  shop_name: "",
  logo_url: "",
  description: "",
  directory_category_slug: SHOP_DIRECTORY_CATEGORIES[0]?.slug ?? "biznes-sherbime",
  directory_subcategory_slug:
    SHOP_DIRECTORY_CATEGORIES[0]?.subcategories[0]?.slug ?? "dyqane-te-pergjithshme",
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

type AdminShopFormProps = {
  initial: AdminShopFormValues;
  onSubmit: (values: AdminShopFormValues) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  showStatus?: boolean;
  showAdminNotes?: boolean;
  labels?: { save: string; cancel: string; status?: string; adminNotes?: string };
};

function validate(values: AdminShopFormValues): string | null {
  if (!values.shop_name.trim()) return "Plotësoni emrin e dyqanit.";
  if (!values.logo_url.trim()) return "Plotësoni URL-në e logos.";
  if (!values.description.trim()) return "Plotësoni përshkrimin.";
  if (!values.city.trim()) return "Zgjidhni ose shkruani qytetin.";
  if (!values.address.trim()) return "Plotësoni adresën.";
  if (!values.directory_category_slug || !values.directory_subcategory_slug) {
    return "Zgjidhni kategorinë dhe nënkategorinë e dyqanit.";
  }
  const social = shopSocialFieldsForSubmit(values);
  if (!social.facebook && !social.instagram && !social.tiktok && !social.whatsapp && !social.website) {
    return "Plotësoni të paktën një rrjet social.";
  }
  if (!values.contact_name.trim()) return "Plotësoni emrin e kontaktit.";
  if (!values.phone.trim()) return "Plotësoni telefonin.";
  if (!values.email.trim()) return "Plotësoni email-in.";
  return null;
}

export function adminApplicationToFormValues(row: {
  shop_name: string;
  logo_url: string;
  description: string;
  directory_category_slug?: string | null;
  directory_subcategory_slug?: string | null;
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
}): AdminShopFormValues {
  const catSlug =
    row.directory_category_slug?.trim() ||
    SHOP_DIRECTORY_CATEGORIES[0]?.slug ||
    "biznes-sherbime";
  const catDef = SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === catSlug);
  const subSlug =
    row.directory_subcategory_slug?.trim() ||
    catDef?.subcategories[0]?.slug ||
    "dyqane-te-pergjithshme";

  return {
    shop_name: row.shop_name,
    logo_url: row.logo_url,
    description: row.description,
    directory_category_slug: catSlug,
    directory_subcategory_slug: subSlug,
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

export function AdminShopForm({
  initial,
  onSubmit,
  onCancel,
  saving = false,
  showStatus = false,
  showAdminNotes = false,
  labels,
}: AdminShopFormProps) {
  const c = useShopFormCopy();
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setValues(initial);
    setError(null);
  }, [initial]);

  const cityOptions = citiesForShopCountry(values.country);
  const activeCat = useMemo(
    () => SHOP_DIRECTORY_CATEGORIES.find((cat) => cat.slug === values.directory_category_slug),
    [values.directory_category_slug],
  );
  const subcategories = activeCat?.subcategories ?? [];

  function setField<K extends keyof AdminShopFormValues>(key: K, value: AdminShopFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    setError(null);
    const social = shopSocialFieldsForSubmit(values);
    try {
      await onSubmit({
        ...values,
        region: values.region.trim() || values.city.trim() || "—",
        facebook: social.facebook ?? "",
        instagram: social.instagram ?? "",
        tiktok: social.tiktok ?? "",
        whatsapp: social.whatsapp ?? "",
        website: social.website ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gabim gjatë ruajtjes.");
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  return (
    <form noValidate onSubmit={(e) => void handleSubmit(e)} className="flex flex-col max-h-[75vh] min-h-0">
      {error ? (
        <p
          ref={errorRef}
          className="mb-3 text-sm text-red-700 rounded-lg border border-red-200 bg-red-50 px-3 py-2 shrink-0"
          role="alert"
        >
          {error}
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
            <Input
              value={values.region}
              onChange={(e) => setField("region", e.target.value)}
              placeholder="Lagja / rajoni (opsionale)"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{c.address}</Label>
            <ShopAddressAutocomplete
              value={values.address}
              country={values.country}
              placeholder={c.addressAutocompleteHint}
              onChange={(address) =>
                setValues((prev) => ({ ...prev, address, latitude: null, longitude: null }))
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
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{c.directoryCategory} *</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-10"
              value={values.directory_category_slug}
              onChange={(e) => {
                const directory_category_slug = e.target.value;
                const cat = SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === directory_category_slug);
                setValues((prev) => ({
                  ...prev,
                  directory_category_slug,
                  directory_subcategory_slug: cat?.subcategories[0]?.slug ?? prev.directory_subcategory_slug,
                }));
              }}
            >
              {SHOP_DIRECTORY_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.emoji} {translateDirectoryCategory(cat, locale)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>{c.directorySubcategory} *</Label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-10"
              value={values.directory_subcategory_slug}
              onChange={(e) => setField("directory_subcategory_slug", e.target.value)}
            >
              {subcategories.map((sub) => (
                <option key={sub.slug} value={sub.slug}>
                  {translateDirectorySubcategory(sub, locale)}
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
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (labels?.save ?? c.submitBtn)}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="min-h-10">
          {labels?.cancel ?? c.aiCancelBtn}
        </Button>
      </div>
    </form>
  );
}
