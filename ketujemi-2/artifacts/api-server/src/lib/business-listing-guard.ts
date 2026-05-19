import type { User } from "@workspace/db";
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

  const validation = validateBusinessListing(input);
  if (!validation.ok) {
    const err = new Error(validation.code) as Error & { publicMessage: string };
    err.publicMessage = validation.message;
    throw err;
  }

  await assertBusinessPostingAllowed(user);
}
