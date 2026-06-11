import { useCallback, useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ListingMarketCode } from "@/lib/market-context";
import type { NewListingFormData } from "@/lib/listing-form-schema";
import {
  flushListingFormDraft,
  listingDraftHasContent,
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
};

/** Silent background save only — no UI, no form.reset restore loops. */
export function useListingFormDraft({
  pathname,
  form,
  imageUrls,
  videoUrl,
  listingCountry,
}: Args) {
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

  const syncDraft = useCallback(() => {
    const snap = buildSnapshot();
    snapshotRef.current = snap;
    saveListingFormDraft(pathname, snap);
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

  const persistNow = useCallback(() => {
    const snap = buildSnapshot();
    snapshotRef.current = snap;
    if (listingDraftHasContent(snap)) {
      flushListingFormDraft(pathname, snap);
    }
  }, [buildSnapshot, pathname]);

  return { persistNow };
}
