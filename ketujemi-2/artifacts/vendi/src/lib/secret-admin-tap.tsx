import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";

const TAP_TARGET = 6;
const TAP_WINDOW_MS = 3000;

type SecretAdminTapContextValue = {
  /** Returns true when the secret gesture fired (caller should skip default action). */
  registerTap: () => boolean;
};

const SecretAdminTapContext = createContext<SecretAdminTapContextValue | null>(null);

export function SecretAdminTapProvider({ children }: { children: ReactNode }) {
  const [pathname, setLocation] = useLocation();
  const tapCountRef = useRef(0);
  const windowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/admin-secret-panel");

  const registerTap = useCallback(() => {
    if (isAdminRoute) return false;

    tapCountRef.current += 1;
    if (windowTimerRef.current) clearTimeout(windowTimerRef.current);
    windowTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
      windowTimerRef.current = null;
    }, TAP_WINDOW_MS);

    if (tapCountRef.current >= TAP_TARGET) {
      tapCountRef.current = 0;
      if (windowTimerRef.current) {
        clearTimeout(windowTimerRef.current);
        windowTimerRef.current = null;
      }
      setLocation("/admin");
      return true;
    }
    return false;
  }, [isAdminRoute, setLocation]);

  return (
    <SecretAdminTapContext.Provider value={{ registerTap }}>
      {children}
    </SecretAdminTapContext.Provider>
  );
}

export function useSecretAdminTap(): SecretAdminTapContextValue {
  const ctx = useContext(SecretAdminTapContext);
  if (!ctx) {
    return { registerTap: () => false };
  }
  return ctx;
}
