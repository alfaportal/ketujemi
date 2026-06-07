import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { adminLogin } from "@/lib/admin-api";

const TAP_TARGET = 6;
const TAP_WINDOW_MS = 3000;

type SecretAdminTapContextValue = {
  /** Returns true when the secret gesture fired (caller should skip default action). */
  registerTap: () => boolean;
};

const SecretAdminTapContext = createContext<SecretAdminTapContextValue | null>(null);

function SecretAdminPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await adminLogin(password, rememberMe);
      onOpenChange(false);
      setPassword("");
      setLocation("/admin");
    } catch {
      setError("Fjalëkalimi nuk është i saktë.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setPassword("");
          setError("");
        }
      }}
    >
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Fjalëkalimi</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={(e) => void submit(e)}>
          <Input
            type="password"
            name="ketujemi-admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="min-h-11"
            autoFocus
          />
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-muted-foreground">Më mbaj të kyçur në këtë pajisje (30 ditë)</span>
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full min-h-11" disabled={busy || !password}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vazhdo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SecretAdminTapProvider({ children }: { children: ReactNode }) {
  const [pathname] = useLocation();
  const [promptOpen, setPromptOpen] = useState(false);
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
      setPromptOpen(true);
      return true;
    }
    return false;
  }, [isAdminRoute]);

  return (
    <SecretAdminTapContext.Provider value={{ registerTap }}>
      {children}
      <SecretAdminPasswordDialog open={promptOpen} onOpenChange={setPromptOpen} />
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
