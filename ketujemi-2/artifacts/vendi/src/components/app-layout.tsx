import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { CardPaymentsPanel, listingIdFromPath } from "@/components/card-payments-panel";
import { useFreshPageOnRoute } from "@/hooks/use-fresh-page-on-route";
import { useAuth } from "@/lib/auth-context";
import { isInfoStaticPage } from "@/lib/static-page-paths";

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
  useFreshPageOnRoute();
  const [pathname] = useLocation();
  const { user, loading } = useAuth();
  const hideFooter = pathname.startsWith("/admin-secret-panel");
  const hidePaymentsStrip =
    hideFooter ||
    isInfoStaticPage(pathname) ||
    pathname === "/login" ||
    pathname.startsWith("/listings/new") ||
    loading ||
    !user;

  const listingId = listingIdFromPath(pathname);

  return (
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
  );
}
