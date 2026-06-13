import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Store, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useShopFormCopy, SHOP_COUNTRY_CODES } from "@/lib/shop-application-i18n";
import { citiesForShopCountry } from "@/lib/shop-application-locations";
import { uploadImageToCloudinary, useCloudinaryConfig } from "@/lib/cloudinary-config";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { fetchShopDirectoryTaxonomy, type ShopDirectoryTaxonomyCategory } from "@/lib/shop-directory-api";
import {
  translateDirectoryCategory,
  translateDirectorySubcategory,
} from "@/lib/shop-directory-i18n";
import { SHOP_DIRECTORY_CATEGORIES } from "@/lib/shop-directory-taxonomy";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import { openShopApplyPath } from "@/lib/static-page-paths";
import { BRAND_BLUE, BRAND_ORANGE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";
import { ShopDescriptionHelper } from "@/components/shop-description-helper";
import { ShopSocialUrlFields } from "@/components/shop-social-url-fields";
import { shopSocialFieldsForSubmit, type ShopSocialField } from "@/lib/shop-social-url-input";
import { ShopAddressAutocomplete } from "@/components/shop-address-autocomplete";

export function ShopApplicationForm() {
  const c = useShopFormCopy();
  const { uiLang } = useMarket();
  const { user } = useAuth();
  const cloudinary = useCloudinaryConfig();
  const locale = translationKeyForUiLang(uiLang);
  const logoRef = useRef<HTMLInputElement>(null);

  const [shopName, setShopName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [taxonomy, setTaxonomy] = useState<ShopDirectoryTaxonomyCategory[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);
  const [directoryCategoryId, setDirectoryCategoryId] = useState<number | null>(null);
  const [directorySubcategoryId, setDirectorySubcategoryId] = useState<number | null>(null);
  const [country, setCountry] = useState("XK");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState(c.defaultContactName);
  const [phone, setPhone] = useState(c.defaultContactPhone);
  const [email, setEmail] = useState(c.defaultContactEmail);

  const [logoBusy, setLogoBusy] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const subcategories = useMemo(() => {
    return taxonomy.find((t) => t.id === directoryCategoryId)?.subcategories ?? [];
  }, [taxonomy, directoryCategoryId]);

  const selectedCategoryName = useMemo(() => {
    const dirCat = taxonomy.find((t) => t.id === directoryCategoryId);
    const sub = subcategories.find((s) => s.id === directorySubcategoryId);
    const catDef = dirCat ? SHOP_DIRECTORY_CATEGORIES.find((item) => item.slug === dirCat.slug) : undefined;
    if (catDef && sub) {
      return `${translateDirectoryCategory(catDef, locale)} · ${translateDirectorySubcategory({ slug: sub.slug, nameSq: sub.name }, locale)}`;
    }
    if (catDef) return translateDirectoryCategory(catDef, locale);
    return "";
  }, [taxonomy, directoryCategoryId, directorySubcategoryId, subcategories, locale]);

  useEffect(() => {
    void fetchShopDirectoryTaxonomy()
      .then(setTaxonomy)
      .finally(() => setTaxonomyLoading(false));
  }, []);

  useEffect(() => {
    setCity("");
  }, [country]);

  const cityOptions = citiesForShopCountry(country);

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !cloudinary.ready) return;
    setLogoBusy(true);
    setError(null);
    try {
      const url = await uploadImageToCloudinary(file, cloudinary, "shop");
      setLogoUrl(url);
    } catch {
      setError(c.logoUploadFailed);
    } finally {
      setLogoBusy(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      window.location.href = loginUrlWithReturn(openShopApplyPath(uiLang));
      return;
    }
    setError(null);

    if (!directoryCategoryId || !directorySubcategoryId) {
      setError(c.directoryCategoryRequired);
      return;
    }

    const dirCat = taxonomy.find((t) => t.id === directoryCategoryId);
    const sub = subcategories.find((s) => s.id === directorySubcategoryId);
    const catDef = dirCat ? SHOP_DIRECTORY_CATEGORIES.find((item) => item.slug === dirCat.slug) : undefined;
    const categoryName =
      catDef && sub
        ? `${translateDirectoryCategory(catDef, locale)} · ${translateDirectorySubcategory({ slug: sub.slug, nameSq: sub.name }, locale)}`
        : selectedCategoryName;

    if (!logoUrl) {
      setError(c.logo);
      return;
    }
    if (!facebook.trim() && !instagram.trim() && !tiktok.trim() && !whatsapp.trim() && !website.trim()) {
      setError(c.socialRequired);
      return;
    }

    const social = shopSocialFieldsForSubmit({
      facebook,
      instagram,
      tiktok,
      whatsapp,
      website,
    });

    setSubmitBusy(true);
    try {
      const res = await fetchWithTimeout("/api/shop-applications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_name: shopName,
          logo_url: logoUrl,
          description,
          category: categoryName,
          directory_category_id: directoryCategoryId,
          directory_subcategory_id: directorySubcategoryId,
          country,
          city,
          region,
          address,
          latitude,
          longitude,
          ...social,
          contact_name: contactName,
          phone,
          email,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { message?: string }).message ?? c.submitError);
        return;
      }
      setSuccess(true);
    } catch {
      setError(c.submitNetworkError);
    } finally {
      setSubmitBusy(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-bold text-green-800">{c.successMsg}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-amber-900 border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 leading-relaxed">
          {c.formImportant}
        </p>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">{c.loginRequired}</p>
          <Button
            type="button"
            className="min-h-12 h-12 px-8 font-semibold text-white"
            style={{ background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})` }}
            onClick={() => {
              window.location.href = loginUrlWithReturn(openShopApplyPath(uiLang));
            }}
          >
            {c.loginBtn}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-amber-900 border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 leading-relaxed">
        {c.formImportant}
      </p>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-8"
      >
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
        ) : null}

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Store size={20} style={{ color: BRAND_BLUE }} />
            {c.section1Title}
          </h3>
          <div className="space-y-2">
            <Label>{c.shopName} *</Label>
            <Input value={shopName} onChange={(e) => setShopName(e.target.value)} required className="min-h-12" />
          </div>
          <div className="space-y-2">
            <Label>{c.logo} *</Label>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onLogoChange(e)} />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={() => logoRef.current?.click()} disabled={logoBusy || !cloudinary.ready}>
                {logoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span className="ml-2">{logoBusy ? c.uploadingLogo : c.logo}</span>
              </Button>
              {logoUrl ? (
                <img src={logoUrl} alt="" className="h-16 w-16 rounded-xl object-cover border" />
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="mb-0">{c.description} *</Label>
              <ShopDescriptionHelper
                shopName={shopName}
                category={selectedCategoryName}
                onApplyDescription={setDescription}
              />
            </div>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} className="min-h-[120px]" />
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{c.directoryCategory} *</Label>
              {taxonomyLoading ? (
                <div className="flex items-center gap-2 text-sm text-blue-600 min-h-12">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {c.uploadingLogo}
                </div>
              ) : (
                <Select
                  value={directoryCategoryId ? String(directoryCategoryId) : ""}
                  onValueChange={(v) => {
                    const nextCategoryId = Number(v) || null;
                    const cat = taxonomy.find((t) => t.id === nextCategoryId);
                    setDirectoryCategoryId(nextCategoryId);
                    setDirectorySubcategoryId(cat?.subcategories[0]?.id ?? null);
                  }}
                  required
                >
                  <SelectTrigger className="min-h-12">
                    <SelectValue placeholder={c.directoryCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {taxonomy.map((cat) => {
                      const catDef = SHOP_DIRECTORY_CATEGORIES.find((item) => item.slug === cat.slug);
                      const label = catDef
                        ? translateDirectoryCategory(catDef, locale)
                        : cat.name;
                      return (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.emoji} {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>{c.directorySubcategory} *</Label>
              <Select
                value={directorySubcategoryId ? String(directorySubcategoryId) : ""}
                onValueChange={(v) => setDirectorySubcategoryId(Number(v) || null)}
                disabled={!directoryCategoryId || subcategories.length === 0}
                required
              >
                <SelectTrigger className="min-h-12">
                  <SelectValue placeholder={c.directorySubcategory} />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={String(sub.id)}>
                      {translateDirectorySubcategory({ slug: sub.slug, nameSq: sub.name }, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">{c.section2Title}</h3>
          <div className="space-y-2">
            <Label>{c.country} *</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="min-h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHOP_COUNTRY_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {c.countryLabels[code]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{c.city} *</Label>
            <Select value={city} onValueChange={setCity} required>
              <SelectTrigger className="min-h-12">
                <SelectValue placeholder={c.city} />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{c.region} *</Label>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} required className="min-h-12" />
          </div>
          <div className="space-y-2">
            <Label>{c.address} *</Label>
            <ShopAddressAutocomplete
              value={address}
              country={country}
              required
              className="min-h-12"
              onChange={(next) => {
                setAddress(next);
                setLatitude(null);
                setLongitude(null);
              }}
              onPlaceSelect={(place) => {
                setAddress(place.address);
                setLatitude(place.latitude);
                setLongitude(place.longitude);
                if (place.city) setCity(place.city);
                if (place.region) setRegion(place.region);
              }}
            />
            <p className="text-xs text-gray-500">{c.addressAutocompleteHint}</p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">{c.section3Title}</h3>
          <p className="text-xs text-amber-800/80">{c.socialRequired}</p>
          <ShopSocialUrlFields
            values={{ facebook, instagram, tiktok, whatsapp, website }}
            onChange={(field: ShopSocialField, v) => {
              if (field === "facebook") setFacebook(v);
              if (field === "instagram") setInstagram(v);
              if (field === "tiktok") setTiktok(v);
              if (field === "whatsapp") setWhatsapp(v);
              if (field === "website") setWebsite(v);
            }}
            inputClassName="min-h-12"
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">{c.section4Title}</h3>
          <p className="text-sm text-gray-600">{c.section4Description}</p>
          <div className="space-y-2">
            <Label>{c.contactName} *</Label>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              className="min-h-12"
              placeholder={c.defaultContactName}
            />
          </div>
          <div className="space-y-2">
            <Label>{c.phone} *</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              type="tel"
              className="min-h-12"
              placeholder={c.defaultContactPhone}
            />
          </div>
          <div className="space-y-2">
            <Label>{c.email} *</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="min-h-12"
              placeholder={c.defaultContactEmail}
            />
          </div>
        </section>

        <Button
          type="submit"
          disabled={submitBusy}
          className={cn("w-full min-h-12 h-12 text-base font-bold text-white")}
          style={{ background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})` }}
        >
          {submitBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : c.submitBtn}
        </Button>
      </form>
    </div>
  );
}
