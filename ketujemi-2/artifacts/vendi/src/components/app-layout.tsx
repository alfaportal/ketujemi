import { useLocation } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { SupportChatWidget } from "@/components/support-chat-widget";
import { CardPaymentsPanel, listingIdFromPath } from "@/components/card-payments-panel";
import { useAuth } from "@/lib/auth-context";
import { isInfoStaticPage } from "@/lib/static-page-paths";

type AppLayoutProps = {
  children: React.ReactNode;
};

/** Wraps main app routes; footer legal links on every page except admin. */
export function AppLayout({ children }: AppLayoutProps) {
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
      {!hideFooter ? <SupportChatWidget /> : null}
    </div>
  );
}
