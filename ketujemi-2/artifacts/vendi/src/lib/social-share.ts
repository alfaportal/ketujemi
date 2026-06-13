/** Meta app id — same as OG tags / Facebook Login. */
export const FACEBOOK_SHARE_APP_ID = "2196983604470561";

export function listingPublicUrl(listingId: number): string {
  return `https://ketujemi.com/listings/${listingId}`;
}

/** Facebook Share Dialog — opens «Create post» with link preview (page/timeline). */
export function facebookShareDialogUrl(listingUrl: string, quote?: string): string {
  const params = new URLSearchParams({
    app_id: FACEBOOK_SHARE_APP_ID,
    href: listingUrl,
    display: "page",
    redirect_uri: listingUrl,
  });
  const q = quote?.trim();
  if (q) params.set("quote", q);
  params.set("hashtag", "#KetuJemi");
  return `https://www.facebook.com/dialog/share?${params.toString()}`;
}

/** Opens FB share in a new tab — user gesture required (no auto-popup). */
export function openFacebookShareDialog(listingUrl: string, quote?: string): void {
  const shareUrl = facebookShareDialogUrl(listingUrl, quote);
  const opened = window.open(shareUrl, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.assign(shareUrl);
  }
}

export function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
