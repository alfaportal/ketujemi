import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";
import type { FacebookProfile } from "./facebook-oauth";
import type { GoogleProfile } from "./google-oauth";
export type InstagramProfile = {
  id: string;
  username: string | null;
};
import type { TikTokProfile } from "./tiktok-oauth";

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

async function findUserByInstagramId(instagramUserId: string): Promise<User | undefined> {
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.instagram_user_id, instagramUserId))
    .limit(1);
  return row;
}

async function findUserByEmail(email: string): Promise<User | undefined> {
  const [row] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  return row;
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
    instagram_user_id?: string | null;
    instagram_username?: string | null;
    tiktok_user_id?: string | null;
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
  if (patch.instagram_user_id && !existing.instagram_user_id) {
    out.instagram_user_id = patch.instagram_user_id;
  }
  if (patch.instagram_username && !existing.instagram_username) {
    out.instagram_username = patch.instagram_username;
  }
  if (patch.tiktok_user_id && !existing.tiktok_user_id) {
    out.tiktok_user_id = patch.tiktok_user_id;
  }
  return out as Partial<User>;
}

export async function findOrCreateUserFromFacebook(profile: FacebookProfile): Promise<User> {
  const byFb = await findUserByFacebookId(profile.id);
  if (byFb) return byFb;

  if (profile.email) {
    const byEmail = await findUserByEmail(profile.email);
    if (byEmail) {
      const patch = mergeProfileFields(byEmail, {
        display_name: profile.name,
        profile_photo_url: profile.pictureUrl,
        facebook_user_id: profile.id,
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
      facebook_user_id: profile.id,
      email: profile.email,
      email_verified_at: profile.email ? new Date() : null,
      display_name: profile.name,
      profile_photo_url: profile.pictureUrl,
    })
    .returning();

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
  if (byTikTok) return byTikTok;

  const [created] = await db
    .insert(usersTable)
    .values({
      tiktok_user_id: profile.id,
      display_name: profile.name,
      profile_photo_url: profile.pictureUrl,
    })
    .returning();

  return created;
}

export async function findOrCreateUserFromInstagram(profile: InstagramProfile): Promise<User> {
  const byIg = await findUserByInstagramId(profile.id);
  if (byIg) return byIg;

  const displayName = profile.username ? `@${profile.username.replace(/^@/, "")}` : null;
  const partnerLink = profile.username
    ? `https://www.instagram.com/${profile.username.replace(/^@/, "")}/`
    : null;

  const [created] = await db
    .insert(usersTable)
    .values({
      instagram_user_id: profile.id,
      instagram_username: profile.username,
      display_name: displayName,
      partner_link_url: partnerLink,
      partner_link_type: profile.username ? "instagram" : null,
    })
    .returning();

  return created;
}
