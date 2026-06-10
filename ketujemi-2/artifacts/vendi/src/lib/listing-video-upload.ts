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

export function listingVideoLabel(uiLang: string): string {
  switch (uiLang) {
    case "mk":
      return "Едно видео за оглас";
    case "mne":
      return "Jedan video za oglas";
    case "en":
      return "One video for your listing";
    case "fr":
      return "Une vidéo pour l'annonce";
    case "de":
      return "Ein Video für Ihre Anzeige";
    case "it":
      return "Un video per il tuo annuncio";
    default:
      return "Një video për shpallje";
  }
}

export function listingVideoFormatsHint(uiLang: string): string {
  const mb = String(LISTING_VIDEO_MAX_MB);
  switch (uiLang) {
    case "mk":
      return `(MP4, MOV, AVI • Full HD • автоматски се оптимизира до ${mb} MB)`;
    case "mne":
      return `(MP4, MOV, AVI • Full HD • automatski se optimizuje do ${mb} MB)`;
    case "en":
      return `(MP4, MOV, AVI • Full HD • auto-optimized up to ${mb} MB)`;
    case "fr":
      return `(MP4, MOV, AVI • Full HD • optimisé automatiquement jusqu'à ${mb} Mo)`;
    case "de":
      return `(MP4, MOV, AVI • Full HD • automatisch optimiert bis ${mb} MB)`;
    case "it":
      return `(MP4, MOV, AVI • Full HD • ottimizzato automaticamente fino a ${mb} MB)`;
    default:
      return `(MP4, MOV, AVI • Full HD • optimizohet automatikisht deri në ${mb} MB)`;
  }
}

export function listingVideoAddLabel(uiLang: string): string {
  switch (uiLang) {
    case "mk":
      return "Додај видео";
    case "mne":
      return "Dodaj video";
    case "en":
      return "Add video";
    case "fr":
      return "Ajouter une vidéo";
    case "de":
      return "Video hinzufügen";
    case "it":
      return "Aggiungi video";
    default:
      return "Shto video";
  }
}

export function listingVideoRemoveLabel(uiLang: string): string {
  switch (uiLang) {
    case "mk":
      return "Отстрани видео";
    case "mne":
      return "Ukloni video";
    case "en":
      return "Remove video";
    case "fr":
      return "Supprimer la vidéo";
    case "de":
      return "Video entfernen";
    case "it":
      return "Rimuovi video";
    default:
      return "Hiq videon";
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
      case "fr":
        return {
          title: "Format non valide",
          description: "Choisissez une vidéo (MP4, MOV, AVI ou depuis l'appareil photo/galerie).",
        };
      case "de":
        return {
          title: "Ungültiges Format",
          description: "Wählen Sie ein Video (MP4, MOV, AVI oder von Kamera/Galerie).",
        };
      case "it":
        return {
          title: "Formato non valido",
          description: "Scegli un video (MP4, MOV, AVI o da fotocamera/galleria).",
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
      case "fr":
        return {
          title: "Impossible de lire la vidéo",
          description: `Essayez une vidéo MP4 plus courte sous ${mb} Mo.`,
        };
      case "de":
        return {
          title: "Video konnte nicht gelesen werden",
          description: `Versuchen Sie ein kürzeres MP4-Video unter ${mb} MB.`,
        };
      case "it":
        return {
          title: "Impossibile leggere il video",
          description: `Prova un video MP4 più corto sotto ${mb} MB.`,
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
