import { useLocation } from "wouter";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { Button } from "@/components/ui/button";

type Props = {
  variant?: "default" | "compact";
  className?: string;
};

export function AuthToolbar({ variant = "default", className }: Props) {
  const [, setLocation] = useLocation();
  const { user, loading, refresh } = useAuth();
  const { t } = useMarket();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await refresh();
  }

  function goLogin() {
    const returnTo =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";
    setLocation(loginUrlWithReturn(returnTo));
  }

  const btnCls =
    variant === "compact"
      ? "h-12 min-h-12 px-2.5 text-sm md:h-8 md:min-h-0 md:text-xs"
      : "h-12 min-h-12 px-3 text-sm md:h-10 md:min-h-0";

  if (loading) {
    return (
      <span
        className={`inline-block w-14 rounded-lg bg-muted/50 animate-pulse h-11 md:h-9 ${className ?? ""}`}
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Button
        type="button"
        variant="outline"
        className={`${btnCls} font-semibold ${className ?? ""}`}
        data-testid="button-login-toolbar"
        onClick={goLogin}
      >
        {t.authLogin}
      </Button>
    );
  }

  const label =
    user.email ??
    (user.phone_e164_digits ? `+${user.phone_e164_digits}` : null) ??
    `#${user.id}`;

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Button
        type="button"
        variant="ghost"
        className={`${btnCls} font-semibold shrink-0 hidden sm:inline-flex`}
        onClick={() => setLocation("/profile")}
      >
        {t.authProfile}
      </Button>
      <span
        className="text-sm text-muted-foreground truncate font-medium hidden md:inline max-w-[116px]"
        title={label}
      >
        {label}
      </span>
      <Button
        type="button"
        variant="outline"
        className={`${btnCls} font-semibold shrink-0`}
        data-testid="button-logout-toolbar"
        onClick={() => {
          void logout();
        }}
      >
        {t.authLogout}
      </Button>
    </div>
  );
}
