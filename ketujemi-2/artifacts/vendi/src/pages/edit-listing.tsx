import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetListing, useUpdateListing, useGetCategories, getGetListingQueryKey, getGetListingsQueryKey, ApiError } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useMarket,
  defaultListingMarketFromMarket,
  isListingMarketCode,
  locationsForListingMarket,
  LISTING_MARKET_CODES,
  type ListingMarketCode,
} from "@/lib/market-context";
import { ListingCountryPicker } from "@/components/listing-country-picker";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useListingFlowStable } from "@/hooks/use-listing-flow-stable";
import { userOwnsListing } from "@/lib/listing-ownership";
import { AuthToolbar } from "@/components/auth-toolbar";
import { CardPaymentsPanel } from "@/components/card-payments-panel";
import {
  fetchWithTimeout,
  getFetchErrorMessage,
  IMAGE_ANALYZE_TIMEOUT_MS,
} from "@/lib/fetch-with-timeout";
import {
  fileToVisionBase64,
  imageUrlToVisionBase64,
  type ListingImageAnalysis,
} from "@/lib/listing-image-vision";
import { listingApiLangFromUi } from "@/lib/listing-api-lang";
import { listingPhotoAnalyzeFailureToast } from "@/lib/listing-photo-analyze-toast";
import { clientValidationMessage } from "@/lib/listing-post-feedback-i18n";
import { useListingImageUpload } from "@/lib/listing-image-upload";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  location: z.string().min(1),
  condition: z.enum(["New", "Good", "Used"]),
  image_url: z.string().url().optional().or(z.literal("")),
  is_featured: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditListing() {
  useListingFlowStable();
  const [, params] = useRoute("/listings/:id/edit");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, market, uiLang } = useMarket();
  const { user, loading: authLoading } = useAuth();
  const imageUpload = useListingImageUpload();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [listingCountry, setListingCountry] = useState<ListingMarketCode>(() =>
    defaultListingMarketFromMarket(market.code),
  );
  const listingLang = listingApiLangFromUi(uiLang);

  const { data: listing, isLoading, isError, error, refetch } = useGetListing(id, {
    query: {
      enabled: !!id,
      queryKey: [...getGetListingQueryKey(id), user?.id ?? "guest"],
      retry: 1,
    },
  });

  useEffect(() => {
    if (authLoading || isLoading || !listing) return;
    if (!user) {
      setLocation(loginUrlWithReturn(`/listings/${id}/edit`));
      return;
    }
    const isOwner =
      (listing as { is_owner?: boolean }).is_owner ?? userOwnsListing(user, listing);
    if (!isOwner) {
      toast({ title: t.listingAccessDenied, variant: "destructive" });
      setLocation(`/listings/${id}`);
    }
  }, [authLoading, isLoading, user, listing, id, setLocation, toast, t.listingAccessDenied]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      location: "",
      condition: "Used",
      image_url: "",
      is_featured: false,
    },
  });

  useEffect(() => {
    if (listing) {
      form.reset({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        condition: listing.condition as "New" | "Good" | "Used",
        image_url: listing.image_url ?? "",
        is_featured: listing.is_featured,
      });
    }
  }, [listing]);

  const updateMutation = useUpdateListing({
    mutation: {
      onSuccess: (updated) => {
        queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetListingQueryKey(id) });
        toast({ title: t.updateSuccess });
        setLocation(`/listings/${updated.id}`);
      },
      onError: () => {
        toast({ title: t.updateError, variant: "destructive" });
      }
    }
  });

  const applyPhotoAnalysis = useCallback(
    (analysis: ListingImageAnalysis) => {
      const fieldOpts = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const;
      form.setValue("title", analysis.title, fieldOpts);
      form.setValue("description", analysis.description, fieldOpts);
    },
    [form],
  );

  const runPhotoAnalysis = useCallback(
    async (vision: { data: string; mediaType: string }) => {
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
          }),
        },
        IMAGE_ANALYZE_TIMEOUT_MS,
      );
      const body = (await res.json().catch(() => ({}))) as {
        analysis?: ListingImageAnalysis | null;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        if (res.status === 403 && body.error === "PROHIBITED_CONTENT") {
          form.setValue("image_url", "", { shouldDirty: true, shouldTouch: true });
          toast({
            title: clientValidationMessage("PROHIBITED_CONTENT", uiLang) ?? body.message ?? t.photoAnalyzeFailed,
            description: body.message ?? "",
            variant: "destructive",
          });
          return false;
        }
        const fail = listingPhotoAnalyzeFailureToast(res.status, t);
        toast({ ...fail, variant: "destructive" });
        return false;
      }
      if (body.analysis) {
        applyPhotoAnalysis(body.analysis);
        toast({ title: t.editPhotoAnalyzeOk });
        return true;
      }
      const fail = listingPhotoAnalyzeFailureToast(422, t);
      toast(fail);
      return false;
    },
    [applyPhotoAnalysis, listingLang, t, toast, uiLang, form],
  );

  const analyzeCurrentPhoto = useCallback(async () => {
    const imageUrl = form.getValues("image_url")?.trim();
    if (!imageUrl) {
      toast({ title: t.addAtLeastPhoto, variant: "destructive" });
      return;
    }
    setIsAnalyzingPhoto(true);
    try {
      const vision = await imageUrlToVisionBase64(imageUrl);
      await runPhotoAnalysis(vision);
    } catch (error) {
      toast({
        title: t.photoAnalyzeFailed,
        description: getFetchErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingPhoto(false);
    }
  }, [form, runPhotoAnalysis, t, toast]);

  const onPhotoFileSelected = useCallback(
    async (file: File | undefined) => {
      if (!file || !imageUpload.ready) return;
      setIsUploadingPhoto(true);
      try {
        const url = await imageUpload.uploadFile(file);
        form.setValue("image_url", url, { shouldDirty: true, shouldTouch: true });
        setIsAnalyzingPhoto(true);
        const vision = await fileToVisionBase64(file);
        await runPhotoAnalysis(vision);
      } catch (error) {
        toast({
          title: t.uploadFailed,
          description: getFetchErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setIsUploadingPhoto(false);
        setIsAnalyzingPhoto(false);
        if (photoInputRef.current) photoInputRef.current.value = "";
      }
    },
    [form, imageUpload, runPhotoAnalysis, t, toast],
  );

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      id,
      data: {
        ...data,
        image_url: data.image_url || undefined,
      }
    });
  };

  const cityList = locationsForListingMarket(listingCountry);

  useEffect(() => {
    if (isListingMarketCode(market.code)) {
      setListingCountry(market.code);
    }
  }, [market.code]);

  useEffect(() => {
    const loc = listing?.location;
    if (!loc) return;
    for (const code of LISTING_MARKET_CODES) {
      if (locationsForListingMarket(code).includes(loc)) {
        setListingCountry(code);
        return;
      }
    }
  }, [listing?.location]);

  useEffect(() => {
    const loc = form.getValues("location");
    const cities = locationsForListingMarket(listingCountry);
    if (loc && !cities.includes(loc)) {
      form.setValue("location", "");
    }
  }, [listingCountry, form]);

  const canEdit = !!(
    user &&
    listing &&
    ((listing as { is_owner?: boolean }).is_owner ?? userOwnsListing(user, listing))
  );

  if (authLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError && !listing) {
    const status = error instanceof ApiError ? error.status : 0;
    if (status >= 500 || status === 0) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-xl font-semibold mb-2">{t.listingLoadError}</p>
          <p className="text-muted-foreground mb-6">{t.listingLoadErrorSub}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => void refetch()}>{t.listingRetry}</Button>
            <Button variant="outline" onClick={() => setLocation("/listings")}>{t.backToListings}</Button>
          </div>
        </div>
      );
    }
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold mb-2">{t.listingNotFound}</p>
        <Button onClick={() => setLocation("/listings")}>{t.backToListings}</Button>
      </div>
    );
  }

  if (!user || !canEdit) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        data-testid="button-back"
        onClick={() => setLocation(`/listings/${id}`)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors rounded-lg min-h-12 px-1 -mx-1 touch-manipulation"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.backToListing}
      </button>

      <div className="flex justify-end mb-4">
        <AuthToolbar variant="compact" />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">{t.editListingTitle}</h1>

        <CardPaymentsPanel listingId={id} className="mb-6" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.titleField}</FormLabel>
                  <FormControl>
                    <Input data-testid="input-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.descField}</FormLabel>
                  <FormControl>
                    <Textarea data-testid="input-description" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.priceEur}</FormLabel>
                    <FormControl>
                      <Input data-testid="input-price" type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.conditionField}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-condition">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">{t.conditionNew}</SelectItem>
                        <SelectItem value="Good">{t.conditionGood}</SelectItem>
                        <SelectItem value="Used">{t.conditionUsed}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ListingCountryPicker
              value={listingCountry}
              onChange={setListingCountry}
              className="mb-4"
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.cityField ?? t.locationSection}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-location">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[min(70vh,360px)]">
                      {cityList.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.imageUrlField}</FormLabel>
                  <FormControl>
                    <Input data-testid="input-image-url" placeholder="https://..." {...field} />
                  </FormControl>
                  {field.value ? (
                    <img
                      src={field.value}
                      alt=""
                      className="mt-2 h-32 w-full rounded-lg border border-border object-cover"
                    />
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void onPhotoFileSelected(e.target.files?.[0])}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!imageUpload.ready || isUploadingPhoto || isAnalyzingPhoto}
                      onClick={() => photoInputRef.current?.click()}
                      data-testid="button-upload-edit-photo"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      ) : (
                        <Upload className="h-4 w-4 mr-1.5" />
                      )}
                      {isUploadingPhoto ? t.saving : t.editUploadPhotoBtn}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!field.value?.trim() || isAnalyzingPhoto || isUploadingPhoto}
                      onClick={() => void analyzeCurrentPhoto()}
                      data-testid="button-analyze-edit-photo"
                    >
                      {isAnalyzingPhoto ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-1.5" />
                      )}
                      {isAnalyzingPhoto ? t.analyzingPhoto : t.editAnalyzePhotoBtn}
                    </Button>
                  </div>
                  {isAnalyzingPhoto ? (
                    <p className="text-xs text-muted-foreground">{t.analyzingPhotoHint}</p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">{t.promoteLabel}</FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.promoteDesc}</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-featured" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setLocation(`/listings/${id}`)}
                data-testid="button-cancel-edit"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateMutation.isPending}
                data-testid="button-submit-edit"
              >
                {updateMutation.isPending ? t.saving : t.saveChanges}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
