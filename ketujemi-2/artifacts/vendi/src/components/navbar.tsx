import { useState } from "react";
import { useLocation } from "wouter";
import { Home, List, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMarket } from "@/lib/market-context";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const goToPostListing = useGoToPostListing();
  const [open, setOpen] = useState(false);
  const { t } = useMarket();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 min-h-14 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={t.nav_menuAria}
                className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background text-foreground md:hidden touch-manipulation"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw-1.5rem,20rem)] sm:max-w-sm">
              <SheetHeader className="text-left">
                <SheetTitle>{t.nav_menuTitle}</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-2">
                <SheetClose asChild>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-base font-medium hover:bg-secondary min-h-12 touch-manipulation"
                    onClick={() => {
                      setLocation("/");
                      setOpen(false);
                    }}
                  >
                    <Home className="h-4 w-4" />
                    {t.nav_home}
                  </button>
                </SheetClose>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-base font-medium hover:bg-secondary min-h-12 touch-manipulation"
                    onClick={() => {
                      setLocation("/listings");
                      setOpen(false);
                    }}
                  >
                    <List className="h-4 w-4" />
                    {t.title}
                  </button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
          <button
            data-testid="link-logo"
            onClick={() => setLocation("/")}
            className="text-left text-xl font-bold text-primary tracking-tight min-w-0 touch-manipulation"
          >
            Vendi<span className="text-accent">.com</span>
          </button>
        </div>

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
          className="shrink-0 text-xs h-9 px-3"
          data-testid="button-post-listing"
        >
          {t.postFree}
        </Button>
      </div>
    </header>
  );
}
