import { useLocation } from "wouter";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { cnPrimaryBlue } from "@/lib/primary-button-classes";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenuDropdown } from "@/components/user-menu-dropdown";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "default" | "compact";
  className?: string;
};

export function AuthToolbar({ variant = "default", className }: Props) {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { t } = useMarket();

  function goLogin() {
    const returnTo =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";
    setLocation(loginUrlWithReturn(returnTo));
  }

  const btnCls =
    variant === "compact"
      ? "h-9 min-h-9 px-2 text-xs md:h-8 md:min-h-0 md:text-xs"
      : "h-12 min-h-12 px-3 text-sm md:h-10 md:min-h-0";

  if (loading) {
    return (
      <span
        className={cn("inline-block h-12 w-14 rounded-xl bg-muted/50 animate-pulse", className)}
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        data-testid="button-login-toolbar"
        onClick={goLogin}
        className={cnPrimaryBlue(className)}
      >
        {t.authLogin}
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 min-w-0 max-md:w-full md:w-auto md:shrink-0", className)}>
      <NotificationBell btnCls={btnCls} className="hidden md:inline-flex shrink-0" />
      <UserMenuDropdown variant={variant} className="min-w-0 max-md:flex-1 max-md:w-full md:flex-none md:w-auto" />
    </div>
  );
}
