import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  fetchWithTimeout,
  getFetchErrorMessage,
  IMAGE_ANALYZE_TIMEOUT_MS,
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
import { joinListingImageUrls } from "@/lib/listing-images";
import { fileToVisionBase64, type ListingImageAnalysis } from "@/lib/listing-image-vision";
import { videoFileToVisionBase64 } from "@/lib/listing-video-frame";
import { listingPhotoAnalyzeFailureToast } from "@/lib/listing-photo-analyze-toast";
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
} from "@/lib/auth-context";
import { AuthToolbar } from "@/components/auth-toolbar";
import { SellerProfileGate } from "@/components/seller-profile-gate";
import { translateCategory } from "@/lib/category-translations";
import {
  DhurataGiftPledge,
  DHURATA_PLEDGE_STORAGE_KEY,
} from "@/components/dhurata-gift-pledge";
import { DHURATA_FALAS_SLUG, KERKOJ_POST_PATH, KERKOJ_TE_BLEJ_SLUG } from "@/lib/special-listing-categories";
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
import {
  clearListingFormDraft,
  flushListingFormDraft,
  readListingFormDraft,
} from "@/lib/listing-form-draft";
import { ListingFormDraftBanner } from "@/components/listing-form-draft-banner";
import { useListingFormDraft } from "@/hooks/use-listing-form-draft";

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
  const [pathname, setLocation] = useLocation();
  const isDhurataPostRoute = pathname === "/listings/new/dhurata-falas";
  const isKerkojPostRoute = pathname === KERKOJ_POST_PATH;
  const skipListingImageAutofill = isDhurataPostRoute || isKerkojPostRoute;
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { market, t, uiLang } = useMarket();
  const tx = t as Record<string, string | undefined>;
  const categoryLocale = translationKeyForUiLang(uiLang);
  const listingLang = listingApiLangFromUi(uiLang);
  const [listingCountry, setListingCountry] = useState<ListingMarketCode>(() => {
    const draft = readListingFormDraft(pathname);
    return draft?.listingCountry ?? defaultListingMarketFromMarket(market.code);
  });
  const { data: allCategories } = useGetCategories();
  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    const draft = readListingFormDraft(pathname);
    return draft?.imageUrls ?? [];
  });
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
  const imageUpload = useListingImageUpload();
  const [videoUrl, setVideoUrl] = useState<string | null>(() => {
    const draft = readListingFormDraft(pathname);
    return draft?.videoUrl ?? null;
  });
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

  const parentCats = (allCategories ?? []).filter((c: any) => !c.parent_id);

  useEffect(() => {
    if (!user) return;
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
  }, [user]);

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
      ...(readListingFormDraft(pathname)?.form ?? {}),
    },
  });

  const parentCatId    = useWatch({ control: form.control, name: "parent_category_id" });
  const bodyCatId      = useWatch({ control: form.control, name: "category_id" });
  const brandCatId     = useWatch({ control: form.control, name: "brand_category_id" });
  const priceAgreement = useWatch({ control: form.control, name: "price_agreement" });
  const watchTitle = useWatch({ control: form.control, name: "title" }) ?? "";
  const watchDescription = useWatch({ control: form.control, name: "description" }) ?? "";
  const watchPrice = useWatch({ control: form.control, name: "price" }) ?? 0;
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const subCats   = (allCategories ?? []).filter((c: any) => c.parent_id === Number(parentCatId));
  const brandCats = (allCategories ?? []).filter((c: any) => c.parent_id === Number(bodyCatId));
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

  const suggestLang = listingLang;

  useEffect(() => {
    const parentId = Number(parentCatId);
    if (!parentId) return;
    if (skipTitleSuggestRef.current) return;
    if (lastImageAnalysisRef.current) return;

    const children = (allCategories ?? []).filter(
      (c: { parent_id?: number | null }) => c.parent_id === parentId,
    );
    if (children.length === 0) {
      form.setValue("category_id", parentId);
      return;
    }

    const titleTrim = watchTitle.trim();
    if (titleTrim.length < 5) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      void fetchWithTimeout("/api/ai/suggest-listing-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  }, [parentCatId, watchTitle, watchDescription, suggestLang, allCategories, form]);

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
    if (!user) setLocation(loginUrlWithReturn(pathname || "/listings/new"));
  }, [authLoading, user, setLocation, pathname]);

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

  const markImagesAnalyzed = useCallback(() => {
    imageAnalyzedRef.current = true;
  }, []);

  const { draftRestored, showBanner, setShowBanner, restoreFromStorage, persistNow } =
    useListingFormDraft({
      pathname,
      form,
      imageUrls,
      videoUrl,
      listingCountry,
      setImageUrls,
      setVideoUrl,
      setListingCountry,
      markImagesAnalyzed,
      skipCategoryCascade,
    });

  useEffect(() => {
    if (imageUrls.length > 0) imageAnalyzedRef.current = true;
  }, []);

  useEffect(() => {
    if (!user) return;
    const { seller_name, seller_phone } = sellerContactFromUser(user);
    if (seller_name && !form.getValues("seller_name")?.trim()) {
      form.setValue("seller_name", seller_name);
    }
    if (seller_phone && !form.getValues("seller_phone")?.trim()) {
      form.setValue("seller_phone", seller_phone);
    }
    if (user.email && !form.getValues("xSellerEmail")?.trim()) {
      form.setValue("xSellerEmail", user.email);
    }
  }, [user, form]);

  const applyImageAnalysis = useCallback(
    (analysis: ListingImageAnalysis) => {
      if (!allCategories?.length) {
        lastImageAnalysisRef.current = analysis;
        return;
      }
      lastImageAnalysisRef.current = analysis;
      pendingImageAnalysisRef.current = analysis;
      skipCategoryCascadeRef.current = true;
      skipBrandCascadeRef.current = true;
      skipTitleSuggestRef.current = true;

      const fieldOpts = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const;
      form.setValue("title", analysis.title, fieldOpts);
      form.setValue("description", analysis.description, fieldOpts);
      form.setValue("parent_category_id", analysis.parent_category_id, fieldOpts);
      form.setValue("category_id", analysis.category_id, fieldOpts);
      form.setValue("brand_category_id", analysis.brand_category_id ?? 0, fieldOpts);

      const reapply = () => {
        form.setValue("parent_category_id", analysis.parent_category_id, fieldOpts);
        form.setValue("category_id", analysis.category_id, fieldOpts);
        form.setValue("brand_category_id", analysis.brand_category_id ?? 0, fieldOpts);
        form.setValue("title", analysis.title, fieldOpts);
        form.setValue("description", analysis.description, fieldOpts);
      };

      queueMicrotask(reapply);
      window.setTimeout(reapply, 50);
      window.setTimeout(reapply, 200);
      window.setTimeout(() => {
        skipTitleSuggestRef.current = false;
      }, 3000);
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
          headers: { "Content-Type": "application/json" },
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
      };
      if (!res.ok) {
        const fail = listingPhotoAnalyzeFailureToast(res.status, tx);
        toast({ ...fail, variant: "destructive" });
        return false;
      }
      if (body.analysis) {
        imageAnalyzedRef.current = true;
        applyImageAnalysis(body.analysis);
        return true;
      }
      const fail = listingPhotoAnalyzeFailureToast(422, tx);
      toast(fail);
      return false;
    },
    [applyImageAnalysis, skipListingImageAutofill, listingLang, myShop, toast, tx],
  );

  const analyzeFirstListingMedia = useCallback(
    async (file: File, source: "image" | "video") => {
      if (imageAnalyzedRef.current || skipListingImageAutofill) return;
      setIsAnalyzingImage(true);
      try {
        const vision =
          source === "video"
            ? await videoFileToVisionBase64(file)
            : await fileToVisionBase64(file);
        await runListingVisionAnalysis(vision);
      } catch (error) {
        const code = error instanceof Error ? error.message : "";
        const isVideoFrame =
          source === "video" &&
          (code === "video_frame_failed" ||
            code === "video_frame_timeout" ||
            code === "video_frame_blank" ||
            code === "video_frame_encode_failed");
        toast({
          title: t.photoAnalyzeFailed,
          description: isVideoFrame
            ? t.videoAnalyzeFrameHint
            : getFetchErrorMessage(error, tx.photoAnalyzeFailedHint),
          variant: "destructive",
        });
      } finally {
        setIsAnalyzingImage(false);
      }
    },
    [skipListingImageAutofill, runListingVisionAnalysis, toast, tx],
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (!imageUpload.ready) {
      toast({ title: t.uploadFailed, variant: "destructive" });
      return;
    }
    const shouldAnalyze = imageUrls.length === 0 && !imageAnalyzedRef.current;
    const firstFile = shouldAnalyze ? files[0] : null;
    setIsUploading(true);
    persistNow();
    try {
      const [, urls] = await Promise.all([
        firstFile ? analyzeFirstListingMedia(firstFile, "image") : Promise.resolve(),
        Promise.all(files.map((file) => imageUpload.uploadFile(file))),
      ]);
      setImageUrls((prev) => {
        const next = [...prev, ...urls];
        flushListingFormDraft(pathname, {
          form: form.getValues(),
          imageUrls: next,
          videoUrl,
          listingCountry,
          savedAt: Date.now(),
        });
        return next;
      });
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
    persistNow();
    try {
      let vision: { data: string; mediaType: string } | null = null;
      if (shouldAnalyze) {
        setIsAnalyzingImage(true);
        try {
          vision = await videoFileToVisionBase64(file);
        } catch (error) {
          const code = error instanceof Error ? error.message : "";
          toast({
            title: t.photoAnalyzeFailed,
            description:
              code === "video_frame_blank" || code.startsWith("video_frame")
                ? t.videoAnalyzeFrameHint
                : getFetchErrorMessage(error, tx.photoAnalyzeFailedHint),
            variant: "destructive",
          });
        }
      }

      const url = await videoUpload.uploadFile(file, {
        onPhase: setVideoUploadPhase,
        onPrepareProgress: setVideoPreparePct,
      });

      if (vision) {
        const ok = await runListingVisionAnalysis(vision);
        if (ok) lastVideoAnalyzeKeyRef.current = videoFileKey;
      }

      setVideoUrl(url);
      flushListingFormDraft(pathname, {
        form: form.getValues(),
        imageUrls,
        videoUrl: url,
        listingCountry,
        savedAt: Date.now(),
      });
    } catch (err) {
      const msg = listingVideoErrorMessage(err, uiLang);
      if (msg) {
        toast({ title: msg.title, description: msg.description, variant: "destructive" });
      } else {
        toast({ title: t.uploadFailed, variant: "destructive" });
      }
    } finally {
      setIsAnalyzingImage(false);
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
    if (isDhurataPostRoute && !dhurataPledgeOk) {
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
      price: priceByAgreement ? 0 : rawPrice,
      price_agreement: priceByAgreement,
    };
    const parentId = Number(listingData.parent_category_id);
    const children = (allCategories ?? []).filter((c: { parent_id?: number | null }) => c.parent_id === parentId);
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
        imageCount: imageUrls.length,
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

    let resolvedCategoryId = Number(listingData.category_id);

    if (children.length === 0) {
      resolvedCategoryId = parentId;
    } else if (!resolvedCategoryId || resolvedCategoryId < 1) {
      if (children.length === 1) {
        resolvedCategoryId = children[0]!.id;
        form.setValue("category_id", resolvedCategoryId);
      } else {
        refusePost(
          watchTitle.trim().length < 5
            ? t.postErrTitleForSubcategory
            : t.postErrChooseSubcategory,
        );
        return;
      }
    }

    const resolvedBrandId = Number(listingData.brand_category_id) || 0;
    if (hasBrands && resolvedBrandId < 1) {
      refusePost(t.postErrChooseBrand);
      return;
    }
    const partCat = subCats.find((c: any) => c.id === resolvedCategoryId);
    const validation = catEngine.validateListing(
      {
        ...listingData,
        category_id: resolvedCategoryId,
        brand_category_id: resolvedBrandId || listingData.brand_category_id,
      },
      Number(parentCatId) || effectiveCategoryId,
      {
      imageCount: imageUrls.length,
      subcategoryName: partCat?.name,
      sellLangBlockedTemplate: tx.ui_sellLangBlocked,
    });
    if (!validation.ok) {
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

    if (userNeedsSellerProfile(user)) {
      setIsSubmitting(true);
      try {
        const bootRes = await fetchWithTimeout("/api/auth/profile/seller-bootstrap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            display_name: formName,
            contact_phone: formPhone,
          }),
        });
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

    const profileContact = sellerContactFromUser(user);
    const contact = {
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
      image_url: joinListingImageUrls(imageUrls) ?? undefined,
      video_url: videoUrl ?? undefined,
      is_featured: false,
      ...validation.payloadExtras,
    };

    setIsSubmitting(true);
    void fetchWithTimeout("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })
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
        const engagement = engagementCopyForUiLang(uiLang);
        if (body.is_first_listing) {
          queueFirstListingCelebration();
        } else {
          toast({ title: engagement.subsequentListingToast });
        }
        clearListingFormDraft(pathname);
        setLocation(`/listings/${(body as { id: number }).id}?posted=1`);
      })
      .catch((e) => refusePost(getFetchErrorMessage(e)))
      .finally(() => setIsSubmitting(false));
  };

  const cityList = locationsForListingMarket(listingCountry);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

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

  const canEditSellerPhone = !userHasSellerPhone(user);

  return (
    <div className="min-h-screen bg-gray-50">
      {userNeedsSellerProfile(user) && <SellerProfileGate onReady={() => undefined} />}
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <MobileSafeTopSpacer />
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
            <span className="font-bold text-lg text-gray-900">
              {isKerkojCategory ? t.kerkojFormPostTitle : t.postTitle}
            </span>
          </div>
          <AuthToolbar variant="compact" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">
        {(showBanner || draftRestored) ? (
          <ListingFormDraftBanner
            pathname={pathname}
            restored={draftRestored}
            onRestore={() => restoreFromStorage()}
            onDismiss={() => setShowBanner(false)}
          />
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

            {/* ── 1. Photos + video (si në shpallje: foto pastaj video) ── */}
            <Section title={t.photosSection} icon={Camera}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">
                      {isKerkojCategory ? t.kerkojFormPhotosLbl : t.listingPhotos}{" "}
                      <span className="text-red-500">*</span>
                      <span className="text-gray-400 font-normal ml-1">{t.listingPhotosMinHint}</span>
                    </Label>
                    <span className="text-sm text-gray-400">{imageUrls.length}</span>
                  </div>

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
                      {isUploading ? t.uploading : t.analyzingPhoto}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => uploadRef.current?.click()}
                    disabled={isUploading || isAnalyzingImage || !imageUpload.ready}
                    className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl py-12 px-6 text-center transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none min-h-[10.5rem] touch-manipulation"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1.5 text-blue-500">
                        <Loader2 size={30} className="animate-spin" />
                        <p className="text-sm font-semibold">{t.uploading}</p>
                        <p className="text-sm text-gray-400">{t.waitPlease}</p>
                      </div>
                    ) : isAnalyzingImage ? (
                      <div className="flex flex-col items-center gap-1.5 text-blue-500">
                        <Loader2 size={30} className="animate-spin" />
                        <p className="text-sm font-semibold">{t.analyzingPhoto}</p>
                        <p className="text-sm text-gray-400">{t.analyzingPhotoHint}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                        <ImagePlus size={30} />
                        <p className="text-sm font-semibold text-gray-600">{t.addPhoto}</p>
                        <p className="text-sm">
                          {isKerkojCategory ? t.kerkojFormClickPhoto : t.clickToSelect}
                        </p>
                        <p className="text-sm text-gray-300">JPG, PNG, WEBP</p>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraPhotoRef.current?.click()}
                    disabled={isUploading || isAnalyzingImage || !imageUpload.ready}
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

                <div className="border-t border-gray-100 pt-4">
                  <Label className="text-sm font-medium text-gray-700">
                    {listingVideoLabel(uiLang)}{" "}
                    <span className="text-gray-400 font-normal">{listingVideoFormatsHint(uiLang)}</span>
                  </Label>

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

                  {!videoUrl && !isVideoUploading ? (
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

                  {isVideoUploading || (isAnalyzingImage && imageUrls.length === 0) ? (
                    <div className="mt-2 flex flex-col items-center gap-2 py-8 text-blue-600">
                      <Loader2 size={28} className="animate-spin" />
                      <p className="text-sm font-semibold">
                        {isAnalyzingImage && !isVideoUploading
                          ? t.analyzingPhoto
                          : videoUploadPhase === "preparing"
                            ? t.videoPreparingTitle
                            : t.uploading}
                      </p>
                      {isAnalyzingImage && !isVideoUploading ? (
                        <p className="text-xs text-gray-500 text-center max-w-xs px-4">
                          {t.analyzingPhotoHint}
                        </p>
                      ) : videoUploadPhase === "preparing" ? (
                        <p className="text-xs text-gray-500 text-center max-w-xs px-4">
                          {t.videoPreparingHint}
                          {videoPreparePct > 0 ? ` ${videoPreparePct}%` : ""}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {videoUrl ? (
                    <div className="mt-2 relative rounded-xl overflow-hidden border border-gray-200 bg-black">
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
            </Section>

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
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {translateCategory(cat.name, categoryLocale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    {subCats.length > 1 && !bodyCatId && watchTitle.trim().length >= 5 && (
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
                    )}
                    {subCats.length > 1 && !bodyCatId && watchTitle.trim().length < 5 && (
                      <p className="text-sm mt-1 text-amber-700" role="status">
                        {t.subcategoryTitleMinHint}
                      </p>
                    )}
                    {subCats.length === 1 && !bodyCatId && (
                      <p className="text-sm mt-1 text-amber-700" role="status">
                        {t.subcategoryAutoSetting}
                      </p>
                    )}
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
                          readOnly={!!user}
                          className={user ? "bg-gray-50 cursor-not-allowed" : undefined}
                          {...field}
                        />
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
                        <Input
                          data-testid="input-phone"
                          placeholder={`${market.prefix} 44 123 456`}
                          readOnly={!canEditSellerPhone}
                          className={!canEditSellerPhone ? "bg-gray-50 cursor-not-allowed" : undefined}
                          {...field}
                        />
                      </FormControl>
                      {canEditSellerPhone && (
                        <p className="text-xs text-gray-500">{t.reg_sellerGate_sub}</p>
                      )}
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
                          readOnly={!!user?.email}
                          className={user?.email ? "bg-gray-50 cursor-not-allowed" : undefined}
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
