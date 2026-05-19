import { useLocation } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { SupportChatWidget } from "@/components/support-chat-widget";

type AppLayoutProps = {
  children: React.ReactNode;
};

/** Wraps main app routes; footer legal links on every page except admin. */
export function AppLayout({ children }: AppLayoutProps) {
  const [pathname] = useLocation();
  const hideFooter = pathname.startsWith("/admin-secret-panel");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">{children}</div>
      {!hideFooter ? <SiteFooter /> : null}
      {!hideFooter ? <SupportChatWidget /> : null}
    </div>
  );
}
