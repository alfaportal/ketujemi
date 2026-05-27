import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateListing, useGetCategories,
  getGetListingsQueryKey, getGetRecentListingsQueryKey,
  ApiError,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Camera, X, CheckCircle2, ChevronRight,
  Car, Home as HomeIcon, Smartphone, Info, Loader2, ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  useMarket,
  LOCATIONS,
  FORM_OPTIONS,
  MARKETS,
  homeMarketCodeFromMarket,
  isHomeMarketCode,
  type HomeMarketCode,
} from "@/lib/market-context";
import { ListingCategorySuggest } from "@/components/listing-category-suggest";
import { joinListingImageUrls } from "@/lib/listing-images";
import { AP_PART_CONDITION_DESC } from "@/lib/auto-pjese-search-helpers";
import { useListingImageUpload } from "@/lib/listing-image-upload";
import {
  useAuth,
  loginUrlWithReturn,
  userNeedsSellerProfile,
  sellerContactFromUser,
} from "@/lib/auth-context";
import { AuthToolbar } from "@/components/auth-toolbar";
import { SellerProfileGate } from "@/components/seller-profile-gate";
import { PostingAssistantPanel } from "@/components/posting-assistant-panel";
import { CardPaymentsPanel } from "@/components/card-payments-panel";
import { PayWithCardButton } from "@/components/pay-with-card-button";
import {
  ListingPackagesModal,
  ListingPackageSuccessBanner,
} from "@/components/listing-packages-modal";

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  parent_category_id: z.coerce.number().min(1),
  category_id: z.coerce.number().min(1),
  brand_category_id: z.coerce.number().optional(),
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  price_agreement: z.boolean().default(false),
  image_url: z.string().optional(),
  location: z.string().min(1),
  seller_phone: z.string().min(5),
  seller_name: z.string().min(2),
  condition: z.enum(["New", "Used", "Damaged"]),
  xMarka: z.string().optional(),
  xModeli: z.string().optional(),
  xViti: z.string().optional(),
  xKm: z.string().optional(),
  xKarburanti: z.string().optional(),
  xTransmisioni: z.string().optional(),
  xTipi: z.string().optional(),
  xNgjyraV: z.string().optional(),
  xMotori: z.string().optional(),
  xFuqia: z.string().optional(),
  xGjendjaT: z.string().optional(),
  xKlima: z.string().optional(),
  xPanorama: z.string().optional(),
  xSellerEmail: z.string().optional(),
  xSellerAddress: z.string().optional(),
  xSiperfaqja: z.string().optional(),
  xKati: z.string().optional(),
  xDhomat: z.string().optional(),
  xFurnished: z.string().optional(),
  xTelMarka: z.string().optional(),
  xTelModeli: z.string().optional(),
  xKapaciteti: z.string().optional(),
  xNgjyra: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CLIENT_BLOCKED_WORDS = [
  "mashtrim",
  "droge",
  "drogë",
  "kokain",
  "heroin",
  "armë",
  "arme",
  "falsifikim",
  "spam",
  "seks",
  "fyerje",
];

function hasPhoneInDescriptionClient(description: string): boolean {
  return /(?:\+?\d[\d\s\-()]{6,}\d)/.test(description);
}

function hasExternalLinkClient(description: string): boolean {
  return /(https?:\/\/|www\.)\S+/i.test(description);
}

function findBlockedWordClient(text: string): string | null {
  const normalized = text.toLowerCase().normalize("NFC");
  for (const word of CLIENT_BLOCKED_WORDS) {
    if (normalized.includes(word.toLowerCase().normalize("NFC"))) return word;
  }
  return null;
}

// ─── Category groups ──────────────────────────────────────────────────────────
const isVetura    = (name: string) => name === "Vetura";
const isAutoPjese = (name: string) => name === "Auto Pjesë";
const isRealEstate = (name: string) => name === "Banesa & Shtëpi" || name === "Lokale & Zyrë";
const isPhone     = (name: string) => name === "Telefona";

// ─── Step badge ───────────────────────────────────────────────────────────────
function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
        done ? "bg-green-100 text-green-600" : active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
      }`}>
        {done ? <CheckCircle2 size={14} /> : n}
      </div>
      <span className="hidden sm:block">{label}</span>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
        {Icon && <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><Icon size={16} className="text-blue-600" /></div>}
        <h2 className="font-bold text-lg text-gray-900">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Image preview ────────────────────────────────────────────────────────────
function ImagePreview({ urls, onRemove, mainLabel }: { urls: string[]; onRemove: (i: number) => void; mainLabel: string }) {
  if (!urls.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {urls.map((url, i) => (
        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
          <img src={url} alt="" className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <button type="button" onClick={() => onRemove(i)}
            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
            <X size={10} className="text-white" />
          </button>
          {i === 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-sm text-center font-bold py-1">
              {mainLabel}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewListing() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, refresh } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { market, t } = useMarket();
  const [listingCountry, setListingCountry] = useState<HomeMarketCode>(() =>
    homeMarketCodeFromMarket(market.code),
  );
  const homeMarkets = MARKETS.filter((m) => isHomeMarketCode(m.code));
  const { data: allCategories } = useGetCategories();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const imageUpload = useListingImageUpload();

  const mc = market.code;
  const fuelOpts         = FORM_OPTIONS.fuel[mc]         ?? FORM_OPTIONS.fuel.ks;
  const transmissionOpts = FORM_OPTIONS.transmission[mc] ?? FORM_OPTIONS.transmission.ks;
  const bodyTypeOpts     = FORM_OPTIONS.bodyType[mc]     ?? FORM_OPTIONS.bodyType.ks;
  const colorOpts        = FORM_OPTIONS.color[mc]        ?? FORM_OPTIONS.color.ks;
  const techCondOpts     = FORM_OPTIONS.techCondition[mc] ?? FORM_OPTIONS.techCondition.ks;
  const furnishedOpts    = FORM_OPTIONS.furnished[mc]    ?? FORM_OPTIONS.furnished.ks;

  const parentCats = (allCategories ?? []).filter((c: any) => !c.parent_id);

  const form = useForm<FormData>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      parent_category_id: 0,
      category_id: 0,
      brand_category_id: 0,
      title: "",
      description: "",
      price: 0,
      price_agreement: false,
      image_url: "",
      location: "",
      seller_phone: "",
      seller_name: "",
      condition: "Used",
      xMarka: "", xModeli: "", xViti: "", xKm: "", xKarburanti: "", xTransmisioni: "",
      xTipi: "", xNgjyraV: "", xMotori: "", xFuqia: "", xGjendjaT: "", xKlima: "", xPanorama: "",
      xSellerEmail: "", xSellerAddress: "",
      xSiperfaqja: "", xKati: "", xDhomat: "", xFurnished: "",
      xTelMarka: "", xTelModeli: "", xKapaciteti: "", xNgjyra: "",
    },
  });

  const parentCatId    = useWatch({ control: form.control, name: "parent_category_id" });
  const bodyCatId      = useWatch({ control: form.control, name: "category_id" });
  const brandCatId     = useWatch({ control: form.control, name: "brand_category_id" });
  const priceAgreement = useWatch({ control: form.control, name: "price_agreement" });
  const watchTitle = useWatch({ control: form.control, name: "title" }) ?? "";
  const watchDescription = useWatch({ control: form.control, name: "description" }) ?? "";
  const watchPrice = useWatch({ control: form.control, name: "price" }) ?? 0;
  const [freeQuota, setFreeQuota] = useState<{
    remaining: number;
    limit: number;
    allowed: boolean;
    business?: { needs_payment?: boolean; extra_post_price_eur?: number } | null;
  } | null>(null);
  const [paymentToken, setPaymentToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("payment_token");
  });
  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [packagesModalMessage, setPackagesModalMessage] = useState<string | undefined>();
  const [packageSuccessCode, setPackageSuccessCode] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    if (params.get("package_payment") === "success") {
      return params.get("code");
    }
    return null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id")?.trim();
    if (params.get("package_payment") === "success" && sessionId?.startsWith("cs_")) {
      void import("@/lib/stripe-checkout")
        .then(({ confirmStripeCheckoutSession }) => confirmStripeCheckoutSession(sessionId))
        .catch(() => undefined);
    }
    if (packageSuccessCode) {
      const url = new URL(window.location.href);
      url.searchParams.delete("package_payment");
      url.searchParams.delete("code");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [packageSuccessCode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id")?.trim();
    if (!paymentToken || !sessionId?.startsWith("cs_")) return;
    void import("@/lib/stripe-checkout")
      .then(({ confirmStripeCheckoutSession }) => confirmStripeCheckoutSession(sessionId))
      .catch(() => undefined);
  }, [paymentToken]);
  const effectiveCategoryId =
    Number(brandCatId) || Number(bodyCatId) || Number(parentCatId);

  const subCats   = (allCategories ?? []).filter((c: any) => c.parent_id === Number(parentCatId));
  const brandCats = (allCategories ?? []).filter((c: any) => c.parent_id === Number(bodyCatId));
  const parentName = parentCats.find((c: any) => c.id === Number(parentCatId))?.name ?? "";
  const hasBrands = brandCats.length > 0;

  useEffect(() => {
    form.setValue("category_id", 0);
    form.setValue("brand_category_id", 0);
  }, [parentCatId, form]);

  useEffect(() => {
    form.setValue("brand_category_id", 0);
  }, [bodyCatId, form]);

  useEffect(() => {
    if (isHomeMarketCode(market.code)) {
      setListingCountry(market.code);
    }
  }, [market.code]);

  useEffect(() => {
    const loc = form.getValues("location");
    const cities = LOCATIONS[listingCountry] ?? [];
    if (loc && !cities.includes(loc)) {
      form.setValue("location", "");
    }
  }, [listingCountry, form]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) setLocation(loginUrlWithReturn("/listings/new"));
  }, [authLoading, user, setLocation]);

  useEffect(() => {
    if (!user || userNeedsSellerProfile(user)) return;
    const { seller_name, seller_phone } = sellerContactFromUser(user);
    if (seller_name) form.setValue("seller_name", seller_name);
    if (seller_phone) form.setValue("seller_phone", seller_phone);
  }, [user, form]);

  useEffect(() => {
    if (!user || effectiveCategoryId < 1) {
      setFreeQuota(null);
      return;
    }
    let cancelled = false;
    void fetch(`/api/listings/free-quota?category_id=${effectiveCategoryId}`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        setFreeQuota({
          remaining: j.remaining ?? 0,
          limit: j.limit ?? 0,
          allowed: j.allowed ?? true,
          business: j.business ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) setFreeQuota(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user, effectiveCategoryId]);

  const createMutation = useCreateListing({
    mutation: {
      onSuccess: (listing) => {
        queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentListingsQueryKey() });
        toast({ title: t.successPost });
        setLocation(`/listings/${listing.id}`);
      },
      onError: (err: unknown) => {
        const data =
          err instanceof ApiError
            ? (err.data as { error?: string } | null)
            : null;
        if (data?.error === "FREE_QUOTA_EXCEEDED") {
          setPackagesModalMessage("Ke arritur limitin falas. Zgjero me një paketë shtesë.");
          setShowPackagesModal(true);
          return;
        }
        if (data?.error === "BUSINESS_QUOTA_EXCEEDED") {
          toast({
            title: "Keni arritur limitin. Paguani €1 për njoftim shtesë.",
            variant: "destructive",
          });
          return;
        }
        toast({ title: t.postError, variant: "destructive" });
      },
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (!imageUpload.ready) {
      toast({ title: t.uploadFailed, variant: "destructive" });
      return;
    }
    const remaining = 10 - imageUrls.length;
    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      toast({ title: `${t.tooManyPhotos} ${remaining} ${t.photosSuffix}`, variant: "destructive" });
    }
    setIsUploading(true);
    try {
      const urls = await Promise.all(toUpload.map((file) => imageUpload.uploadFile(file)));
      setImageUrls((prev) => [...prev, ...urls]);
    } catch {
      toast({ title: t.uploadFailed, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (uploadRef.current) uploadRef.current.value = "";
    }
  };

  const removeImage = (i: number) => setImageUrls((prev) => prev.filter((_, idx) => idx !== i));

  const buildExtraText = (data: FormData): string => {
    const lines: string[] = [];
    if (isAutoPjese(parentName)) {
      const partCat = subCats.find((c: any) => c.id === Number(data.category_id));
      if (partCat?.name) lines.push(`Lloji i pjesës: ${partCat.name}`);
      if (data.xMarka) lines.push(`Marka: ${data.xMarka}`);
      if (data.xModeli) lines.push(`Modeli: ${data.xModeli}`);
      if (data.xViti) lines.push(`Viti: ${data.xViti}`);
      const condKey = data.condition === "New" ? "new" : data.condition === "Used" ? "used_oem" : "scrap";
      if (AP_PART_CONDITION_DESC[condKey]) lines.push(AP_PART_CONDITION_DESC[condKey]);
    } else if (isVetura(parentName)) {
      if (data.xMarka)        lines.push(`Marka: ${data.xMarka}`);
      if (data.xModeli)       lines.push(`Modeli: ${data.xModeli}`);
      if (data.xViti)         lines.push(`Viti: ${data.xViti}`);
      if (data.xKm)           lines.push(`Kilometrazha: ${data.xKm} km`);
      if (data.xKarburanti)   lines.push(`Karburanti: ${data.xKarburanti}`);
      if (data.xTransmisioni) lines.push(`Transmisioni: ${data.xTransmisioni}`);
      if (data.xTipi)         lines.push(`Tipi: ${data.xTipi}`);
      if (data.xNgjyraV)      lines.push(`Ngjyra: ${data.xNgjyraV}`);
      if (data.xMotori)       lines.push(`Motori: ${data.xMotori} L`);
      if (data.xFuqia)        lines.push(`Fuqia: ${data.xFuqia} hp`);
      if (data.xGjendjaT)     lines.push(`Gjendja teknike: ${data.xGjendjaT}`);
      if (data.xKlima)        lines.push(`Klima: ${data.xKlima}`);
      if (data.xPanorama)     lines.push(`Panorama: ${data.xPanorama}`);
    } else if (isRealEstate(parentName)) {
      if (data.xSiperfaqja) lines.push(`Sipërfaqja: ${data.xSiperfaqja} m²`);
      if (data.xKati)       lines.push(`Kati: ${data.xKati}`);
      if (data.xDhomat)     lines.push(`Numri dhomave: ${data.xDhomat}`);
      if (data.xFurnished)  lines.push(`Mobilimi: ${data.xFurnished}`);
    } else if (isPhone(parentName)) {
      if (data.xTelMarka)   lines.push(`Marka: ${data.xTelMarka}`);
      if (data.xTelModeli)  lines.push(`Modeli: ${data.xTelModeli}`);
      if (data.xKapaciteti) lines.push(`Kapaciteti: ${data.xKapaciteti}`);
      if (data.xNgjyra)     lines.push(`Ngjyra: ${data.xNgjyra}`);
    }
    if (data.xSellerEmail)   lines.push(`Email: ${data.xSellerEmail}`);
    if (data.xSellerAddress) lines.push(`Adresa: ${data.xSellerAddress}`);
    return lines.length ? lines.join(" · ") + "\n\n" : "";
  };

  const parseVehicleYear = (s: string | undefined): number | undefined => {
    if (!s?.trim()) return undefined;
    const m = s.trim().match(/\b(19\d{2}|20\d{2})\b/);
    return m ? parseInt(m[1], 10) : undefined;
  };

  const parseVehicleKm = (s: string | undefined): number | undefined => {
    if (!s?.trim()) return undefined;
    const digits = s.replace(/\D/g, "");
    if (!digits) return undefined;
    const n = parseInt(digits, 10);
    return Number.isFinite(n) ? n : undefined;
  };

  const onSubmit = (data: FormData) => {
    const needsPay = freeQuota?.business?.needs_payment && !paymentToken;
    if (freeQuota && !freeQuota.allowed && !paymentToken) {
      if (needsPay) {
        toast({
          title: "Paguani €1 për të vazhduar postimin.",
          variant: "destructive",
        });
      } else {
        setPackagesModalMessage("Ke arritur limitin falas. Zgjero me një paketë shtesë.");
        setShowPackagesModal(true);
      }
      return;
    }
    if (imageUrls.length === 0) {
      toast({ title: t.addAtLeastPhoto, variant: "destructive" });
      return;
    }
    if (isAutoPjese(parentName)) {
      if (!data.category_id || Number(data.category_id) < 1) {
        toast({ title: t.ap_post_err_part, variant: "destructive" });
        return;
      }
      if (!data.xMarka?.trim() || !data.xModeli?.trim() || !data.xViti?.trim()) {
        toast({ title: t.ap_post_err_compat, variant: "destructive" });
        return;
      }
    }
    const extraText = buildExtraText(data);
    const finalDescription = extraText + data.description;
    const blockedWord = findBlockedWordClient(`${data.title} ${finalDescription}`);
    if (blockedWord) {
      toast({
        title: `Përmbajtja përmban fjalë të ndaluara: "${blockedWord}".`,
        variant: "destructive",
      });
      return;
    }
    if (hasPhoneInDescriptionClient(finalDescription)) {
      toast({
        title: "Numri i telefonit nuk lejohet në përshkrim. Vendoseni vetëm në fushën e telefonit.",
        variant: "destructive",
      });
      return;
    }
    if (hasExternalLinkClient(finalDescription)) {
      toast({
        title: "Linqet e jashtme nuk lejohen në përshkrim.",
        variant: "destructive",
      });
      return;
    }
    const contact =
      user && !userNeedsSellerProfile(user)
        ? sellerContactFromUser(user)
        : { seller_name: data.seller_name, seller_phone: data.seller_phone };

    const payload: Record<string, unknown> = {
      title: data.title,
      description: finalDescription,
      price: data.price_agreement ? 0 : data.price,
      price_agreement: data.price_agreement,
      lang: market.code === "mk" ? "mk" : market.code === "mne" ? "me" : "sq",
      category_id: data.brand_category_id || data.category_id || data.parent_category_id,
      location: data.location,
      seller_name: contact.seller_name,
      seller_phone: contact.seller_phone,
      condition: data.condition,
      image_url: joinListingImageUrls(imageUrls) ?? undefined,
      is_featured: false,
      ...((isVetura(parentName) || isAutoPjese(parentName))
        ? {
            vehicle_year: parseVehicleYear(data.xViti) ?? null,
            vehicle_mileage_km: isVetura(parentName) ? parseVehicleKm(data.xKm) ?? null : null,
            vehicle_fuel: isVetura(parentName) ? data.xKarburanti || null : null,
            vehicle_body_type: isVetura(parentName) ? data.xTipi || null : null,
            vehicle_model: data.xModeli || null,
          }
        : {}),
    };
    if (paymentToken) payload.payment_token = paymentToken;

    void fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          const errData = body as { error?: string; message?: string };
          if (errData.error === "DUPLICATE_LISTING" || errData.error === "DUPLICATE_LISTING_SELF") {
            toast({
              title: errData.message ?? "Keni një njoftim të ngjashëm aktiv.",
              variant: "destructive",
            });
            return;
          }
          if (
            errData.error === "BLACKLIST_WORD" ||
            errData.error === "PHONE_IN_DESCRIPTION" ||
            errData.error === "EXTERNAL_LINK_IN_DESCRIPTION"
          ) {
            toast({
              title: errData.message ?? "Përmbajtja nuk kaloi kontrollin automatik.",
              variant: "destructive",
            });
            return;
          }
          if (
            errData.error === "LISTING_POST_COOLDOWN" ||
            errData.error === "LISTING_POST_IP_COOLDOWN"
          ) {
            toast({
              title:
                errData.message ?? "Ki pak durim, prisni 30 sekonda për postimin tjetër.",
              variant: "destructive",
            });
            return;
          }
          if (errData.error === "LISTING_MODERATION_REJECTED") {
            toast({
              title: errData.message ?? "Njoftimi u bllokua nga moderimi automatik.",
              variant: "destructive",
            });
            return;
          }
          if (errData.error === "LISTING_MONTHLY_CAP") {
            setPackagesModalMessage(
              errData.message ?? "Ke arritur limitin falas. Zgjero me një paketë shtesë.",
            );
            setShowPackagesModal(true);
            return;
          }
          if (errData.error === "FREE_QUOTA_EXCEEDED") {
            setPackagesModalMessage("Ke arritur limitin falas. Zgjero me një paketë shtesë.");
            setShowPackagesModal(true);
            return;
          }
          if (errData.error === "BUSINESS_QUOTA_EXCEEDED") {
            toast({
              title: "Keni arritur limitin falas.",
              description: "Mbushni portofolin nga profili (€0.30 për shpallje).",
              variant: "destructive",
            });
            return;
          }
          if (errData.error === "WALLET_INSUFFICIENT") {
            toast({
              title: "Balanca nuk mjafton",
              description:
                (body as { message?: string }).message ??
                "Mbushni portofolin €5 / €10 / €20 nga profili juaj.",
              variant: "destructive",
            });
            setLocation("/profile");
            return;
          }
          toast({ title: errData.message ?? t.postError, variant: "destructive" });
          return;
        }
        queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentListingsQueryKey() });
        const wallet = (body as { wallet?: { balance_eur: string; listings_remaining: number } })
          .wallet;
        const msg = wallet
          ? `Shpallja u postua. Balanca: €${wallet.balance_eur} — ${wallet.listings_remaining} shpallje të mbetura.`
          : ((body as { message?: string }).message ?? t.successPost);
        toast({ title: msg });
        setLocation(`/listings/${(body as { id: number }).id}`);
      })
      .catch(() => toast({ title: t.postError, variant: "destructive" }));
  };

  const cityList = LOCATIONS[listingCountry] ?? [];
  const hideContactFields = user != null && !userNeedsSellerProfile(user);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ListingPackagesModal
        open={showPackagesModal}
        onClose={() => {
          setShowPackagesModal(false);
          void fetch(`/api/listings/free-quota?category_id=${effectiveCategoryId}`, {
            credentials: "include",
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
              if (!j) return;
              setFreeQuota({
                remaining: j.remaining ?? 0,
                limit: j.limit ?? 0,
                allowed: j.allowed ?? true,
                business: j.business ?? null,
              });
            })
            .catch(() => undefined);
        }}
        message={packagesModalMessage}
      />
      {userNeedsSellerProfile(user) ? (
        <SellerProfileGate onReady={() => void refresh()} />
      ) : null}
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 min-h-[3.75rem] flex items-center gap-4 py-2">
          <button
            data-testid="button-back"
            onClick={() => setLocation("/listings")}
            className="flex items-center gap-1.5 text-sm font-medium rounded-lg text-gray-500 hover:text-gray-900 transition-colors touch-manipulation min-h-12 min-w-[2.75rem] justify-center px-2 -mx-2"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">{t.back}</span>
          </button>
          <div className="flex-1 text-center">
            <span className="font-bold text-lg text-gray-900">{t.postTitle}</span>
          </div>
          <AuthToolbar variant="compact" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">
        {packageSuccessCode ? (
          <ListingPackageSuccessBanner
            code={packageSuccessCode}
            onDismiss={() => setPackageSuccessCode(null)}
          />
        ) : null}
        {user?.account_type === "business" ? <CardPaymentsPanel /> : null}
        {freeQuota != null && effectiveCategoryId > 0 ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium space-y-2 ${
              freeQuota.allowed || paymentToken
                ? "border-blue-100 bg-blue-50 text-blue-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <p>
              {paymentToken
                ? "Pagesa u konfirmua — mund të postoni këtë njoftim."
                : freeQuota.allowed
                  ? t.postQuotaRemaining.replace("{n}", String(freeQuota.remaining))
                  : freeQuota.business?.needs_payment
                    ? `Keni arritur ${freeQuota.limit} njoftime falas në këtë kategori. Çdo shtesë kushton €1.`
                    : t.postQuotaExceeded}
            </p>
            {!freeQuota.allowed && !paymentToken && freeQuota.business?.needs_payment ? (
              <PayWithCardButton
                purpose="extra_post"
                className="w-full min-h-11 bg-blue-600 hover:bg-blue-700"
              >
                Paguaj €1 me kartë dhe vazhdo
              </PayWithCardButton>
            ) : null}
          </div>
        ) : null}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* ── 1. Title (first — AI tip appears right below) ── */}
            <Section title={t.titleField} icon={Info}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.listingTitle} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-title"
                        placeholder="p.sh. BMW X5 2020, JBL 500, iPhone 14 Pro Max..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            <ListingCategorySuggest
              title={watchTitle}
              description={watchDescription}
              currentParentId={Number(parentCatId) || 0}
              currentCategoryId={Number(bodyCatId) || 0}
              onApply={(s) => {
                form.setValue("parent_category_id", s.parent_category_id);
                form.setValue("category_id", s.category_id);
                form.setValue("brand_category_id", 0);
              }}
            />

            {/* ── 2. Category ── */}
            <Section title={t.mainCategory} icon={ChevronRight}>
              <FormField
                control={form.control}
                name="parent_category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.mainCategory} <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-parent-category">
                          <SelectValue placeholder={t.chooseCategory} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[min(70vh,360px)]">
                        {parentCats.map((cat: any) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {subCats.length > 0 && (
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {parentName === "Vetura"
                          ? t.bodyTypeLabel
                          : isAutoPjese(parentName)
                            ? t.ap_sec_parts
                            : t.subcategory}{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder={t.chooseType} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[min(70vh,360px)]">
                          {subCats.map((cat: any) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {hasBrands && !isAutoPjese(parentName) && (
                <FormField
                  control={form.control}
                  name="brand_category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.brandField} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-brand">
                            <SelectValue placeholder={t.chooseMark} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[min(70vh,360px)]">
                          {brandCats.map((cat: any) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
            </Section>

            {/* ── 3. Extra fields ── */}
            {isAutoPjese(parentName) && (
              <Section title={t.ap_sec_compat} icon={Car}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { name: "xMarka" as const, label: t.ap_lbl_brand, placeholder: t.ap_ph_brand },
                    { name: "xModeli" as const, label: t.ap_lbl_model, placeholder: t.ap_ph_model },
                  ].map(({ name, label, placeholder }) => (
                    <FormField key={name} control={form.control} name={name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label} <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder={placeholder} className="min-h-12 w-full text-sm" {...field} value={field.value as string} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormField control={form.control} name="xViti"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.ap_lbl_year} <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger className="min-h-12 w-full text-sm"><SelectValue placeholder={t.ap_ph_year} /></SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {Array.from({ length: 2026 - 1990 + 1 }, (_, i) => String(2026 - i)).map((y) => (
                              <SelectItem key={y} value={y} className="min-h-11">{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </Section>
            )}

            {isVetura(parentName) && (
              <Section title={t.carDetails} icon={Car}>
                {/* Row 1: Brand + Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: "xMarka",  label: t.brandField,  placeholder: "BMW, Audi, VW..." },
                    { name: "xModeli", label: t.modelField,  placeholder: "X5, A4, Golf..." },
                  ].map(({ name, label, placeholder }) => (
                    <FormField key={name} control={form.control} name={name as keyof FormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input placeholder={placeholder} {...field} value={field.value as string} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Row 2: Year + Mileage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField control={form.control} name="xViti"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.yearField}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder={t.chooseYear} /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 2026 - 1960 + 1 }, (_, i) => String(2026 - i)).map((y) => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="xKm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.mileageField}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="85000" type="number" min="0" className="pr-8" {...field} value={field.value as string} />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">km</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3: Fuel + Transmission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField control={form.control} name="xKarburanti"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.fuelField}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder={t.choose} /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fuelOpts.map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="xTransmisioni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.transmissionField}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder={t.choose} /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transmissionOpts.map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 4: Body type + Color */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField control={form.control} name="xTipi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.bodyTypeLabel}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder={t.choose} /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bodyTypeOpts.map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="xNgjyraV"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.colorField}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder={t.choose} /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colorOpts.map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 5: Engine + Power */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField control={form.control} name="xMotori"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.engineField}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="1.6" type="number" min="0" step="0.1" className="pr-4" {...field} value={field.value as string} />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">L</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="xFuqia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.powerField}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="150" type="number" min="0" className="pr-8" {...field} value={field.value as string} />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">hp</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 6: Technical condition */}
                <FormField control={form.control} name="xGjendjaT"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.techCondField}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t.choose} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {techCondOpts.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Row 7: AC + Panorama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(["xKlima", "xPanorama"] as const).map((fname) => {
                    const label = fname === "xKlima" ? "Klima" : "Panorama";
                    return (
                      <FormField key={fname} control={form.control} name={fname}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{label}</FormLabel>
                            <div className="flex gap-2">
                              {[t.yes, t.no].map((v) => (
                                <button key={v} type="button"
                                  onClick={() => field.onChange(field.value === v ? "" : v)}
                                  className={`flex-1 min-h-12 rounded-lg border text-sm font-medium transition-all px-3 py-2.5 ${field.value === v ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"}`}
                                >{v}</button>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>
              </Section>
            )}

            {isRealEstate(parentName) && (
              <Section title={t.houseDetails} icon={HomeIcon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: "xSiperfaqja", label: t.areaField,  placeholder: "75" },
                    { name: "xKati",       label: t.floorField, placeholder: "2" },
                    { name: "xDhomat",     label: t.roomsField, placeholder: "3" },
                  ].map(({ name, label, placeholder }) => (
                    <FormField key={name} control={form.control} name={name as keyof FormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input placeholder={placeholder} {...field} value={field.value as string} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormField control={form.control} name="xFurnished"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.furnishedField}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder={t.choose} /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {furnishedOpts.map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </Section>
            )}

            {isPhone(parentName) && (
              <Section title={t.phoneDetails} icon={Smartphone}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: "xTelMarka",   label: t.brandField,    placeholder: "Apple, Samsung..." },
                    { name: "xTelModeli",  label: t.modelField,    placeholder: "iPhone 14 Pro..." },
                    { name: "xKapaciteti", label: t.capacityField, placeholder: "256GB" },
                    { name: "xNgjyra",     label: t.colorField,    placeholder: "Space Gray..." },
                  ].map(({ name, label, placeholder }) => (
                    <FormField key={name} control={form.control} name={name as keyof FormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input placeholder={placeholder} {...field} value={field.value as string} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* ── 4. Description ── */}
            <Section title={t.descField}>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.descField} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="input-description"
                        placeholder={t.descPlaceholder}
                        rows={5}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            {/* ── 5. Price ── */}
            <Section title={t.priceField}>
              <FormField
                control={form.control}
                name="price_agreement"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${field.value ? "bg-blue-600" : "bg-gray-300"}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${field.value ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                      <Label className="cursor-pointer font-medium text-sm" onClick={() => field.onChange(!field.value)}>
                        {t.agreementToggle}
                      </Label>
                    </div>
                  </FormItem>
                )}
              />

              {!priceAgreement && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.priceEur}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            data-testid="input-price"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            className="pr-14"
                            {...field}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">EUR</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </Section>

            {/* ── 6. Photos ── */}
            <Section title={t.photosSection} icon={Camera}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">
                    {t.listingPhotos} <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-1">(min 1, max 10)</span>
                  </Label>
                  <span className="text-sm text-gray-400">{imageUrls.length}/10</span>
                </div>

                <input
                  ref={uploadRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />

                {imageUrls.length < 10 && (
                  <button
                    type="button"
                    onClick={() => uploadRef.current?.click()}
                    disabled={isUploading || !imageUpload.ready}
                    className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl py-12 px-6 text-center transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none min-h-[10.5rem] touch-manipulation"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1.5 text-blue-500">
                        <Loader2 size={30} className="animate-spin" />
                        <p className="text-sm font-semibold">{t.uploading}</p>
                        <p className="text-sm text-gray-400">{t.waitPlease}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                        <ImagePlus size={30} />
                        <p className="text-sm font-semibold text-gray-600">{t.addPhoto}</p>
                        <p className="text-sm">{t.clickToSelect}</p>
                        <p className="text-sm text-gray-300">JPG, PNG, WEBP • max 10</p>
                      </div>
                    )}
                  </button>
                )}

                <ImagePreview urls={imageUrls} onRemove={isUploading ? () => {} : removeImage} mainLabel={t.mainPhotoLabel} />

                {imageUrls.length === 0 && !isUploading && (
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    {t.firstPhotoMain}
                  </p>
                )}
              </div>
            </Section>

            {/* ── 7. Location ── */}
            <Section title={t.locationSection}>
              <div className="space-y-2">
                <Label>Shteti</Label>
                <div className="grid grid-cols-4 gap-2">
                  {homeMarkets.map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      data-testid={`button-listing-country-${m.code}`}
                      onClick={() => setListingCountry(m.code as HomeMarketCode)}
                      className={`min-h-12 rounded-xl border-2 text-sm font-semibold flex flex-col items-center justify-center gap-0.5 touch-manipulation transition-colors ${
                        listingCountry === m.code
                          ? "border-blue-500 bg-blue-50 text-blue-800"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <span className="text-lg leading-none" aria-hidden>
                        {m.flag}
                      </span>
                      <span className="text-[10px] leading-tight px-1 text-center">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.locationSection} <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-location">
                          <SelectValue placeholder={t.chooseCity} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[min(70vh,360px)]">
                        {cityList.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            {/* ── 8. Contact (skipped when saved on profile) ── */}
            {!hideContactFields ? (
            <Section title={t.contactSection}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="seller_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.yourName} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input data-testid="input-seller-name" placeholder="Arben Krasniqi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seller_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.phoneNum} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input data-testid="input-phone" placeholder={`${market.prefix} 44 123 456`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="xSellerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="kontakt@email.com" type="email" {...field} value={field.value as string} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="xSellerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Rruga, nr. shtëpisë..." {...field} value={field.value as string} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Section>
            ) : null}

            {/* ── 9. Condition ── */}
            <Section title={isAutoPjese(parentName) ? t.ap_sec_condition : t.conditionField}>
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(isAutoPjese(parentName)
                        ? [
                            { value: "New", label: t.ap_cond_new, sub: "", color: "border-green-500 bg-green-50" },
                            { value: "Used", label: t.ap_cond_used, sub: "", color: "border-blue-500 bg-blue-50" },
                            { value: "Damaged", label: t.ap_cond_scrap, sub: "", color: "border-red-400 bg-red-50" },
                          ]
                        : [
                            { value: "New", label: t.conditionNew, sub: t.conditionNewSub, color: "border-green-500 bg-green-50" },
                            { value: "Used", label: t.conditionUsed, sub: t.conditionUsedSub, color: "border-blue-500 bg-blue-50" },
                            { value: "Damaged", label: t.conditionDamaged, sub: t.conditionDamagedSub, color: "border-red-400 bg-red-50" },
                          ]
                      ).map(({ value, label, sub, color }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          data-testid={`condition-${value.toLowerCase()}`}
                          className={`min-h-12 p-3 rounded-xl border-2 text-left transition-all touch-manipulation ${
                            field.value === value ? color : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className={`font-semibold text-sm ${
                            field.value === value
                              ? value === "New" ? "text-green-700" : value === "Damaged" ? "text-red-700" : "text-blue-700"
                              : "text-gray-800"
                          }`}>{label}</div>
                          <div className="text-sm text-gray-400 mt-0.5">{sub}</div>
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            <PostingAssistantPanel
              title={watchTitle}
              description={watchDescription}
              price={priceAgreement ? 0 : Number(watchPrice) || 0}
              priceAgreement={!!priceAgreement}
              categoryName={brandCats.find((c: { id: number }) => c.id === Number(brandCatId))?.name ?? subCats.find((c: { id: number }) => c.id === Number(bodyCatId))?.name}
              parentCategoryName={parentName}
              imageCount={imageUrls.length}
            />

            {/* ── Submit ── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20 sm:static sm:bg-transparent sm:border-none sm:p-0">
              <div className="max-w-2xl mx-auto">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full min-h-14 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700"
                  disabled={createMutation.isPending || (freeQuota != null && !freeQuota.allowed)}
                  data-testid="button-submit-listing"
                >
                  {createMutation.isPending ? t.posting : t.submitListing}
                </Button>
              </div>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
