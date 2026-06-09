/** Ambient types for the legacy JS Meta Graph module. */

export type SocialListing = Record<string, unknown> & {
  id: number;
  title: string;
  price?: number | string | null;
  location?: string | null;
  image_url?: string | null;
  listing_country?: string | null;
};

export type FacebookPostResult = {
  postId: string | null;
  graphError?: string;
  graphStatus?: number;
  graphResponse?: unknown;
};

export function resolveListingMarketForSocial(
  location: string | null | undefined,
  listingCountry: string | null | undefined,
): string;

export function listingSlug(id: number, title: string): string;

export function buildFacebookCaption(
  market: string,
  input: Record<string, unknown>,
): string;

export function buildInstagramCaption(
  market: string,
  input: Record<string, unknown>,
): string;

export function formatFacebookGraphApiError(
  json: unknown,
  status: number,
): string;

export function isInstagramAutoPostConfigured(): boolean;
export function isInstagramManualPostConfigured(): boolean;

export function refreshFacebookPageAccessTokenBeforePost(
  context?: string,
): Promise<void>;

export function initializeFacebookPageAccessToken(): Promise<void>;

export function facebookPostSkipReason(
  listing: SocialListing,
  manual?: boolean,
): string | null;

export function canPostListingToFacebook(listing: SocialListing): boolean;

export function isFacebookAutoPostConfigured(): boolean;
export function isFacebookManualPostConfigured(): boolean;

export function logFacebookAutoPostReadiness(): void;

export function postNewListingToFacebook(
  listing: SocialListing,
  options?: { manual?: boolean },
): Promise<FacebookPostResult>;

export function postNewListingToInstagram(
  listing: SocialListing,
  options?: { manual?: boolean },
): Promise<string | null>;

export function postReelToInstagram(input: {
  videoUrl: string;
  caption: string;
  reelId?: number;
}): Promise<string | null>;
