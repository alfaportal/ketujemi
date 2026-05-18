import { useLocation } from "wouter";
import { Home, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import { SiteLogo } from "@/components/site-logo";
import { useMarket } from "@/lib/market-context";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const goToPostListing = useGoToPostListing();
  const { t } = useMarket();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 min-h-14 py-2 flex flex-wrap items-center justify-between gap-3">
        <SiteLogo />

        <nav className="hidden md:flex items-center gap-1">
          <button
            data-testid="link-home"
            onClick={() => setLocation("/")}
            className={`flex min-h-12 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors touch-manipulation ${
              location === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Home className="h-4 w-4" />
            {t.nav_home}
          </button>
          <button
            data-testid="link-listings"
            onClick={() => setLocation("/listings")}
            className={`flex min-h-12 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors touch-manipulation ${
              location.startsWith("/listings") && !location.includes("/new")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <List className="h-4 w-4" />
            {t.title}
          </button>
        </nav>

        <Button
          onClick={goToPostListing}
          className="shrink-0 text-sm font-bold h-11 px-4 sm:text-base sm:h-12 sm:px-5"
          data-testid="button-post-listing"
        >
          {t.postFree}
        </Button>
      </div>
    </header>
  );
}
