/** User-visible reasons when a new listing cannot be posted (client + API). */

export type { ListingPostApiBody } from "@/lib/listing-post-feedback-i18n";
export { fieldLabel, resolveListingPostApiError } from "@/lib/listing-post-feedback-i18n";

/** Collect react-hook-form / Zod field messages for toast + banner. */
export function collectFormValidationMessages(
  errors: Record<string, unknown>,
): string[] {
  const out: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const rec = node as Record<string, unknown>;
    if (typeof rec.message === "string" && rec.message.trim()) {
      out.push(rec.message.trim());
      return;
    }
    for (const val of Object.values(rec)) walk(val);
  };
  walk(errors);
  return [...new Set(out)];
}

export function formatFormValidationSummary(messages: string[], fallback: string): string {
  if (!messages.length) return fallback;
  if (messages.length === 1) return messages[0]!;
  return messages.slice(0, 4).join(" · ");
}
