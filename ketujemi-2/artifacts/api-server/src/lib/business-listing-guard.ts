import type { User } from "@workspace/db";
import { isBusinessPartnerActive, isBusinessPartnerPending } from "./business-partner";
import { isBusinessAccount, validateBusinessListing } from "./business-rules";
import { assertBusinessPostingAllowed } from "./business-quota";

export async function assertBusinessListingCreate(
  user: User,
  input: {
    title: string;
    description: string;
    price: number;
    image_url?: string | null;
  },
): Promise<void> {
  if (!isBusinessAccount(user)) return;

  if (isBusinessPartnerPending(user)) {
    const err = new Error("BUSINESS_PENDING_ACTIVATION") as Error & { publicMessage: string };
    err.publicMessage =
      "Llogaria e biznesit pret aktivizimin nga administratori. Nuk mund të postoni ende.";
    throw err;
  }
  if (!isBusinessPartnerActive(user)) {
    const err = new Error("BUSINESS_NOT_ACTIVE") as Error & { publicMessage: string };
    err.publicMessage = "Llogaria e biznesit nuk është aktive. Kontaktoni administratorin.";
    throw err;
  }

  const validation = validateBusinessListing(input);
  if (!validation.ok) {
    const err = new Error(validation.code) as Error & { publicMessage: string };
    err.publicMessage = validation.message;
    throw err;
  }

  await assertBusinessPostingAllowed(user);
}
