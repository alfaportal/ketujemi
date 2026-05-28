/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  /** GA4 measurement ID (p.sh. G-XXXXXXXXXX) — vetëm prod. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Injected at build time (git SHA on Vercel). Shown in footer to verify deploy. */
declare const __APP_BUILD_ID__: string;
