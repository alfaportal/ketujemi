import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import {
  engagementCopyForUiLang,
  welcomeDisplayName,
} from "@/lib/engagement-i18n";
import { fireEngagementConfetti } from "@/lib/engagement-confetti";
import { registerFcmTokenIfConfigured } from "@/lib/fcm-register";
import { isListingFlowPath } from "@/lib/listing-post-path";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const FIRST_LISTING_KEY = "kj_engagement_first_listing";

/** Global welcome toast, first-listing confetti modal, FCM registration. */
export function EngagementEffects() {
  const { user, refresh } = useAuth();
  const { uiLang } = useMarket();
  const { toast } = useToast();
  const [loc] = useLocation();
  const copy = engagementCopyForUiLang(uiLang);
  const [firstListingOpen, setFirstListingOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (isListingFlowPath(loc)) return;
    void registerFcmTokenIfConfigured();
  }, [user?.id, loc]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isListingFlowPath(window.location.pathname)) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") !== "1") return;
    void refresh().finally(() => {
      params.delete("verified");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", next);
    });
  }, [refresh]);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    if (isListingFlowPath(window.location.pathname)) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") {
      const name = welcomeDisplayName(user);
      toast({ title: copy.welcomeToast(name), duration: 8000 });
      params.delete("welcome");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", next);
    }
  }, [user, loc, copy, toast]);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(FIRST_LISTING_KEY) === "1") {
      sessionStorage.removeItem(FIRST_LISTING_KEY);
      fireEngagementConfetti();
      setFirstListingOpen(true);
    }
  }, [loc]);

  return (
    <Dialog open={firstListingOpen} onOpenChange={setFirstListingOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.firstListingTitle}</DialogTitle>
          <DialogDescription className="text-base text-foreground pt-1">
            {copy.firstListingBody}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={() => setFirstListingOpen(false)}>
            {copy.firstListingOk}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function queueFirstListingCelebration(): void {
  try {
    sessionStorage.setItem(FIRST_LISTING_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function showWelcomeToast(
  toast: (opts: { title: string; duration?: number }) => void,
  user: Parameters<typeof welcomeDisplayName>[0],
  uiLang: Parameters<typeof engagementCopyForUiLang>[0],
): void {
  const copy = engagementCopyForUiLang(uiLang);
  toast({ title: copy.welcomeToast(welcomeDisplayName(user)), duration: 8000 });
}
