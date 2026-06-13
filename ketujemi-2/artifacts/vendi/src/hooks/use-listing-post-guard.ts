import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  hasListingPostDraft,
  markListingPostSessionActive,
  readListingPostDraft,
  writeListingPostDraft,
} from "@/lib/listing-post-draft";
import { stabilizeListingPostPage } from "@/lib/listing-post-stable-mode";

/** Always show form after this — never leave a full-page spinner on /listings/new. */
const FORCE_FORM_MS = 1_200;
const DRAFT_FLUSH_MS = 2_000;

type Options = {
  imageUrls: string[];
  videoUrl: string | null;
  setImageUrls: (urls: string[]) => void;
  setVideoUrl: (url: string | null) => void;
};

function restoreDraft(
  draft: ReturnType<typeof readListingPostDraft>,
  imageUrls: string[],
  videoUrl: string | null,
  setImageUrls: (urls: string[]) => void,
  setVideoUrl: (url: string | null) => void,
): void {
  if (!draft) return;
  if (imageUrls.length === 0 && draft.images.length > 0) {
    setImageUrls(draft.images);
  }
  if (!videoUrl && draft.videoUrl) {
    setVideoUrl(draft.videoUrl);
  }
}

/**
 * Multi-layer guard for /listings/new — draft backup, bfcache, auth bypass, SW stabilize.
 */
export function useListingPostGuard({
  imageUrls,
  videoUrl,
  setImageUrls,
  setVideoUrl,
}: Options) {
  const { refresh } = useAuth();
  /** Form must always become visible — no infinite white spinner. */
  const [forceFormVisible, setForceFormVisible] = useState(false);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const stabilizedRef = useRef(false);

  useEffect(() => {
    markListingPostSessionActive();
    if (hasListingPostDraft()) {
      setShowRecoveryBanner(true);
    }
    const forceTimer = window.setTimeout(() => setForceFormVisible(true), FORCE_FORM_MS);
    return () => window.clearTimeout(forceTimer);
  }, []);

  useEffect(() => {
    if (stabilizedRef.current) return;
    stabilizedRef.current = true;
    const run = () => void stabilizeListingPostPage();
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 8_000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 6_000);
    return () => window.clearTimeout(t);
  }, []);

  const flushDraft = useRef(() => {
    writeListingPostDraft({ images: imageUrls, videoUrl });
  });

  useEffect(() => {
    flushDraft.current = () => writeListingPostDraft({ images: imageUrls, videoUrl });
  }, [imageUrls, videoUrl]);

  useEffect(() => {
    const onHide = () => flushDraft.current();
    const onBeforeUnload = () => flushDraft.current();
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });
    const interval = window.setInterval(() => flushDraft.current(), DRAFT_FLUSH_MS);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      const draft = readListingPostDraft();
      restoreDraft(draft, imageUrls, videoUrl, setImageUrls, setVideoUrl);
      if (event.persisted || draft) {
        setShowRecoveryBanner(!!draft);
        setForceFormVisible(true);
      }
      void refresh();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [imageUrls.length, videoUrl, setImageUrls, setVideoUrl, refresh]);

  useEffect(() => {
    restoreDraft(readListingPostDraft(), imageUrls, videoUrl, setImageUrls, setVideoUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount restore
  }, []);

  const dismissRecovery = () => setShowRecoveryBanner(false);

  return {
    forceFormVisible,
    showRecoveryBanner,
    dismissRecovery,
    hasStoredDraft: hasListingPostDraft(),
  };
}
