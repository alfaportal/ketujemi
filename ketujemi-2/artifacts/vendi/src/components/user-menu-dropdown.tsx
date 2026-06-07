import { useLocation } from "wouter";
import { ChevronDown, LogOut, User, FileText } from "lucide-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useAuth } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cnPrimaryBlue } from "@/lib/primary-button-classes";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "default" | "compact";
  className?: string;
};

export function UserMenuDropdown({ variant = "default", className }: Props) {
  const [, setLocation] = useLocation();
  const { user, loading, refresh } = useAuth();
  const { t } = useMarket();

  const btnCls =
    variant === "compact"
      ? "h-12 min-h-12 px-2.5 text-sm md:h-8 md:min-h-0 md:text-xs"
      : "h-12 min-h-12 px-3 text-sm md:h-10 md:min-h-0";

  if (loading) {
    return (
      <span
        className={cn("inline-block h-12 w-14 rounded-xl bg-muted/50 animate-pulse", className)}
        aria-hidden
      />
    );
  }

  if (!user) return null;

  const label =
    user.display_name?.trim() ||
    user.email ||
    (user.phone_e164_digits ? `+${user.phone_e164_digits}` : null) ||
    t.nav_myProfile;

  async function logout() {
    await fetchWithTimeout("/api/auth/logout", { method: "POST", credentials: "include" });
    await refresh();
    setLocation("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="default"
          className={cn(cnPrimaryBlue(btnCls), "gap-1 font-bold shrink-0 max-w-full", className)}
          data-testid="button-user-menu"
        >
          <User className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          <span className="truncate max-w-[7rem] sm:max-w-[9rem]">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => setLocation("/profili")} className="gap-2 cursor-pointer">
          <User className="h-4 w-4" />
          {t.nav_myProfile}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocation("/shpalljet-e-mia")}
          className="gap-2 cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          {t.nav_myListings}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void logout();
          }}
          className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
          data-testid="button-logout-toolbar"
        >
          <LogOut className="h-4 w-4" />
          {t.authLogout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
