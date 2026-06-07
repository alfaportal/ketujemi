/** Pushes sticky mobile chrome below iOS status bar / notch (<768px). */
export function MobileSafeTopSpacer() {
  return <div className="mobile-safe-top md:hidden" aria-hidden="true" />;
}
