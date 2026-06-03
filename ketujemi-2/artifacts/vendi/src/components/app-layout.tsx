import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { CardPaymentsPanel, listingIdFromPath } from "@/components/card-payments-panel";
import { useFreshPageOnRoute } from "@/hooks/use-fresh-page-on-route";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useAuth } from "@/lib/auth-context";
import { isInfoStaticPage } from "@/lib/static-page-paths";
import { SecretAdminTapProvider } from "@/lib/secret-admin-tap";

const SupportChatWidget = lazy(() =>
  import("@/components/support-chat-widget").then((m) => ({
    default: m.SupportChatWidget,
  })),
);

type AppLayoutProps = {
  children: React.ReactNode;
};

/** Wraps main app routes; footer legal links on every page except admin. */
export function AppLayout({ children }: AppLayoutProps) {
  useScrollRestoration();
  useFreshPageOnRoute();
  const [pathname] = useLocation();
  const { user, loading } = useAuth();
  const hideFooter =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/admin-secret-panel");
  const isListingDetailPage = /^\/listings\/\d+$/.test(pathname);

  const hidePaymentsStrip =
    hideFooter ||
    isInfoStaticPage(pathname) ||
    pathname === "/login" ||
    pathname.startsWith("/listings/new") ||
    isListingDetailPage ||
    loading ||
    !user;

  const listingId = listingIdFromPath(pathname);

  return (
    <SecretAdminTapProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1">{children}</div>
        {!hidePaymentsStrip ? (
          <CardPaymentsPanel listingId={listingId} compact className="sticky bottom-0 z-20" />
        ) : null}
        {!hideFooter ? <SiteFooter /> : null}
        {!hideFooter ? (
          <Suspense fallback={null}>
            <SupportChatWidget />
          </Suspense>
        ) : null}
      </div>
    </SecretAdminTapProvider>
  );
}
