export function sellerDisplayName(
  shopName: string | null | undefined,
  sellerName: string | null | undefined,
): string;

export function resolveCategoryTheme(input: Record<string, unknown>): string;

export function resolveListingTheme(ctx: Record<string, unknown>): string;

export function listingFlairLine(
  platform: string,
  market: string,
  listingCtx: Record<string, unknown>,
): string;

export function categoryFlairLine(
  platform: string,
  market: string,
  categoryInput: Record<string, unknown>,
): string;

export function platformUspLine(market: string): string;

export function socialFooterBlock(platform: string, market: string): string;
