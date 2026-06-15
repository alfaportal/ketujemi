import { db, listingsTable, moderationLogTable, type User } from "@workspace/db";
import { and, desc, eq, gte } from "drizzle-orm";
import { hasDisallowedPhoneInUserText } from "../../../../lib/listing-phone-in-text.js";
import {
  findSelfDuplicateActiveListingId,
  SELF_DUPLICATE_SCREEN_MESSAGE,
} from "./listing-self-duplicate";
import { listingBelongsToUser } from "./listing-ownership";
import { listingTextSimilarity, SELF_DUPLICATE_SCAN_THRESHOLD } from "./listing-text-similarity";
import { logListingModerationRejection } from "./listing-moderation-rejection-log";

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const TEXT_SIMILARITY_THRESHOLD = SELF_DUPLICATE_SCAN_THRESHOLD;
const PHASH_DISTANCE_THRESHOLD = 6;
const BLOCKED_WORDS = [
  "mashtrim",
  "droge",
  "drogë",
  "kokain",
  "heroin",
  "armë",
  "arme",
  "falsifikim",
  "spam",
  "seks",
  "fyerje",
];

type ModerationInput = {
  userId: number;
  user: User;
  title: string;
  description: string;
  sellerPhone: string;
  categoryId: number;
  imageUrl?: string | null;
};

type ModerationResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "DUPLICATE_LISTING"
        | "DUPLICATE_LISTING_SELF"
        | "BLACKLIST_WORD"
        | "PHONE_IN_DESCRIPTION"
        | "EXTERNAL_LINK_IN_DESCRIPTION";
      reason: string;
      message: string;
    };

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}

function imageUrlsFromCsv(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function pseudoPHash(url: string): bigint {
  let hash = BigInt("0xcbf29ce484222325");
  const prime = BigInt("0x100000001b3");
  for (const ch of url) {
    hash ^= BigInt(ch.charCodeAt(0));
    hash *= prime;
    hash &= BigInt("0xffffffffffffffff");
  }
  return hash;
}

function hammingDistance64(a: bigint, b: bigint): number {
  let x = a ^ b;
  let count = 0;
  while (x !== BigInt(0)) {
    x &= x - BigInt(1);
    count++;
  }
  return count;
}

async function logModerationDecision(reason: string, action: string, listingId?: number): Promise<void> {
  await db.insert(moderationLogTable).values({
    listing_id: listingId ?? null,
    reason,
    action,
  });
}

function findBlockedWord(text: string): string | null {
  const normalized = normalizeText(text);
  for (const word of BLOCKED_WORDS) {
    if (normalized.includes(normalizeText(word))) return word;
  }
  return null;
}

function hasPhoneInDescription(description: string): boolean {
  return hasDisallowedPhoneInUserText(description);
}

function hasExternalLink(description: string): boolean {
  return /(https?:\/\/|www\.)\S+/i.test(description);
}

function logUserRejection(input: ModerationInput, reason: string): void {
  void logListingModerationRejection({
    title: input.title,
    reason,
    categoryId: input.categoryId,
    userId: input.userId,
  }).catch(() => undefined);
}

export async function runTwoLayerModeration(input: ModerationInput): Promise<ModerationResult> {
  const title = input.title.trim();
  const description = input.description.trim();

  const blockedWord = findBlockedWord(`${title} ${description}`);
  if (blockedWord) {
    const reason = `BLACKLIST_WORD:${blockedWord}`;
    await logModerationDecision(reason, "blocked");
    logUserRejection(input, reason);
    return {
      ok: false,
      code: "BLACKLIST_WORD",
      reason,
      message: `Përmbajtja përmban fjalë të ndaluara: "${blockedWord}".`,
    };
  }

  if (hasPhoneInDescription(description)) {
    const reason = "PHONE_IN_DESCRIPTION";
    await logModerationDecision(reason, "blocked");
    logUserRejection(input, reason);
    return {
      ok: false,
      code: "PHONE_IN_DESCRIPTION",
      reason,
      message: "Numri i telefonit nuk lejohet në përshkrim. Vendoseni vetëm në fushën e telefonit.",
    };
  }

  if (hasExternalLink(description)) {
    const reason = "EXTERNAL_LINK_IN_DESCRIPTION";
    await logModerationDecision(reason, "blocked");
    logUserRejection(input, reason);
    return {
      ok: false,
      code: "EXTERNAL_LINK_IN_DESCRIPTION",
      reason,
      message: "Linqet e jashtme nuk lejohen në përshkrim.",
    };
  }

  const selfDupId = await findSelfDuplicateActiveListingId(
    input.userId,
    input.user,
    title,
    description,
    { categoryId: input.categoryId, imageUrl: input.imageUrl },
  );
  if (selfDupId != null) {
    const reason = `SELF_DUPLICATE_ACTIVE:${selfDupId}`;
    await logModerationDecision(reason, "blocked", selfDupId);
    logUserRejection(input, reason);
    return {
      ok: false,
      code: "DUPLICATE_LISTING_SELF",
      reason,
      message: SELF_DUPLICATE_SCREEN_MESSAGE,
    };
  }

  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  const recentByPhoneAndCategory = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      seller_phone: listingsTable.seller_phone,
      user_id: listingsTable.user_id,
      category_id: listingsTable.category_id,
      image_url: listingsTable.image_url,
      created_at: listingsTable.created_at,
    })
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.category_id, input.categoryId),
        gte(listingsTable.created_at, since),
      ),
    )
    .orderBy(desc(listingsTable.created_at))
    .limit(400);

  const duplicateCandidates = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      seller_phone: listingsTable.seller_phone,
      user_id: listingsTable.user_id,
      image_url: listingsTable.image_url,
      created_at: listingsTable.created_at,
    })
    .from(listingsTable)
    .orderBy(desc(listingsTable.created_at))
    .limit(1200);

  const incomingImageHashes = imageUrlsFromCsv(input.imageUrl).map((u) => pseudoPHash(u));
  const incomingPhoneDigits = digitsOnly(input.sellerPhone);

  for (const row of duplicateCandidates) {
    if (
      listingBelongsToUser(input.userId, input.user, {
        user_id: row.user_id,
        seller_phone: row.seller_phone,
        description: row.description,
      })
    ) {
      continue;
    }

    const similarity = listingTextSimilarity(
      title,
      description,
      row.title,
      row.description,
    );
    if (similarity >= TEXT_SIMILARITY_THRESHOLD) {
      const reason = `DUPLICATE_TEXT_SIMILARITY:${similarity.toFixed(2)}`;
      await logModerationDecision(reason, "blocked", row.id);
      logUserRejection(input, reason);
      return {
        ok: false,
        code: "DUPLICATE_LISTING",
        reason,
        message: "Ky shpallje ekziston tashmë. Nuk mund të postosh të njëjtën gjë dy herë.",
      };
    }

    const rowHashes = imageUrlsFromCsv(row.image_url).map((u) => pseudoPHash(u));
    if (incomingImageHashes.length && rowHashes.length) {
      let matched = false;
      for (const inHash of incomingImageHashes) {
        for (const rowHash of rowHashes) {
          if (hammingDistance64(inHash, rowHash) <= PHASH_DISTANCE_THRESHOLD) {
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
      if (matched) {
        const reason = "DUPLICATE_IMAGE_PHASH";
        await logModerationDecision(reason, "blocked", row.id);
        logUserRejection(input, reason);
        return {
          ok: false,
          code: "DUPLICATE_LISTING",
          reason,
          message: "Ky shpallje ekziston tashmë. Nuk mund të postosh të njëjtën gjë dy herë.",
        };
      }
    }
  }

  for (const row of recentByPhoneAndCategory) {
    if (
      listingBelongsToUser(input.userId, input.user, {
        user_id: row.user_id,
        seller_phone: row.seller_phone,
        description: row.description,
      })
    ) {
      continue;
    }
    const rowPhone = digitsOnly(row.seller_phone ?? "");
    if (
      incomingPhoneDigits.length >= 8 &&
      rowPhone.length >= 8 &&
      (incomingPhoneDigits.endsWith(rowPhone.slice(-8)) || rowPhone.endsWith(incomingPhoneDigits.slice(-8)))
    ) {
      const reason = "DUPLICATE_PHONE_CATEGORY_24H";
      await logModerationDecision(reason, "blocked", row.id);
      logUserRejection(input, reason);
      return {
        ok: false,
        code: "DUPLICATE_LISTING",
        reason,
        message: "Ky shpallje ekziston tashmë. Nuk mund të postosh të njëjtën gjë dy herë.",
      };
    }
  }

  await logModerationDecision("PASSED", "allowed");
  return { ok: true };
}
