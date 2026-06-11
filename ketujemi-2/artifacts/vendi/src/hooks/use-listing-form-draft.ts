import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ListingMarketCode } from "@/lib/market-context";
import type { NewListingFormData } from "@/lib/listing-form-schema";
import { applyListingFormDraft } from "@/components/listing-form-draft-banner";
import {
  flushListingFormDraft,
  listingDraftHasContent,
  readListingFormDraft,
  saveListingFormDraft,
  setupListingDraftPageGuard,
  type ListingFormDraft,
} from "@/lib/listing-form-draft";

type Args = {
  pathname: string;
  form: UseFormReturn<NewListingFormData>;
  imageUrls: string[];
  videoUrl: string | null;
  listingCountry: ListingMarketCode;
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  setVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setListingCountry: React.Dispatch<React.SetStateAction<ListingMarketCode>>;
  markImagesAnalyzed: () => void;
  skipCategoryCascade: () => void;
};

export function useListingFormDraft({
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
}: Args) {
  const [draftRestored, setDraftRestored] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const snapshotRef = useRef<ListingFormDraft>({
    form: {},
    imageUrls: [],
    videoUrl: null,
    listingCountry,
    savedAt: 0,
  });

  const buildSnapshot = useCallback((): ListingFormDraft => {
    return {
      form: form.getValues(),
      imageUrls,
      videoUrl,
      listingCountry,
      savedAt: Date.now(),
    };
  }, [form, imageUrls, videoUrl, listingCountry]);

  const applyDraft = useCallback(
    (draft: ListingFormDraft) => {
      skipCategoryCascade();
      applyListingFormDraft(draft, {
        resetForm: (values) => form.reset({ ...form.getValues(), ...values }),
        setImageUrls,
        setVideoUrl,
        setListingCountry,
        markImagesAnalyzed,
      });
      flushListingFormDraft(pathname, draft);
    },
    [
      form,
      markImagesAnalyzed,
      pathname,
      setImageUrls,
      setListingCountry,
      setVideoUrl,
      skipCategoryCascade,
    ],
  );

  const applyDraftRef = useRef(applyDraft);
  applyDraftRef.current = applyDraft;

  const restoreFromStorage = useCallback(() => {
    const draft = readListingFormDraft(pathname);
    if (!listingDraftHasContent(draft)) return false;
    applyDraftRef.current(draft!);
    setDraftRestored(true);
    setShowBanner(true);
    return true;
  }, [pathname]);

  useEffect(() => {
    const draft = readListingFormDraft(pathname);
    if (!listingDraftHasContent(draft)) return;
    applyDraftRef.current(draft!);
    setDraftRestored(true);
    setShowBanner(true);
  }, [pathname]);

  const syncDraft = useCallback(() => {
    const snap = buildSnapshot();
    snapshotRef.current = snap;
    saveListingFormDraft(pathname, snap);
    if (listingDraftHasContent(snap)) setShowBanner(true);
  }, [buildSnapshot, pathname]);

  useEffect(() => {
    const sub = form.watch(() => syncDraft());
    return () => sub.unsubscribe();
  }, [form, syncDraft]);

  useEffect(() => {
    syncDraft();
  }, [syncDraft, imageUrls, videoUrl, listingCountry]);

  useEffect(() => {
    return setupListingDraftPageGuard(pathname, () => snapshotRef.current);
  }, [pathname]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      void restoreFromStorage();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [restoreFromStorage]);

  const persistNow = useCallback(() => {
    const snap = buildSnapshot();
    snapshotRef.current = snap;
    flushListingFormDraft(pathname, snap);
  }, [buildSnapshot, pathname]);

  return {
    draftRestored,
    showBanner,
    setShowBanner,
    restoreFromStorage,
    persistNow,
  };
}
