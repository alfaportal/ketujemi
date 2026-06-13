import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  hasListingPostDraft,
  markListingPostSessionActive,
  readListingPostDraft,
  writeListingPostDraft,
} from "@/lib/listing-post-draft";
import { stabilizeListingPostPage } from "@/lib/listing-post-stable-mode";

const AUTH_STUCK_MS = 4_500;

type Options = {
  imageUrls: string[];
  videoUrl: string | null;
  setImageUrls: (urls: string[]) => void;
  setVideoUrl: (url: string | null) => void;
};

/**
 * Hardening layer for /listings/new — survives reload, bfcache, camera return, and auth stalls.
 */
export function useListingPostGuard({
  imageUrls,
  videoUrl,
  setImageUrls,
  setVideoUrl,
}: Options) {
  const { loading: authLoading, refresh } = useAuth();
  const [authStuckBypass, setAuthStuckBypass] = useState(false);
  const stabilizedRef = useRef(false);

  useEffect(() => {
    markListingPostSessionActive();
  }, []);

  useEffect(() => {
    if (!authLoading) return;
    const timer = window.setTimeout(() => {
      if (hasListingPostDraft()) setAuthStuckBypass(true);
    }, AUTH_STUCK_MS);
    return () => window.clearTimeout(timer);
  }, [authLoading]);

  useEffect(() => {
    if (stabilizedRef.current) return;
    stabilizedRef.current = true;
    const timer = window.setTimeout(() => {
      void stabilizeListingPostPage();
    }, 5_000);
    return () => window.clearTimeout(timer);
  }, []);

  const flushDraft = useRef(() => {
    writeListingPostDraft({ images: imageUrls, videoUrl });
  });

  useEffect(() => {
    flushDraft.current = () => writeListingPostDraft({ images: imageUrls, videoUrl });
  }, [imageUrls, videoUrl]);

  useEffect(() => {
    const onHide = () => flushDraft.current();
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });
    return () => {
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      const draft = readListingPostDraft();
      if (!draft) return;
      if (imageUrls.length === 0 && draft.images.length > 0) {
        setImageUrls(draft.images);
      }
      if (!videoUrl && draft.videoUrl) {
        setVideoUrl(draft.videoUrl);
      }
      void refresh();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [imageUrls.length, videoUrl, setImageUrls, setVideoUrl, refresh]);

  useEffect(() => {
    const draft = readListingPostDraft();
    if (!draft) return;
    if (imageUrls.length === 0 && draft.images.length > 0) {
      setImageUrls(draft.images);
    }
    if (!videoUrl && draft.videoUrl) {
      setVideoUrl(draft.videoUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time restore on mount
  }, []);

  return {
    authStuckBypass,
    hasStoredDraft: hasListingPostDraft(),
  };
}
