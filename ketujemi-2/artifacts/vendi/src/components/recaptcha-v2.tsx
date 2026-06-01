import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useCallback,
  useState,
} from "react";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => number;
      reset: (widgetId?: number) => void;
    };
    __recaptchaOnLoad?: () => void;
  }
}

const BUILD_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? "";

let scriptLoadPromise: Promise<void> | null = null;

function loadRecaptchaScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha?.render) return Promise.resolve();

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      window.__recaptchaOnLoad = () => resolve();
      const existing = document.querySelector('script[src*="recaptcha/api.js"]');
      if (existing) {
        const check = () => {
          if (window.grecaptcha?.render) resolve();
          else setTimeout(check, 50);
        };
        check();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?onload=__recaptchaOnLoad&render=explicit";
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error("recaptcha_script_failed"));
      document.head.appendChild(script);
    });
  }

  return scriptLoadPromise;
}

export type RecaptchaV2Handle = {
  reset: () => void;
};

type Props = {
  siteKey?: string;
  onTokenChange: (token: string | null) => void;
};

/** Load site key from Vite build or /api/config/public (Railway runtime). */
export function useRecaptchaSiteKey(): {
  siteKey: string;
  captchaRequired: boolean;
  loading: boolean;
} {
  const [siteKey, setSiteKey] = useState(BUILD_SITE_KEY);
  const [loading, setLoading] = useState(!BUILD_SITE_KEY);

  useEffect(() => {
    if (BUILD_SITE_KEY) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    void fetchWithTimeout("/api/config/public", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { recaptchaSiteKey?: string }) => {
        if (cancelled) return;
        setSiteKey(data.recaptchaSiteKey?.trim() ?? "");
      })
      .catch(() => {
        if (!cancelled) setSiteKey("");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    siteKey,
    captchaRequired: siteKey.length > 0,
    loading,
  };
}

export const RecaptchaV2 = forwardRef<RecaptchaV2Handle, Props>(function RecaptchaV2(
  { siteKey: siteKeyProp = "", onTokenChange },
  ref,
) {
  const siteKey = siteKeyProp.trim();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const handleExpired = useCallback(() => {
    onTokenChange(null);
  }, [onTokenChange]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
      onTokenChange(null);
    },
  }));

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;
    widgetIdRef.current = null;

    void loadRecaptchaScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.grecaptcha) return;
        if (widgetIdRef.current !== null) return;

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onTokenChange(token),
          "expired-callback": handleExpired,
          "error-callback": handleExpired,
        });
      })
      .catch(() => {
        onTokenChange(null);
      });

    return () => {
      cancelled = true;
    };
  }, [siteKey, onTokenChange, handleExpired]);

  if (!siteKey) {
    return null;
  }

  return (
    <div
      className="flex justify-center min-h-[78px]"
      ref={containerRef}
      data-testid="recaptcha-v2"
    />
  );
});
