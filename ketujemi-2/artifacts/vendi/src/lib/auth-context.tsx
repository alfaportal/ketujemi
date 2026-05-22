import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type AuthUser = {
  id: number;
  email: string | null;
  phone_e164_digits: string | null;
  display_name: string | null;
  contact_phone: string | null;
  profile_photo_url: string | null;
  partner_logo_url?: string | null;
  city: string | null;
  about_me: string | null;
  account_type?: string | null;
  business_name?: string | null;
  business_tier?: string | null;
  business_status?: string | null;
  partner_link_url?: string | null;
  partner_link_type?: string | null;
  partner_banner_urls?: string | null;
  vip_expires_at?: string | null;
  email_verified?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<unknown>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<AuthUser | null> {
  const r = await fetch("/api/auth/me", { credentials: "include" });
  if (r.status === 401) return null;
  if (!r.ok) throw new Error("auth_me_failed");
  const j = (await r.json()) as { user?: AuthUser };
  return j.user ?? null;
}

export function userNeedsSellerProfile(user: AuthUser | null): boolean {
  if (!user) return false;
  const name = user.display_name?.trim() ?? "";
  const phone = user.contact_phone?.trim() ?? user.phone_e164_digits?.trim() ?? "";
  return name.length < 2 || phone.length < 8;
}

export function sellerContactFromUser(user: AuthUser): {
  seller_name: string;
  seller_phone: string;
} {
  const seller_name = user.display_name?.trim() ?? "";
  const digits = user.contact_phone?.trim() || user.phone_e164_digits?.trim() || "";
  const seller_phone = digits.startsWith("+") ? digits : digits ? `+${digits}` : "";
  return { seller_name, seller_phone };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    staleTime: 30_000,
    retry: 1,
  });

  const refresh = useCallback(
    () =>
      queryClient.refetchQueries({
        queryKey: ["auth", "me"],
      }),
    [queryClient],
  );

  return (
    <AuthContext.Provider
      value={{
        user: query.data ?? null,
        loading: query.isPending,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const v = useContext(AuthContext);
  if (!v) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return v;
}

/** Only allow relative in-app paths (open-redirect safe). */
export function safeAuthReturnUrl(raw: string | null | undefined): string {
  const d = raw?.trim() ?? "";
  if (!d.startsWith("/") || d.startsWith("//")) return "/listings/new";
  return d;
}

export function loginUrlWithReturn(returnTo: string): string {
  return `/login?return=${encodeURIComponent(safeAuthReturnUrl(returnTo))}`;
}
