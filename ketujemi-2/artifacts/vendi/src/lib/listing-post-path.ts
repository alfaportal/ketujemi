export function isListingPostPath(pathname: string): boolean {
  return pathname.startsWith("/listings/new");
}
