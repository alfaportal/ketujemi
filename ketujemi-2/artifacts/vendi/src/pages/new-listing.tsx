import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  fetchWithTimeout,
  getFetchErrorMessage,
  IMAGE_ANALYZE_TIMEOUT_MS,
  LISTING_POST_TIMEOUT_MS,
} from "@/lib/fetch-with-timeout";
import { Link, useLocation } from "wouter";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGetCategories,
  getGetListingsQueryKey, getGetRecentListingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Camera, X, CheckCircle2, ChevronRight,
  Car, Home as HomeIcon, Smartphone, Info, Loader2, ImagePlus, Video,
} from "lucide-react";
import { MobileSafeTopSpacer } from "@/components/mobile-safe-top-spacer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  useMarket,
  FORM_OPTIONS,
  formOptionsForUiLang,
  defaultListingMarketFromMarket,
  isListingMarketCode,
  locationsForListingMarket,
  type ListingMarketCode,
} from "@/lib/market-context";
import { listingApiLangFromUi } from "@/lib/listing-api-lang";
import { translationKeyForUiLang } from "@/lib/ui-languages";

function isCategoryUnderParent(
  catId: number,
  parentId: number,
  categories: Array<{ id: number; parent_id?: number | null }>,
): boolean {
  if (!catId || !parentId) return false;
  let node = categories.find((c) => c.id === catId);
  while (node) {
    if (node.id === parentId) return true;
    if (!node.parent_id) break;
    node = categories.find((c) => c.id === node!.parent_id);
  }
  return false;
}
import { ListingCountryPicker } from "@/components/listing-country-picker";
import { ListingCategorySuggest } from "@/components/listing-category-suggest";
import { ListingDescriptionHelper } from "@/components/listing-description-helper";
import { joinListingImageUrls, parseListingImageUrls } from "@/lib/listing-images";
import { type ListingImageAnalysis, fileToVisionBase64 } from "@/lib/listing-image-vision";
import { listingPhotoAnalyzeFailureToast } from "@/lib/listing-photo-analyze-toast";
import { clientValidationMessage } from "@/lib/listing-post-feedback-i18n";
import { videoFileToVisionBase64 } from "@/lib/listing-video-frame";
import {
  clearListingPostDraft,
  clearListingPostSessionActive,
  readListingDraftImageUrls,
  readListingPostDraft,
  writeListingPostDraft,
} from "@/lib/listing-post-draft";
import { useListingPostGuard } from "@/hooks/use-listing-post-guard";
import { ListingPhotoUploadBoundary } from "@/components/listing-photo-upload-boundary";
import { ListingPostRecoveryBanner } from "@/components/listing-post-recovery-banner";
import {
  normalizeListingDescription,
  normalizeListingTitle,
  normalizePersonName,
} from "@/lib/listing-text-normalize";
import { useListingImageUpload } from "@/lib/listing-image-upload";
import {
  isAllowedListingVideoFile,
  listingVideoAddLabel,
  listingVideoErrorMessage,
  listingVideoFormatsHint,
  listingVideoLabel,
  listingVideoRemoveLabel,
  useListingVideoUpload,
  type ListingVideoUploadPhase,
} from "@/lib/listing-video-upload";
import {
  useAuth,
  loginUrlWithReturn,
  sellerContactFromUser,
  userNeedsSellerProfile,
  type AuthUser,
} from "@/lib/auth-context";
import { AuthToolbar } from "@/components/auth-toolbar";
import { SellerProfileGate } from "@/components/seller-profile-gate";
import { translateCategory } from "@/lib/category-translations";
import {
  DhurataGiftPledge,
  DHURATA_PLEDGE_STORAGE_KEY,
} from "@/components/dhurata-gift-pledge";
import { DHURATA_FALAS_SLUG, KERKOJ_POST_PATH, KERKOJ_TE_BLEJ_SLUG } from "@/lib/special-listing-categories";
import { isRootCategory, sortRootCategories } from "@/lib/parent-category-slugs";
import { fillPlaceholders } from "@/lib/fill-placeholders";
import { categoryEngine } from "@/services/CategoryEngine";
import {
  clientValidationMessage,
  collectFormValidationMessages,
  formatFormValidationSummary,
  resolveListingPostApiError,
  type ListingPostApiBody,
} from "@/lib/listing-post-feedback";
import {
  collectListingPostPreflightIssues,
  formatPreflightSummary,
} from "@/lib/listing-post-preflight";
import { engagementCopyForUiLang } from "@/lib/engagement-i18n";
import { queueFirstListingCelebration } from "@/components/engagement-effects";
import { staticPagePaths } from "@/lib/static-page-paths";
import { buildNewListingSchema, type NewListingFormData } from "@/lib/listing-form-schema";
import { createAdminListing, getAdminListing, updateAdminListing, isAdminLoggedIn, adminAuthHeaders } from "@/lib/admin-api";
import { adminListingToFormPrefill } from "@/lib/admin-listing-form-prefill";
type FormData = NewListingFormData;

function userHasSellerPhone(user: {
  contact_phone?: string | null;
  phone_e164_digits?: string | null;
}): boolean {
  const digits = (user.contact_phone ?? user.phone_e164_digits ?? "").replace(/\D/g, "");
  return digits.length >= 8;
}

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
        <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
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
  const [pathname, setLocation] = useLocation();
  const isAdminPostMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("adminPost") === "1" && isAdminLoggedIn();
  }, [pathname]);
  const adminEditId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("adminEdit");
    if (!raw || !isAdminLoggedIn()) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [pathname]);
  const adminShopId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("shopId");
    if (!raw || !isAdminLoggedIn()) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [pathname]);
  const isAdminEditMode = adminEditId != null;
  const isAdminListingMode = isAdminPostMode || isAdminEditMode;
  const isDhurataPostRoute = pathname === "/listings/new/dhurata-falas";
  const isKerkojPostRoute = pathname === KERKOJ_POST_PATH;
  const skipListingImageAutofill = isDhurataPostRoute || isKerkojPostRoute;
  const { user, loading: authLoading, refresh } = useAuth();
  const lastUserRef = useRef<AuthUser | null>(null);
  if (user) lastUserRef.current = user;
  const activeUser = user ?? lastUserRef.current;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { market, t, uiLang } = useMarket();
  const tx = t as Record<string, string | undefined>;
  const categoryLocale = translationKeyForUiLang(uiLang);
  const listingLang = listingApiLangFromUi(uiLang);
  const [listingCountry, setListingCountry] = useState<ListingMarketCode>(() =>
    defaultListingMarketFromMarket(market.code),
  );
  const { data: allCategories, isLoading: categoriesLoading } = useGetCategories();
  const [imageUrls, setImageUrlsState] = useState<string[]>(() => readListingDraftImageUrls());
  const setImageUrls = useCallback(
    (value: string[] | ((prev: string[]) => string[])) => {
      setImageUrlsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        const draft = readListingPostDraft();
        writeListingPostDraft({ images: next, videoUrl: draft?.videoUrl ?? null });
        return next;
      });
    },
    [],
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const imageAnalyzedRef = useRef(false);
  const lastVideoAnalyzeKeyRef = useRef<string | null>(null);
  const skipCategoryCascadeRef = useRef(false);
  const skipBrandCascadeRef = useRef(false);
  const skipTitleSuggestRef = useRef(false);
  const pendingImageAnalysisRef = useRef<ListingImageAnalysis | null>(null);
  const lastImageAnalysisRef = useRef<ListingImageAnalysis | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraPhotoRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLInputElement>(null);
  const imageUpload = useListingImageUpload({ adminPost: isAdminListingMode });
  const [videoUrl, setVideoUrl] = useState<string | null>(() => readListingPostDraft()?.videoUrl ?? null);
  const [photoUploadKey, setPhotoUploadKey] = useState(0);
  const { showRecoveryBanner, dismissRecovery } = useListingPostGuard({
    imageUrls,
    videoUrl,
    setImageUrls,
    setVideoUrl,
  });

  const restoreDraftMedia = useCallback(() => {
    const draft = readListingPostDraft();
    if (!draft) return;
    if (draft.images.length > 0) setImageUrls(draft.images);
    if (draft.videoUrl) setVideoUrl(draft.videoUrl);
    dismissRecovery();
  }, [setImageUrls, dismissRecovery]);
  const [videoUploadPhase, setVideoUploadPhase] = useState<ListingVideoUploadPhase | null>(null);
  const [videoPreparePct, setVideoPreparePct] = useState(0);
  const isVideoUploading = videoUploadPhase !== null;
  const videoUploadRef = useRef<HTMLInputElement>(null);
  const videoUpload = useListingVideoUpload();
  const [hasShop, setHasShop] = useState<boolean | null>(null);
  const [myShop, setMyShop] = useState<{ shop_name: string; category: string } | null>(null);
  /** Must accept Dhurata pledge on every visit — no sessionStorage bypass. */
  const [dhurataPledgeOk, setDhurataPledgeOk] = useState(false);

  useEffect(() => {
    writeListingPostDraft({ images: imageUrls, videoUrl });
  }, [imageUrls, videoUrl]);

  useEffect(() => {
    if (!isDhurataPostRoute) return;
    try {
      sessionStorage.removeItem(DHURATA_PLEDGE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [isDhurataPostRoute]);

  const fuelOpts = formOptionsForUiLang("fuel", uiLang);
  const transmissionOpts = formOptionsForUiLang("transmission", uiLang);
  const bodyTypeOpts = formOptionsForUiLang("bodyType", uiLang);
  const colorOpts = formOptionsForUiLang("color", uiLang);
  const techCondOpts = formOptionsForUiLang("techCondition", uiLang);
  const furnishedOpts = formOptionsForUiLang("furnished", uiLang);

  const parentCats = useMemo(
    () => sortRootCategories((allCategories ?? []).filter((c: { id?: number; parent_id?: number | null; slug?: string | null }) => isRootCategory(c))),
    [allCategories],
  );

  useEffect(() => {
    if (!activeUser) return;
    void fetchWithTimeout("/api/shops/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return res.json() as Promise<{
          shop?: { shop_name?: string; category?: string } | null;
        }>;
      })
      .then((data) => {
        const shop = data.shop ?? null;
        setHasShop(!!shop);
        if (shop?.shop_name?.trim()) {
          setMyShop({
            shop_name: shop.shop_name.trim(),
            category: shop.category?.trim() ?? "",
          });
        } else {
          setMyShop(null);
        }
      })
      .catch(() => {
        setHasShop(null);
        setMyShop(null);
      });
  }, [activeUser]);

  const formSchema = useMemo(
    () =>
      buildNewListingSchema({
        parentCategory: t.zodParentCategory,
        titleMin: t.zodTitleMin,
        descriptionMin: t.zodDescriptionMin,
        location: t.zodLocation,
        phoneMin: t.zodPhoneMin,
        sellerName: t.zodSellerName,
      }),
    [
      tx.zodParentCategory,
      tx.zodTitleMin,
      tx.zodDescriptionMin,
      tx.zodLocation,
      tx.zodPhoneMin,
      tx.zodSellerName,
    ],
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema as never),
    defaultValues: {
      parent_category_id: 0,
      category_id: 0,
      brand_category_id: 0,
      title: "",
      description: "",
      price: undefined as unknown as number,
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

  useEffect(() => {
    if (!isAdminListingMode || !adminShopId) return;
    let cancelled = false;
    void fetchWithTimeout(`/api/shops/${adminShopId}?lang=${encodeURIComponent(uiLang)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return res.json() as Promise<{
          shop?: { shop_name?: string; category?: string; contact_name?: string; phone?: string; city?: string };
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        const shop = data.shop;
        if (shop?.shop_name?.trim()) {
          setMyShop({
            shop_name: shop.shop_name.trim(),
            category: shop.category?.trim() ?? "",
          });
          if (!form.getValues("seller_name")?.trim() && shop.contact_name?.trim()) {
            form.setValue("seller_name", shop.contact_name.trim());
          }
          if (!form.getValues("seller_phone")?.trim() && shop.phone?.trim()) {
            form.setValue("seller_phone", shop.phone.trim());
          }
          if (!form.getValues("location")?.trim() && shop.city?.trim()) {
            form.setValue("location", shop.city.trim());
          }
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isAdminListingMode, adminShopId, uiLang, form]);

  const parentCatId    = useWatch({ control: form.control, name: "parent_category_id" });
  const bodyCatId      = useWatch({ control: form.control, name: "category_id" });
  const brandCatId     = useWatch({ control: form.control, name: "brand_category_id" });
  const priceAgreement = useWatch({ control: form.control, name: "price_agreement" });
  const watchTitle = useWatch({ control: form.control, name: "title" }) ?? "";
  const watchDescription = useWatch({ control: form.control, name: "description" }) ?? "";
  const watchPrice = useWatch({ control: form.control, name: "price" }) ?? 0;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminEditLoading, setAdminEditLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    const raw = new URLSearchParams(window.location.search).get("adminEdit");
    return !!(raw && isAdminLoggedIn());
  });
  const [adminEditViews, setAdminEditViews] = useState<number | null>(null);
  const [postBlockMessage, setPostBlockMessage] = useState<string | null>(null);
  const postBlockRef = useRef<HTMLDivElement>(null);
  const postRefusedTitle =
    t.postRefusedTitle;

  const refusePost = useCallback(
    (message: string) => {
      setPostBlockMessage(message);
      toast({
        title: postRefusedTitle,
        description: message,
        variant: "destructive",
      });
    },
    [toast, postRefusedTitle],
  );

  useEffect(() => {
    if (postBlockMessage && postBlockRef.current) {
      postBlockRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [postBlockMessage]);
  const effectiveCategoryId =
    Number(brandCatId) || Number(bodyCatId) || Number(parentCatId);

  const subCats = (allCategories ?? []).filter(
    (c: { parent_id?: number | null }) => Number(c.parent_id) === Number(parentCatId) && Number(parentCatId) > 0,
  );
  const brandCats = (allCategories ?? []).filter(
    (c: { parent_id?: number | null }) => Number(c.parent_id) === Number(bodyCatId) && Number(bodyCatId) > 0,
  );
  const showSubcategoryField = subCats.length > 1;
  const catEngine = useMemo(
    () => categoryEngine((allCategories ?? []) as { id: number; name: string; slug?: string | null; parent_id?: number | null }[]),
    [allCategories],
  );
  const postFields = useMemo(
    () => catEngine.getFields(Number(parentCatId) || effectiveCategoryId, market.code),
    [catEngine, parentCatId, effectiveCategoryId, market.code],
  );
  const isKerkojCategory = postFields.isKerkoj || isKerkojPostRoute;
  const isDhurataCategory = postFields.isDhurata;
  const maxListingPhotos = postFields.maxPhotos;
  const atPhotoLimit = imageUrls.length >= maxListingPhotos;
  const hasListingPhotos = imageUrls.length > 0;
  const hasListingVideo = !!videoUrl;
  const hasBrands = brandCats.length > 0;

  useEffect(() => {
    const parentId = Number(parentCatId);
    if (!parentId) return;

    if (skipCategoryCascadeRef.current) {
      skipCategoryCascadeRef.current = false;
      const pending = pendingImageAnalysisRef.current;
      if (pending) {
        form.setValue("category_id", pending.category_id, { shouldDirty: true });
        form.setValue("brand_category_id", pending.brand_category_id ?? 0, { shouldDirty: true });
        pendingImageAnalysisRef.current = null;
      }
      return;
    }

    const analysis = lastImageAnalysisRef.current;
    if (analysis && analysis.parent_category_id === parentId) {
      form.setValue("category_id", analysis.category_id, { shouldDirty: true });
      form.setValue("brand_category_id", analysis.brand_category_id ?? 0, { shouldDirty: true });
      return;
    }

    const cats = (allCategories ?? []) as Array<{ id: number; parent_id?: number | null }>;
    const currentCatId = Number(form.getValues("category_id"));
    const currentBrandId = Number(form.getValues("brand_category_id"));

    if (currentCatId > 0 && isCategoryUnderParent(currentCatId, parentId, cats)) {
      return;
    }
    if (currentBrandId > 0 && isCategoryUnderParent(currentBrandId, parentId, cats)) {
      return;
    }

    form.setValue("category_id", 0);
    form.setValue("brand_category_id", 0);
  }, [parentCatId, allCategories, form]);

  useEffect(() => {
    if (skipBrandCascadeRef.current) {
      skipBrandCascadeRef.current = false;
      return;
    }
    const analysis = lastImageAnalysisRef.current;
    if (
      analysis?.brand_category_id &&
      Number(bodyCatId) === analysis.category_id &&
      analysis.parent_category_id === Number(parentCatId)
    ) {
      form.setValue("brand_category_id", analysis.brand_category_id, { shouldDirty: true });
      return;
    }
    form.setValue("brand_category_id", 0);
  }, [bodyCatId, parentCatId, form]);

  /** Pas kategorisë kryesore: vendos automatikisht nënkategori kur ka 0 ose 1 fëmijë. */
  useEffect(() => {
    const parentId = Number(parentCatId);
    if (!parentId || !allCategories?.length) return;
    if (skipCategoryCascadeRef.current) return;

    const children = (allCategories ?? []).filter(
      (c: { parent_id?: number | null }) => Number(c.parent_id) === parentId,
    );
    const currentCatId = Number(form.getValues("category_id"));

    if (children.length === 0) {
      if (currentCatId !== parentId) {
        form.setValue("category_id", parentId, { shouldDirty: true });
      }
      return;
    }

    if (children.length === 1) {
      const onlyId = children[0]!.id;
      if (currentCatId !== onlyId) {
        form.setValue("category_id", onlyId, { shouldDirty: true });
      }
    }
  }, [parentCatId, allCategories, form]);

  const suggestLang = listingLang;

  useEffect(() => {
    const parentId = Number(parentCatId);
    if (!parentId) return;
    if (skipTitleSuggestRef.current) return;
    if (lastImageAnalysisRef.current) return;

    const children = (allCategories ?? []).filter(
      (c: { parent_id?: number | null }) => Number(c.parent_id) === parentId,
    );
    if (children.length === 0) {
      return;
    }

    const titleTrim = watchTitle.trim();
    if (titleTrim.length < 5) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      void fetchWithTimeout("/api/ai/suggest-listing-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isAdminListingMode ? adminAuthHeaders() : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          title: titleTrim,
          description: watchDescription,
          lang: suggestLang,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (cancelled) return;
          const s = (j as { suggestion?: { parent_category_id: number; category_id: number; brand_category_id?: number } | null })
            ?.suggestion;
          if (s && s.parent_category_id === parentId) {
            form.setValue("category_id", s.category_id);
            if (s.brand_category_id) {
              form.setValue("brand_category_id", s.brand_category_id);
            }
            return;
          }
          if (children.length === 1) {
            form.setValue("category_id", children[0].id);
          }
        })
        .catch(() => {
          if (!cancelled && children.length === 1) {
            form.setValue("category_id", children[0].id);
          }
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [parentCatId, watchTitle, watchDescription, suggestLang, allCategories, form, isAdminListingMode]);

  useEffect(() => {
    if (isKerkojCategory || isDhurataCategory) {
      form.setValue("price", 0);
      form.setValue("price_agreement", false);
    }
  }, [isKerkojCategory, isDhurataCategory, form]);

  useEffect(() => {
    if (isListingMarketCode(market.code)) {
      setListingCountry(market.code);
    }
  }, [market.code]);

  useEffect(() => {
    const loc = form.getValues("location");
    const cities = locationsForListingMarket(listingCountry);
    if (loc && !cities.includes(loc)) {
      form.setValue("location", "");
    }
  }, [listingCountry, form]);

  useEffect(() => {
    if (authLoading) return;
    if (isAdminListingMode) return;
    if (!user && imageUrls.length === 0 && !videoUrl) {
      setLocation(loginUrlWithReturn(pathname || "/listings/new"));
    }
  }, [authLoading, user, setLocation, pathname, imageUrls.length, videoUrl, isAdminListingMode]);

  useEffect(() => {
    if (!allCategories || !isDhurataPostRoute) return;
    const dhurata = (allCategories as { id: number; slug?: string | null; parent_id?: number | null }[])
      .find((c) => !c.parent_id && c.slug === DHURATA_FALAS_SLUG);
    if (dhurata) {
      form.setValue("parent_category_id", dhurata.id);
      form.setValue("category_id", dhurata.id);
    }
  }, [allCategories, isDhurataPostRoute, form]);

  useEffect(() => {
    if (!allCategories || !isKerkojPostRoute) return;
    const kerkoj = (allCategories as { id: number; slug?: string | null; parent_id?: number | null }[])
      .find((c) => !c.parent_id && c.slug === KERKOJ_TE_BLEJ_SLUG);
    if (kerkoj) {
      form.setValue("parent_category_id", kerkoj.id);
      form.setValue("category_id", kerkoj.id);
    }
  }, [allCategories, isKerkojPostRoute, form]);

  const skipCategoryCascade = useCallback(() => {
    skipCategoryCascadeRef.current = true;
    skipBrandCascadeRef.current = true;
    skipTitleSuggestRef.current = true;
    window.setTimeout(() => {
      skipTitleSuggestRef.current = false;
    }, 3000);
  }, []);

  useEffect(() => {
    if (!activeUser || isAdminListingMode) return;
    const { seller_name, seller_phone } = sellerContactFromUser(activeUser);
    if (seller_name && !form.getValues("seller_name")?.trim()) {
      form.setValue("seller_name", seller_name);
    }
    if (seller_phone && !form.getValues("seller_phone")?.trim()) {
      form.setValue("seller_phone", seller_phone);
    }
    if (activeUser.email && !form.getValues("xSellerEmail")?.trim()) {
      form.setValue("xSellerEmail", activeUser.email);
    }
  }, [activeUser, form, isAdminListingMode]);

  useEffect(() => {
    if (!adminEditId || !allCategories?.length) return;
    let cancelled = false;
    setAdminEditLoading(true);
    clearListingPostDraft();
    void getAdminListing(adminEditId)
      .then((row) => {
        if (cancelled) return;
        const prefill = adminListingToFormPrefill(
          row,
          allCategories as Array<{ id: number; parent_id?: number | null }>,
        );
        skipCategoryCascadeRef.current = true;
        skipBrandCascadeRef.current = true;
        form.reset({
          ...form.getValues(),
          ...prefill,
        } as FormData);
        setImageUrls(parseListingImageUrls(row.image_url));
        setVideoUrl(row.video_url ?? null);
        setAdminEditViews(row.views);
        setAdminEditLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        refusePost(getFetchErrorMessage(e, tx.adm_edit_err_load ?? t.postError));
        setAdminEditLoading(false);
        setLocation("/admin");
      });
    return () => {
      cancelled = true;
    };
  }, [adminEditId, allCategories, form, setLocation, refusePost, tx.adm_edit_err_load, t.postError, setImageUrls]);

  const applyImageAnalysis = useCallback(
    (analysis: ListingImageAnalysis): "full" | "partial" | "none" => {
      try {
        const cats = allCategories as Array<{ id: number; parent_id?: number | null }> | undefined;
        const fieldOpts = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const;
        const title = analysis.title?.trim() ?? "";
        const description = analysis.description?.trim() ?? "";

        if (title) form.setValue("title", title, fieldOpts);
        if (description) form.setValue("description", description, fieldOpts);

        if (!title && !description) return "none";

        if (!cats?.length) {
          lastImageAnalysisRef.current = analysis;
          return "partial";
        }

        const parentExists = cats.some(
          (c) => c.id === analysis.parent_category_id && (c.parent_id == null || c.parent_id === 0),
        );
        const categoryExists = cats.some((c) => c.id === analysis.category_id);
        let brandId = analysis.brand_category_id ?? 0;
        let brandOk =
          brandId < 1 || cats.some((c) => c.id === brandId);

        if (!parentExists || !categoryExists) {
          lastImageAnalysisRef.current = analysis;
          return "partial";
        }

        if (!brandOk) {
          brandId = 0;
        }

        lastImageAnalysisRef.current = analysis;
        pendingImageAnalysisRef.current = analysis;
        skipCategoryCascadeRef.current = true;
        skipBrandCascadeRef.current = true;
        skipTitleSuggestRef.current = true;

        form.setValue("parent_category_id", analysis.parent_category_id, fieldOpts);
        form.setValue("category_id", analysis.category_id, fieldOpts);
        form.setValue("brand_category_id", brandId, fieldOpts);

        window.setTimeout(() => {
          skipTitleSuggestRef.current = false;
        }, 3000);
        return "full";
      } catch (err) {
        console.warn("[KetuJemi] applyImageAnalysis skipped", err);
        return "none";
      }
    },
    [form, allCategories],
  );

  useEffect(() => {
    if (!allCategories?.length) return;
    const analysis = lastImageAnalysisRef.current;
    if (!analysis) return;
    applyImageAnalysis(analysis);
  }, [allCategories?.length, applyImageAnalysis]);

  const runListingVisionAnalysis = useCallback(
    async (vision: { data: string; mediaType: string }) => {
      if (imageAnalyzedRef.current || skipListingImageAutofill) return false;

      const res = await fetchWithTimeout(
        "/api/ai/analyze-listing-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(isAdminListingMode ? adminAuthHeaders() : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            image_base64: vision.data,
            media_type: vision.mediaType,
            lang: listingLang,
            ...(myShop
              ? { shop_name: myShop.shop_name, shop_category: myShop.category || undefined }
              : {}),
          }),
        },
        IMAGE_ANALYZE_TIMEOUT_MS,
      );
      const body = (await res.json().catch(() => ({}))) as {
        analysis?: ListingImageAnalysis | null;
        pipeline?: "google" | "claude" | null;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        if (res.status === 403 && body.error === "PROHIBITED_CONTENT") {
          setImageUrls((prev) => prev.slice(0, -1));
          imageAnalyzedRef.current = false;
          toast({
            title: clientValidationMessage("PROHIBITED_CONTENT", uiLang) ?? body.message ?? tx.photoAnalyzeFailed,
            description: body.message ?? clientValidationMessage("PROHIBITED_CONTENT", uiLang) ?? "",
            variant: "destructive",
          });
          return false;
        }
        const fail = listingPhotoAnalyzeFailureToast(res.status, tx);
        toast({ ...fail, variant: "destructive" });
        return false;
      }
      if (body.analysis) {
        const outcome = applyImageAnalysis(body.analysis);
        if (outcome === "full") {
          imageAnalyzedRef.current = true;
          return true;
        }
        if (outcome === "partial") {
          toast({
            title: t.photoAnalyzeCategoryPartial,
            description: t.photoAnalyzeFailedHint,
          });
          imageAnalyzedRef.current = false;
          return true;
        }
      }
      const fail = listingPhotoAnalyzeFailureToast(422, tx);
      toast(fail);
      return false;
    },
    [applyImageAnalysis, skipListingImageAutofill, listingLang, myShop, toast, tx, isAdminListingMode, t.photoAnalyzeCategoryPartial, t.photoAnalyzeFailedHint, uiLang, setImageUrls],
  );

  const analyzeUploadedImageFile = useCallback(
    async (file: File) => {
      if (imageAnalyzedRef.current || skipListingImageAutofill) return;
      setIsAnalyzingImage(true);
      try {
        const vision = await fileToVisionBase64(file);
        await runListingVisionAnalysis(vision);
      } catch (error) {
        toast({
          title: t.photoAnalyzeFailed,
          description: getFetchErrorMessage(error, tx.photoAnalyzeFailedHint),
          variant: "destructive",
        });
      } finally {
        setIsAnalyzingImage(false);
      }
    },
    [skipListingImageAutofill, runListingVisionAnalysis, toast, t.photoAnalyzeFailed, tx],
  );

  const analyzeVideoFile = useCallback(
    async (file: File): Promise<boolean> => {
      if (imageAnalyzedRef.current || skipListingImageAutofill) return false;
      setIsAnalyzingImage(true);
      try {
        const vision = await videoFileToVisionBase64(file);
        return await runListingVisionAnalysis(vision);
      } catch (error) {
        const code = error instanceof Error ? error.message : "";
        const isVideoFrame =
          code === "video_frame_failed" ||
          code === "video_frame_timeout" ||
          code === "video_frame_blank" ||
          code === "video_frame_encode_failed";
        toast({
          title: t.photoAnalyzeFailed,
          description: isVideoFrame
            ? t.videoAnalyzeFrameHint
            : getFetchErrorMessage(error, tx.photoAnalyzeFailedHint),
          variant: "destructive",
        });
        return false;
      } finally {
        setIsAnalyzingImage(false);
      }
    },
    [skipListingImageAutofill, runListingVisionAnalysis, toast, t.photoAnalyzeFailed, t.videoAnalyzeFrameHint, tx],
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (videoUrl) {
      toast({
        title: t.listingMediaRemoveVideoForPhotos,
        variant: "destructive",
      });
      if (uploadRef.current) uploadRef.current.value = "";
      if (cameraPhotoRef.current) cameraPhotoRef.current.value = "";
      return;
    }
    if (!imageUpload.ready) {
      toast({ title: t.uploadFailed, variant: "destructive" });
      return;
    }
    const remaining = maxListingPhotos - imageUrls.length;
    if (remaining <= 0) {
      toast({
        title: t.photosMaxReached,
        description: fillPlaceholders(t.photosMaxReachedHint, { max: String(maxListingPhotos) }),
        variant: "destructive",
      });
      return;
    }
    const filesToUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      toast({
        title: t.photosMaxReached,
        description: fillPlaceholders(t.photosMaxReachedHint, { max: String(maxListingPhotos) }),
      });
    }
    const titleEmpty = !form.getValues("title")?.trim();
    const descEmpty = !form.getValues("description")?.trim();
    const shouldAnalyze =
      imageUrls.length === 0 &&
      (!imageAnalyzedRef.current || (titleEmpty && descEmpty));
    const firstFileForAnalysis = shouldAnalyze ? filesToUpload[0] : null;
    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const file of filesToUpload) {
        urls.push(await imageUpload.uploadFile(file));
      }
      setImageUrls((prev) => [...prev, ...urls].slice(0, maxListingPhotos));
      if (firstFileForAnalysis) {
        window.setTimeout(() => {
          void analyzeUploadedImageFile(firstFileForAnalysis);
        }, 1200);
      }
    } catch {
      toast({ title: t.uploadFailed, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (uploadRef.current) uploadRef.current.value = "";
      if (cameraPhotoRef.current) cameraPhotoRef.current.value = "";
    }
  };

  const removeImage = (i: number) => {
    setImageUrls((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      if (next.length === 0) {
        imageAnalyzedRef.current = false;
        lastImageAnalysisRef.current = null;
      }
      return next;
    });
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageUrls.length > 0) {
      toast({
        title: t.listingMediaRemovePhotosForVideo,
        variant: "destructive",
      });
      if (videoUploadRef.current) videoUploadRef.current.value = "";
      if (cameraVideoRef.current) cameraVideoRef.current.value = "";
      return;
    }
    if (!videoUpload.ready) {
      toast({ title: t.uploadFailed, variant: "destructive" });
      return;
    }
    if (!isAllowedListingVideoFile(file)) {
      const msg = listingVideoErrorMessage(new Error("invalid_video_format"), uiLang);
      toast({
        title: msg?.title ?? t.videoInvalidFormatTitle,
        description: msg?.description ?? t.videoInvalidFormatDesc,
        variant: "destructive",
      });
      return;
    }
    const videoFileKey = `${file.name}:${file.size}:${file.lastModified}`;
    const shouldAnalyze =
      imageUrls.length === 0 &&
      (!imageAnalyzedRef.current || lastVideoAnalyzeKeyRef.current !== videoFileKey);
    setVideoUploadPhase("preparing");
    setVideoPreparePct(0);
    try {
      const url = await videoUpload.uploadFile(file, {
        onPhase: setVideoUploadPhase,
        onPrepareProgress: setVideoPreparePct,
      });
      setVideoUrl(url);
      setVideoUploadPhase(null);
      setVideoPreparePct(0);
      if (shouldAnalyze) {
        void analyzeVideoFile(file).then((ok) => {
          if (ok) lastVideoAnalyzeKeyRef.current = videoFileKey;
        });
      }
    } catch (err) {
      const msg = listingVideoErrorMessage(err, uiLang);
      if (msg) {
        toast({ title: msg.title, description: msg.description, variant: "destructive" });
      } else {
        toast({ title: t.uploadFailed, variant: "destructive" });
      }
    } finally {
      setVideoUploadPhase(null);
      setVideoPreparePct(0);
      if (videoUploadRef.current) videoUploadRef.current.value = "";
      if (cameraVideoRef.current) cameraVideoRef.current.value = "";
    }
  };

  const onInvalidSubmit = (errors: Record<string, unknown>) => {
    const messages = collectFormValidationMessages(errors);
    refusePost(
      formatFormValidationSummary(
        messages,
        t.formInvalidSummary,
      ),
    );
  };

  const onSubmit = async (data: FormData) => {
    if (!activeUser && !isAdminListingMode) {
      setLocation(loginUrlWithReturn(pathname || "/listings/new"));
      return;
    }
    if (isDhurataPostRoute && !dhurataPledgeOk && !isAdminListingMode) {
      refusePost(
        tx.ui_giftPledgeUncheckedBlocked!,
      );
      return;
    }
    setPostBlockMessage(null);
    const rawPrice = Number.isFinite(Number(data.price)) ? Number(data.price) : 0;
    const priceByAgreement = !!data.price_agreement || rawPrice <= 0;
    const listingData: FormData = {
      ...data,
      title: normalizeListingTitle(data.title),
      description: normalizeListingDescription(data.description),
      seller_name: normalizePersonName(data.seller_name),
      price: priceByAgreement ? 0 : rawPrice,
      price_agreement: priceByAgreement,
    };
    form.setValue("title", listingData.title, { shouldDirty: true });
    form.setValue("description", listingData.description, { shouldDirty: true });
    form.setValue("seller_name", listingData.seller_name, { shouldDirty: true });
    const parentId = Number(listingData.parent_category_id);
    const children = (allCategories ?? []).filter(
      (c: { parent_id?: number | null }) => Number(c.parent_id) === parentId,
    );
    const photoCountForValidation =
      imageUrls.length > 0 ? imageUrls.length : videoUrl ? 1 : 0;

    if (!isAdminListingMode) {
      const preflight = collectListingPostPreflightIssues(
        {
          parentCategoryId: parentId,
          categoryId: Number(listingData.category_id),
          brandCategoryId: Number(listingData.brand_category_id) || 0,
          hasBrands,
          subcategoryCount: children.length,
          title: listingData.title,
          description: listingData.description,
          price: listingData.price,
          priceAgreement: listingData.price_agreement,
          location: listingData.location,
          sellerName: listingData.seller_name,
          sellerPhone: listingData.seller_phone,
          imageCount: photoCountForValidation,
          isKerkoj: isKerkojCategory,
          isDhurata: isDhurataCategory,
          isUploading,
        },
        categoryLocale,
      );
      if (preflight.length > 0) {
        refusePost(formatPreflightSummary(preflight));
        return;
      }
    }

    let resolvedCategoryId = Number(listingData.category_id);

    if (children.length === 0) {
      resolvedCategoryId = parentId;
    } else if (!resolvedCategoryId || resolvedCategoryId < 1) {
      if (children.length === 1) {
        resolvedCategoryId = children[0]!.id;
        form.setValue("category_id", resolvedCategoryId);
      } else if (!isAdminListingMode) {
        refusePost(
          watchTitle.trim().length < 5
            ? t.postErrTitleForSubcategory
            : t.postErrChooseSubcategory,
        );
        return;
      }
    }

    const resolvedBrandId = Number(listingData.brand_category_id) || 0;
    if (hasBrands && resolvedBrandId < 1 && !isAdminListingMode) {
      refusePost(t.postErrChooseBrand);
      return;
    }
    const partCat = subCats.find((c: any) => c.id === resolvedCategoryId);
    const adminPriceByAgreement = !!listingData.price_agreement || rawPrice <= 0;
    const validation = isAdminListingMode
      ? {
          ok: listingData.title.trim().length >= 1,
          issues: [] as { code: string; message: string; blockedWord?: string }[],
          extraDescriptionPrefix: "",
          payloadExtras: {} as Record<string, unknown>,
          price: adminPriceByAgreement ? 0 : rawPrice,
          price_agreement: adminPriceByAgreement,
        }
      : catEngine.validateListing(
          {
            ...listingData,
            category_id: resolvedCategoryId,
            brand_category_id: resolvedBrandId || listingData.brand_category_id,
          },
          Number(parentCatId) || effectiveCategoryId,
          {
            imageCount: photoCountForValidation,
            subcategoryName: partCat?.name,
            sellLangBlockedTemplate: tx.ui_sellLangBlocked,
          },
        );
    if (!validation.ok) {
      if (isAdminListingMode) {
        refusePost(t.postErrTitleForSubcategory ?? "Titulli kërkohet.");
        return;
      }
      const issue = validation.issues[0]!;
      const fbLocale = translationKeyForUiLang(uiLang);
      const title =
        issue.code === "NO_PHOTOS"
          ? t.addAtLeastPhoto
          : issue.code === "AP_PART_REQUIRED"
            ? t.ap_post_err_part
            : issue.code === "AP_COMPAT_REQUIRED"
              ? t.ap_post_err_compat
              : clientValidationMessage(issue.code, fbLocale, {
                  blockedWord: issue.blockedWord,
                }) ?? issue.message;
      refusePost(title);
      return;
    }
    const finalDescription = validation.extraDescriptionPrefix + listingData.description;
    const formName = listingData.seller_name?.trim() ?? "";
    const formPhone = listingData.seller_phone?.trim() ?? "";

    if (activeUser && userNeedsSellerProfile(activeUser) && !isAdminListingMode) {
      setIsSubmitting(true);
      try {
        const bootRes = await fetchWithTimeout(
          "/api/auth/profile/seller-bootstrap",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              display_name: formName,
              contact_phone: formPhone,
            }),
          },
          LISTING_POST_TIMEOUT_MS,
        );
        const bootBody = (await bootRes.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (!bootRes.ok) {
          refusePost(bootBody.message ?? bootBody.error ?? t.toast_reqFail);
          return;
        }
        await refresh();
      } catch (e) {
        refusePost(getFetchErrorMessage(e));
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    const profileContact = activeUser ? sellerContactFromUser(activeUser) : { seller_name: "", seller_phone: "" };
    const contact = isAdminListingMode
      ? { seller_name: formName, seller_phone: formPhone }
      : {
          seller_name: formName || profileContact.seller_name,
          seller_phone: formPhone || profileContact.seller_phone,
        };

    const payload: Record<string, unknown> = {
      title: listingData.title,
        description: finalDescription,
      price: Number.isFinite(validation.price) ? validation.price : 0,
      price_agreement: validation.price_agreement,
      lang: listingLang,
      category_id: resolvedBrandId || resolvedCategoryId || parentId,
      location: listingData.location,
      listing_country: listingCountry,
      seller_name: contact.seller_name,
      seller_phone: contact.seller_phone,
      condition: listingData.condition,
      image_url: hasListingVideo ? undefined : joinListingImageUrls(imageUrls) ?? undefined,
      video_url: hasListingPhotos ? undefined : videoUrl ?? undefined,
        is_featured: false,
      ...validation.payloadExtras,
    };

    setIsSubmitting(true);

    if (isAdminEditMode && adminEditId) {
      try {
        await updateAdminListing(adminEditId, {
          title: String(payload.title),
          description: String(payload.description),
          price: Number(payload.price) || 0,
          category_id: Number(payload.category_id),
          location: String(payload.location),
          seller_name: contact.seller_name,
          seller_phone: contact.seller_phone,
          condition: String(payload.condition),
          image_url: payload.image_url as string | undefined,
          video_url: payload.video_url as string | undefined,
          views: adminEditViews ?? undefined,
          ...(validation.payloadExtras as Record<string, unknown>),
        });
        queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentListingsQueryKey() });
        clearListingPostDraft();
        clearListingPostSessionActive();
        toast({ title: tx.adm_edit_success ?? "Shpallja u përditësua." });
        setLocation("/admin");
      } catch (e) {
        refusePost(getFetchErrorMessage(e, tx.adm_post_err_generic ?? t.postError));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (isAdminPostMode) {
      try {
        const row = await createAdminListing({
          title: String(payload.title),
          description: String(payload.description),
          price: Number(payload.price) || 0,
          category_id: Number(payload.category_id),
          location: String(payload.location),
          seller_name: contact.seller_name,
          seller_phone: contact.seller_phone,
          condition: String(payload.condition),
          image_url: payload.image_url as string | undefined,
          video_url: payload.video_url as string | undefined,
          shop_id: adminShopId ?? undefined,
          ...(validation.payloadExtras as Record<string, unknown>),
        });
        queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentListingsQueryKey() });
        clearListingPostDraft();
        clearListingPostSessionActive();
        toast({ title: tx.adm_post_success ?? "Shpallja u publikua." });
        setLocation(adminShopId ? "/admin/shops" : `/listings/${row.id}?posted=1`);
      } catch (e) {
        refusePost(getFetchErrorMessage(e, tx.adm_post_err_generic ?? t.postError));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    void fetchWithTimeout(
      "/api/listings",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      },
      LISTING_POST_TIMEOUT_MS,
    )
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as ListingPostApiBody & {
          id?: number;
          is_first_listing?: boolean;
          show_packages?: boolean;
          wallet_balance_cents?: number;
          used?: number;
          limit?: number;
        };
        if (!res.ok) {
          const { message } = resolveListingPostApiError(
            body,
            res.status,
            body.message?.trim() ||
              tx.ui_contentModerationFail?.trim() ||
              t.postError,
            categoryLocale,
          );
          refusePost(message);
          return;
        }
        queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentListingsQueryKey() });
        clearListingPostDraft();
        clearListingPostSessionActive();
        const engagement = engagementCopyForUiLang(uiLang);
        if (body.is_first_listing) {
          queueFirstListingCelebration();
        } else {
          toast({ title: engagement.subsequentListingToast });
        }
        setLocation(`/listings/${(body as { id: number }).id}?posted=1`);
      })
      .catch((e) => refusePost(getFetchErrorMessage(e)))
      .finally(() => setIsSubmitting(false));
  };

  const cityList = locationsForListingMarket(listingCountry);

  if (isDhurataPostRoute && !dhurataPledgeOk) {
  return (
    <div className="min-h-screen bg-gray-50">
        <AuthToolbar />
        <DhurataGiftPledge
          onAccepted={() => setDhurataPledgeOk(true)}
          onBack={() => setLocation("/categories/dhurata-falas")}
        />
      </div>
    );
  }

  if (adminEditLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" aria-hidden />
      </div>
    );
  }

  const canEditSellerPhone = isAdminListingMode || !activeUser || !userHasSellerPhone(activeUser);

  return (
    <div className="min-h-screen bg-gray-50">
      {userNeedsSellerProfile(activeUser) && !isAdminListingMode && <SellerProfileGate onReady={() => undefined} />}
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <MobileSafeTopSpacer />
        <div className="max-w-2xl mx-auto px-4 min-h-[3.75rem] flex items-center gap-4 py-2">
          <button
            data-testid="button-back"
            onClick={() => setLocation(isAdminListingMode ? "/admin" : "/listings")}
            className="flex items-center gap-1.5 text-sm font-medium rounded-lg text-gray-500 hover:text-gray-900 transition-colors touch-manipulation min-h-12 min-w-[2.75rem] justify-center px-2 -mx-2"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">{t.back}</span>
          </button>
          <div className="flex-1 text-center">
            <span className="font-bold text-lg text-gray-900">
              {isAdminEditMode
                ? (tx.adm_edit_title ?? "Ndrysho shpalljen (admin)")
                : isAdminPostMode
                  ? (tx.adm_post_title ?? t.postTitle)
                  : isKerkojCategory
                    ? t.kerkojFormPostTitle
                    : t.postTitle}
            </span>
          </div>
          <AuthToolbar variant="compact" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">
        {showRecoveryBanner ? (
          <ListingPostRecoveryBanner
            onDismiss={dismissRecovery}
            onRestore={restoreDraftMedia}
          />
        ) : null}
        {isAdminListingMode ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 leading-relaxed space-y-2">
            <div>
              <p className="font-bold">{tx.ui_adminOnBehalfTitle}</p>
              <p className="mt-1">
                {isAdminEditMode
                  ? (tx.adm_edit_intro ?? "Ndrysho të gjitha fushat — kategoria, foto, përshkrim, shitësi, çmimi.")
                  : tx.ui_adminOnBehalfBody}
              </p>
              {adminShopId ? (
                <p className="mt-2 text-xs font-semibold">
                  Shpallja do të lidhet me dyqanin #{adminShopId}.
                </p>
              ) : null}
            </div>
            {isAdminEditMode && adminEditViews != null ? (
              <div className="flex items-center gap-2 pt-1 border-t border-violet-200/80">
                <Label htmlFor="adm-edit-views" className="text-xs font-semibold shrink-0">
                  {tx.adm_edit_views_lbl ?? "Shikime"}
                </Label>
                <Input
                  id="adm-edit-views"
                  type="number"
                  min={0}
                  className="h-9 max-w-[8rem] bg-white"
                  value={adminEditViews}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setAdminEditViews(Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
                  }}
                />
              </div>
            ) : null}
          </div>
        ) : null}
        {!isAdminListingMode && !activeUser && !authLoading ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 leading-relaxed">
            Duhet të hysh për të postuar shpalljen.{" "}
            <Link
              href={loginUrlWithReturn(pathname || "/listings/new")}
              className="font-bold text-blue-700 underline-offset-2 hover:underline"
            >
              Kyçu këtu
            </Link>
            {" "}— fotot që ngarkon ruhen automatikisht.
          </div>
        ) : null}
        {hasShop === false && tx.shopSuggestBanner ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-gray-800 leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{tx.shopSuggestBanner}</span>
            <Link
              href={staticPagePaths(uiLang).openShop}
              className="inline-flex font-bold text-blue-700 hover:text-blue-900 underline-offset-2 hover:underline whitespace-nowrap"
            >
              {t.shopSuggestBannerBtn}
            </Link>
          </div>
        ) : null}
        {isKerkojCategory ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-sm text-gray-800 leading-relaxed">
            {t.kerkojFormBanner}
          </div>
        ) : null}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-4">

            {/* ── 1. Photos or video (one or the other) ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 space-y-4">
              <ListingPhotoUploadBoundary
                key={photoUploadKey}
                onRetry={() => setPhotoUploadKey((k) => k + 1)}
              >
              <div className="space-y-4">
                <div className={hasListingVideo ? "opacity-50 pointer-events-none" : undefined}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">
                      {isKerkojCategory ? t.kerkojFormPhotosLbl : t.listingPhotos}{" "}
                      <span className="text-red-500">*</span>
                      <span className="text-gray-400 font-normal ml-1">
                        {t.listingPhotosMinHint} {t.listingPhotosMaxHint}
                      </span>
                    </Label>
                    <span className="text-sm text-gray-400">
                      {imageUrls.length}/{maxListingPhotos}
                    </span>
                  </div>

                  {hasListingVideo ? (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
                      {t.listingMediaRemoveVideoForPhotos}
                    </p>
                  ) : null}

                  <input
                    ref={uploadRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <input
                    ref={cameraPhotoRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {(isAnalyzingImage || isUploading) && (
                    <p className="text-sm text-blue-600 font-medium mb-2 flex items-center gap-2" role="status">
                      <Loader2 size={14} className="animate-spin shrink-0" />
                      {isAnalyzingImage ? t.analyzingPhoto : t.uploading}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => uploadRef.current?.click()}
                    disabled={isUploading || isAnalyzingImage || !imageUpload.ready || atPhotoLimit || hasListingVideo}
                    className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl py-12 px-6 text-center transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none min-h-[10.5rem] touch-manipulation"
                  >
                    {isUploading || isAnalyzingImage ? (
                      <div className="flex flex-col items-center gap-1.5 text-blue-500">
                        <Loader2 size={30} className="animate-spin" />
                        <p className="text-sm font-semibold">{isAnalyzingImage ? t.analyzingPhoto : t.uploading}</p>
                        <p className="text-sm text-gray-400">{t.waitPlease}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                        <ImagePlus size={30} />
                        <p className="text-sm font-semibold text-gray-600">{t.addPhoto}</p>
                        <p className="text-sm">
                          {isKerkojCategory ? t.kerkojFormClickPhoto : t.clickToSelect}
                        </p>
                        {!isKerkojCategory && !isDhurataPostRoute && imageUrls.length === 0 ? (
                          <p className="text-xs text-blue-500/90 max-w-xs">{t.analyzingPhotoHint}</p>
                        ) : null}
                        <p className="text-sm text-gray-300">JPG, PNG, WEBP</p>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraPhotoRef.current?.click()}
                    disabled={isUploading || !imageUpload.ready || atPhotoLimit || hasListingVideo}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 py-3 px-4 text-sm font-semibold text-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <Camera size={20} className="text-blue-600 shrink-0" />
                    {t.photoCameraBtn}
                  </button>

                  <ImagePreview urls={imageUrls} onRemove={isUploading ? () => {} : removeImage} mainLabel={t.mainPhotoLabel} />

                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    {isKerkojCategory
                      ? t.kerkojFormPhotoHint
                      : hasShop
                        ? t.firstPhotoAiHintShop
                        : t.firstPhotoAiHint}
                  </p>
                </div>

                <div className={`border-t border-gray-100 pt-4${hasListingPhotos ? " opacity-50 pointer-events-none" : ""}`}>
                  <Label className="text-sm font-medium text-gray-700">
                    {listingVideoLabel(uiLang)}{" "}
                    <span className="text-gray-400 font-normal">{listingVideoFormatsHint(uiLang)}</span>
                  </Label>

                  {hasListingPhotos ? (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                      {t.listingMediaRemovePhotosForVideo}
                    </p>
                  ) : null}

                  <input
                    ref={videoUploadRef}
                    type="file"
                    accept="video/*,.mp4,.mov,.avi,.m4v,.3gp,.webm"
                    className="hidden"
                    onChange={(e) => void handleVideoChange(e)}
                  />
                  <input
                    ref={cameraVideoRef}
                    type="file"
                    accept="video/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => void handleVideoChange(e)}
                  />

                  {!videoUrl && !isVideoUploading && !hasListingPhotos ? (
                    <div className="mt-2 space-y-2">
                      <button
                        type="button"
                        onClick={() => videoUploadRef.current?.click()}
                        disabled={!videoUpload.ready}
                        className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl py-8 px-4 text-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[6rem] touch-manipulation"
                      >
                        <div className="flex flex-col items-center gap-1.5 text-gray-500">
                          <Video size={28} className="text-gray-400" />
                          <p className="text-sm font-semibold text-gray-600">
                            {listingVideoAddLabel(uiLang)}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraVideoRef.current?.click()}
                        disabled={!videoUpload.ready}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 py-3 px-4 text-sm font-semibold text-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed touch-manipulation"
                      >
                        <Video size={20} className="text-blue-600 shrink-0" />
                        {t.videoCameraBtn}
                      </button>
                    </div>
                  ) : null}

                  {isVideoUploading ? (
                    <div className="mt-2 flex flex-col items-center gap-2 py-8 text-blue-600">
                      <Loader2 size={28} className="animate-spin" />
                      <p className="text-sm font-semibold">
                        {videoUploadPhase === "preparing"
                          ? t.videoPreparingTitle
                          : t.uploading}
                      </p>
                      {videoUploadPhase === "preparing" ? (
                        <p className="text-xs text-gray-500 text-center max-w-xs px-4">
                          {t.videoPreparingHint}
                          {videoPreparePct > 0 ? ` ${videoPreparePct}%` : ""}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {videoUrl && !isVideoUploading ? (
                    <div className="mt-2 relative rounded-xl overflow-hidden border border-gray-200 bg-black">
                      <div
                        className="absolute top-2 left-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/95 shadow-sm"
                        aria-hidden
                      >
                        <CheckCircle2 size={18} className="text-green-600" />
                      </div>
                      <video
                        src={videoUrl}
                        controls
                        playsInline
                        className="w-full max-h-64 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVideoUrl(null);
                          if (imageUrls.length === 0) {
                            imageAnalyzedRef.current = false;
                            lastImageAnalysisRef.current = null;
                            lastVideoAnalyzeKeyRef.current = null;
                          }
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                        aria-label={listingVideoRemoveLabel(uiLang)}
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              </ListingPhotoUploadBoundary>
              </div>
            </div>

            {/* ── 2. Title ── */}
            <Section title={t.titleField} icon={Info}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isKerkojCategory ? t.kerkojFormTitleLbl : t.listingTitle}{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-title"
                        placeholder={
                          isKerkojCategory
                            ? t.kerkojFormTitlePh
                            : (tx.titlePlaceholderExample ??
                              "p.sh. BMW X5 2020, JBL 500, iPhone 14 Pro Max...")
                        }
                        {...field}
                        onBlur={(e) => {
                          const fixed = normalizeListingTitle(e.target.value);
                          if (fixed !== e.target.value) {
                            field.onChange(fixed);
                          }
                          field.onBlur();
                        }}
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
              currentBrandId={Number(brandCatId) || 0}
              onApply={(s) => {
                form.setValue("parent_category_id", s.parent_category_id);
                form.setValue("category_id", s.category_id);
                form.setValue("brand_category_id", s.brand_category_id ?? 0);
              }}
              adminPostMode={isAdminListingMode}
            />

            {/* ── 2. Category (kategori → nënkategori → marka) ── */}
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
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {translateCategory(cat.name, categoryLocale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {categoriesLoading ? (
                      <p className="text-sm mt-1 text-gray-500">Duke ngarkuar kategoritë…</p>
                    ) : null}
                    {!categoriesLoading && parentCats.length === 0 ? (
                      <p className="text-sm mt-1 text-red-600">Kategoritë nuk u ngarkuan. Rifreskoni faqen.</p>
                    ) : null}
                    <FormMessage />
                    {subCats.length > 0 && bodyCatId > 0 && (
                      <p className="text-sm mt-1 text-green-700" role="status">
                        {`${t.subcategory}: ${
                          translateCategory(
                            subCats.find((c: { id: number }) => c.id === Number(bodyCatId))?.name ?? "",
                            categoryLocale,
                          ) || "—"
                        }`}
                      </p>
                    )}
                    {showSubcategoryField ? (
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                          <FormItem className="mt-3">
                      <FormLabel>
                              {t.subcategory} <span className="text-red-500">*</span>
                      </FormLabel>
                            <Select
                              onValueChange={(v) => field.onChange(Number(v))}
                              value={field.value ? String(field.value) : ""}
                            >
                        <FormControl>
                                <SelectTrigger data-testid="select-subcategory">
                                  <SelectValue placeholder={t.chooseSubcategory} />
                          </SelectTrigger>
                        </FormControl>
                              <SelectContent className="max-h-[min(70vh,360px)]">
                                {subCats.map((cat: { id: number; name: string }) => (
                                  <SelectItem key={cat.id} value={String(cat.id)}>
                                    {translateCategory(cat.name, categoryLocale)}
                                  </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
                  </FormItem>
                )}
              />

              {hasBrands && !postFields.showAutoPjese && (
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
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {translateCategory(cat.name, categoryLocale)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
            </Section>

            {/* ── 3. Extra fields ── */}
            {postFields.showAutoPjese && (
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

            {postFields.showVetura && (
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

            {postFields.showRealEstate && (
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

            {postFields.showPhone && (
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
            <Section title={isKerkojCategory ? t.kerkojFormDescSection : t.descField}>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <FormLabel className="mb-0">
                        {isKerkojCategory ? t.kerkojFormDescSection : t.descField}{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      {!isKerkojCategory ? (
                        <ListingDescriptionHelper
                          description={field.value ?? ""}
                          onApplyDescription={(next) => field.onChange(next)}
                          adminPostMode={isAdminListingMode}
                        />
                      ) : null}
                    </div>
                    <FormControl>
                      <Textarea
                        data-testid="input-description"
                        placeholder={isKerkojCategory ? t.kerkojFormDescPh : t.descPlaceholder}
                        rows={isKerkojCategory ? 7 : 5}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    {isKerkojCategory ? (
                      <p className="text-sm text-blue-800/90 leading-relaxed">{t.kerkojFormDescNote}</p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            {/* ── 5. Price ── */}
            {!isKerkojCategory && (
            <Section title={t.priceField}>
              {!isDhurataCategory && (
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
              )}

              {(!priceAgreement || isDhurataCategory) && (
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
                            placeholder="p.sh. 150"
                            className="pr-14"
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            readOnly={isDhurataCategory}
                            disabled={isDhurataCategory}
                            value={
                              isDhurataCategory
                                ? 0
                                : field.value === undefined || field.value === null
                                  ? ""
                                  : field.value
                            }
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") {
                                field.onChange(undefined);
                                return;
                              }
                              const n = Number(raw);
                              field.onChange(Number.isFinite(n) ? n : undefined);
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">EUR</span>
                        </div>
                      </FormControl>
                      {isDhurataCategory && (
                        <p className="text-sm text-gray-500">{tx.ui_giftCategoryPriceNote}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </Section>
            )}

            {/* ── Location (city, then country) ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 space-y-4">
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
                <ListingCountryPicker
                  value={listingCountry}
                  onChange={setListingCountry}
                />
              </div>
            </div>

            {/* ── 8. Contact ── */}
            <Section title={t.contactSection}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="seller_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.yourName} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-seller-name"
                          placeholder="Arben Krasniqi"
                          readOnly={!!activeUser && !isAdminListingMode}
                          className={activeUser && !isAdminListingMode ? "bg-gray-50 cursor-not-allowed" : undefined}
                          {...field}
                        />
                      </FormControl>
                      {!isAdminListingMode && activeUser ? (
                        <p className="text-xs text-gray-500">{tx.ui_sellerNameProfileHint}</p>
                      ) : null}
                      {isAdminListingMode ? (
                        <p className="text-xs text-violet-700">{tx.ui_adminOnBehalfNameHint}</p>
                      ) : null}
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
                        <Input
                          data-testid="input-phone"
                          placeholder={`${market.prefix} 44 123 456`}
                          readOnly={!canEditSellerPhone}
                          className={!canEditSellerPhone ? "bg-gray-50 cursor-not-allowed" : undefined}
                          {...field}
                        />
                      </FormControl>
                      {isAdminListingMode ? (
                        <p className="text-xs text-violet-700">{tx.ui_adminOnBehalfPhoneHint}</p>
                      ) : canEditSellerPhone ? (
                        <p className="text-xs text-gray-500">{t.reg_sellerGate_sub}</p>
                      ) : null}
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
                        <Input
                          placeholder="kontakt@email.com"
                          type="email"
                          readOnly={!!activeUser?.email}
                          className={activeUser?.email ? "bg-gray-50 cursor-not-allowed" : undefined}
                          {...field}
                          value={field.value as string}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="xSellerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tx.ui_streetAddressLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={tx.ui_streetAddressPh} {...field} value={field.value as string} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* ── Submit ── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20 sm:static sm:bg-transparent sm:border-none sm:p-0">
              <div className="max-w-2xl mx-auto space-y-2">
                {postBlockMessage && (
                  <div
                    ref={postBlockRef}
                    role="alert"
                    className="text-sm text-red-800 bg-red-50 border border-red-300 rounded-xl px-3 py-2.5"
                    data-testid="listing-post-block-reason"
                  >
                    <p className="font-bold text-red-900">{postRefusedTitle}</p>
                    <p className="mt-1 leading-snug">{postBlockMessage}</p>
                    </div>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className={`w-full min-h-14 text-base font-bold rounded-xl ${
                    isDhurataCategory
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={isSubmitting}
                  data-testid="button-submit-listing"
                >
                  {isSubmitting
                    ? t.posting
                    : isAdminEditMode
                      ? (tx.adm_edit_submit ?? t.saveChanges)
                      : isAdminPostMode
                        ? (tx.adm_post_submit ?? t.submitListing)
                        : isDhurataCategory
                          ? tx.ui_postGiftBtn
                          : isKerkojCategory
                            ? t.kerkojFormPostTitle
                            : t.submitListing}
                </Button>
              </div>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
