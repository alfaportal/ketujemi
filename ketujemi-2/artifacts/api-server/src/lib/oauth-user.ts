import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";
import type { FacebookProfile } from "./facebook-oauth";
import type { GoogleProfile } from "./google-oauth";
import type { TikTokProfile } from "./tiktok-oauth";
import { recordUserSocialConnection } from "./user-social-connections.js";

function oauthUsername(raw: string | null | undefined, fallbackId: string): string {
  const s = String(raw ?? "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9._-]/g, "");
  return s || `user_${fallbackId}`;
}

async function findUserByFacebookId(facebookUserId: string): Promise<User | undefined> {
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.facebook_user_id, facebookUserId))
    .limit(1);
  return row;
}

async function findUserByGoogleId(googleUserId: string): Promise<User | undefined> {
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.google_user_id, googleUserId))
    .limit(1);
  return row;
}

async function findUserByTikTokId(tiktokUserId: string): Promise<User | undefined> {
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.tiktok_user_id, tiktokUserId))
    .limit(1);
  return row;
}

async function findUserByEmail(email: string): Promise<User | undefined> {
  const [row] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  return row;
}

function facebookProfilePatch(existing: User | null, profile: FacebookProfile): Partial<User> {
  const patch: Partial<User> = {
    identity_verified: true,
    identity_verified_via: "facebook",
  };
  if (profile.name?.trim()) {
    patch.display_name = profile.name.trim().slice(0, 120);
  }
  if (profile.pictureUrl?.trim()) {
    patch.profile_photo_url = profile.pictureUrl.trim().slice(0, 2048);
  }
  if (profile.email?.trim()) {
    const email = profile.email.trim().toLowerCase();
    if (!existing?.email?.trim() || !existing.email_verified_at) {
      patch.email = email;
      patch.email_verified_at = new Date();
    }
  }
  return patch;
}

function mergeProfileFields(
  existing: User,
  patch: {
    display_name?: string | null;
    profile_photo_url?: string | null;
    email?: string | null;
    email_verified_at?: Date | null;
    facebook_user_id?: string | null;
    google_user_id?: string | null;
    tiktok_user_id?: string | null;
    identity_verified?: boolean;
    identity_verified_via?: string | null;
  },
): Partial<User> {
  const out: Record<string, unknown> = {};
  if (!existing.display_name?.trim() && patch.display_name) out.display_name = patch.display_name;
  if (!existing.profile_photo_url?.trim() && patch.profile_photo_url) {
    out.profile_photo_url = patch.profile_photo_url;
  }
  if (!existing.email && patch.email) {
    out.email = patch.email;
    out.email_verified_at = patch.email_verified_at ?? new Date();
  }
  if (patch.facebook_user_id && !existing.facebook_user_id) {
    out.facebook_user_id = patch.facebook_user_id;
  }
  if (patch.google_user_id && !existing.google_user_id) {
    out.google_user_id = patch.google_user_id;
  }
  if (patch.tiktok_user_id && !existing.tiktok_user_id) {
    out.tiktok_user_id = patch.tiktok_user_id;
  }
  if (patch.identity_verified) {
    out.identity_verified = true;
    out.identity_verified_via = patch.identity_verified_via ?? existing.identity_verified_via;
  }
  return out as Partial<User>;
}

async function applyFacebookProfileToUser(user: User, profile: FacebookProfile): Promise<User> {
  const patch = facebookProfilePatch(user, profile);
  if (Object.keys(patch).length === 0) return user;
  const [updated] = await db
    .update(usersTable)
    .set(patch)
    .where(eq(usersTable.id, user.id))
    .returning();
  return updated ?? user;
}

export async function findOrCreateUserFromFacebook(profile: FacebookProfile): Promise<User> {
  const byFb = await findUserByFacebookId(profile.id);
  if (byFb) {
    const user = await applyFacebookProfileToUser(byFb, profile);
    await recordUserSocialConnection({
      userId: user.id,
      platform: "facebook",
      externalUserId: profile.id,
      username: oauthUsername(profile.name, profile.id),
    });
    return user;
  }

  if (profile.email) {
    const byEmail = await findUserByEmail(profile.email);
    if (byEmail) {
      const mergePatch = mergeProfileFields(byEmail, {
        display_name: profile.name,
        profile_photo_url: profile.pictureUrl,
        facebook_user_id: profile.id,
        identity_verified: true,
        identity_verified_via: "facebook",
      });
      const fullPatch = { ...facebookProfilePatch(byEmail, profile), ...mergePatch };
      if (Object.keys(fullPatch).length > 0) {
        const [updated] = await db
          .update(usersTable)
          .set(fullPatch)
          .where(eq(usersTable.id, byEmail.id))
          .returning();
        const user = updated ?? byEmail;
        await recordUserSocialConnection({
          userId: user.id,
          platform: "facebook",
          externalUserId: profile.id,
          username: oauthUsername(profile.name, profile.id),
        });
        return user;
      }
      await recordUserSocialConnection({
        userId: byEmail.id,
        platform: "facebook",
        externalUserId: profile.id,
        username: oauthUsername(profile.name, profile.id),
      });
      return byEmail;
    }
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      facebook_user_id: profile.id,
      email: profile.email,
      email_verified_at: profile.email ? new Date() : null,
      display_name: profile.name,
      profile_photo_url: profile.pictureUrl,
      identity_verified: true,
      identity_verified_via: "facebook",
    })
    .returning();

  await recordUserSocialConnection({
    userId: created.id,
    platform: "facebook",
    externalUserId: profile.id,
    username: oauthUsername(profile.name, profile.id),
  });

  return created;
}

export async function findOrCreateUserFromGoogle(profile: GoogleProfile): Promise<User> {
  const byGoogle = await findUserByGoogleId(profile.id);
  if (byGoogle) return byGoogle;

  if (profile.email) {
    const byEmail = await findUserByEmail(profile.email);
    if (byEmail) {
      const patch = mergeProfileFields(byEmail, {
        display_name: profile.name,
        profile_photo_url: profile.pictureUrl,
        google_user_id: profile.id,
      });
      if (Object.keys(patch).length > 0) {
        const [updated] = await db
          .update(usersTable)
          .set(patch)
          .where(eq(usersTable.id, byEmail.id))
          .returning();
        return updated ?? byEmail;
      }
      return byEmail;
    }
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      google_user_id: profile.id,
      email: profile.email,
      email_verified_at: profile.email ? new Date() : null,
      display_name: profile.name,
      profile_photo_url: profile.pictureUrl,
    })
    .returning();

  return created;
}

export async function findOrCreateUserFromTikTok(profile: TikTokProfile): Promise<User> {
  const byTikTok = await findUserByTikTokId(profile.id);
  if (byTikTok) {
    await recordUserSocialConnection({
      userId: byTikTok.id,
      platform: "tiktok",
      externalUserId: profile.id,
      username: oauthUsername(profile.name, profile.id),
    });
    return byTikTok;
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      tiktok_user_id: profile.id,
      display_name: profile.name,
      profile_photo_url: profile.pictureUrl,
    })
    .returning();

  await recordUserSocialConnection({
    userId: created.id,
    platform: "tiktok",
    externalUserId: profile.id,
    username: oauthUsername(profile.name, profile.id),
  });

  return created;
}
