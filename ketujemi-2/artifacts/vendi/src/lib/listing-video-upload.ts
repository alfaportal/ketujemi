import { useCallback } from "react";
import { uploadVideoToCloudinary, useCloudinaryConfig } from "./cloudinary-config";
import { isFetchTimeoutError } from "./fetch-with-timeout";
import {
  LISTING_VIDEO_MAX_BYTES,
  LISTING_VIDEO_MAX_MB,
  listingVideoShortenMessage,
  prepareListingVideoFile,
  type VideoPrepareProgress,
} from "./listing-video-prepare";

export { LISTING_VIDEO_MAX_BYTES, LISTING_VIDEO_MAX_MB, listingVideoShortenMessage };

export function listingVideoTooLargeMessage(uiLang: string): { title: string; description: string } {
  return listingVideoShortenMessage(uiLang);
}

export function listingVideoFormatsHint(uiLang: string): string {
  const mb = String(LISTING_VIDEO_MAX_MB);
  switch (uiLang) {
    case "mk":
      return `(MP4, MOV, AVI • Full HD • автоматски до ${mb} MB)`;
    case "mne":
      return `(MP4, MOV, AVI • Full HD • automatski do ${mb} MB)`;
    case "en":
      return `(MP4, MOV, AVI • Full HD • auto-optimized to ${mb} MB)`;
    default:
      return `(MP4, MOV, AVI • Full HD • optimizohet automatikisht deri në ${mb} MB)`;
  }
}

const VIDEO_EXT = /\.(mp4|mov|avi|m4v|3gp|3gpp|webm|mkv)$/i;

/** Phone gallery/camera often uses 3GP, WebM, or empty MIME with a video extension. */
export function isAllowedListingVideoFile(file: File): boolean {
  const mime = file.type?.trim().toLowerCase() ?? "";
  if (mime.startsWith("video/")) return true;
  return VIDEO_EXT.test(file.name);
}

export function listingVideoErrorMessage(
  err: unknown,
  uiLang: string,
): { title: string; description: string } | null {
  const code = err instanceof Error ? err.message : "";
  const mb = String(LISTING_VIDEO_MAX_MB);

  if (code === "invalid_video_format") {
    switch (uiLang) {
      case "mk":
        return {
          title: "Невалиден формат",
          description: "Изберете видео (MP4, MOV, AVI или од камера/галерија).",
        };
      case "mne":
        return {
          title: "Nevažeći format",
          description: "Odaberite video (MP4, MOV, AVI ili sa kamere/galerije).",
        };
      case "en":
        return {
          title: "Invalid format",
          description: "Choose a video (MP4, MOV, AVI, or from camera/gallery).",
        };
      default:
        return {
          title: "Format i pavlefshëm",
          description: "Zgjidhni një video (MP4, MOV, AVI ose nga kamera/galeria).",
        };
    }
  }

  if (code === "video_shorten_needed" || code === "video_too_large") {
    return listingVideoShortenMessage(uiLang);
  }

  if (code === "video_metadata_failed" || code === "video_metadata_timeout") {
    switch (uiLang) {
      case "mk":
        return {
          title: "Видеото не се чита",
          description: `Пробајте пократко MP4 видео под ${mb} MB.`,
        };
      case "mne":
        return {
          title: "Video se ne može pročitati",
          description: `Pokušajte kraći MP4 video ispod ${mb} MB.`,
        };
      case "en":
        return {
          title: "Could not read video",
          description: `Try a shorter MP4 video under ${mb} MB.`,
        };
      default:
        return {
          title: "Videoja nuk lexohet",
          description: `Provoni një MP4 më të shkurtër nën ${mb} MB.`,
        };
    }
  }

  if (isFetchTimeoutError(err) || code === "video_upload_failed") {
    switch (uiLang) {
      case "mk":
        return {
          title: "Надвор од мрежа",
          description: "Видеото е преголемо за бавна мрежа. Пробајте Wi‑Fi или пократко видео.",
        };
      case "mne":
        return {
          title: "Van mreže",
          description: "Video je preveliko za sporu mrežu. Probajte Wi‑Fi ili kraći video.",
        };
      case "en":
        return {
          title: "Upload timed out",
          description: "Video is too large for a slow connection. Try Wi‑Fi or a shorter clip.",
        };
      default:
        return {
          title: "Jashtë rrjetit",
          description: "Videoja është shumë e madhe për rrjet të ngadaltë. Provoni Wi‑Fi ose video më të shkurtër.",
        };
    }
  }

  return null;
}

export type ListingVideoUploadPhase = "preparing" | "uploading";

/** Cloudinary video upload for listing form (optional, max 1 per listing). */
export function useListingVideoUpload() {
  const cloudinary = useCloudinaryConfig();

  const uploadFile = useCallback(
    async (
      file: File,
      opts?: {
        onPhase?: (phase: ListingVideoUploadPhase) => void;
        onPrepareProgress?: VideoPrepareProgress;
      },
    ): Promise<string> => {
      if (!cloudinary.ready) {
        throw new Error("upload_not_configured");
      }
      if (!isAllowedListingVideoFile(file)) {
        throw new Error("invalid_video_format");
      }

      opts?.onPhase?.("preparing");
      const prepared = await prepareListingVideoFile(file, opts?.onPrepareProgress);

      if (prepared.size > LISTING_VIDEO_MAX_BYTES) {
        throw new Error("video_shorten_needed");
      }

      opts?.onPhase?.("uploading");
      return uploadVideoToCloudinary(prepared, cloudinary);
    },
    [cloudinary],
  );

  return {
    ready: cloudinary.ready,
    uploadFile,
  };
}
