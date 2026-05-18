import Anthropic from "@anthropic-ai/sdk";
import { db, listingsTable, listingReportsTable, adminSettingsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const KEYS = {
  enabled: "ai_moderation_enabled",
  systemPrompt: "ai_moderation_system_prompt",
  lastCommand: "ai_moderation_last_command",
  lastReply: "ai_moderation_last_reply",
  lastRunAt: "ai_moderation_last_run_at",
} as const;

const DEFAULT_SYSTEM = `You are a private moderation assistant for a classifieds marketplace.
The operator is the sole platform owner. Follow their instructions precisely.
Never mention or invent an owner name, company name, or brand identity.
Respond in the same language as the owner's command (Albanian, Macedonian, or English).
When suggesting actions, be concrete (listing IDs, user IDs, short reasons).`;

async function getSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(adminSettingsTable)
    .where(eq(adminSettingsTable.key, key))
    .limit(1);
  return row?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(adminSettingsTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: adminSettingsTable.key, set: { value } });
}

export async function getModerationState(): Promise<Record<string, string>> {
  const enabled = (await getSetting(KEYS.enabled)) ?? "true";
  const systemPrompt = (await getSetting(KEYS.systemPrompt)) ?? DEFAULT_SYSTEM;
  const lastCommand = (await getSetting(KEYS.lastCommand)) ?? "";
  const lastReply = (await getSetting(KEYS.lastReply)) ?? "";
  const lastRunAt = (await getSetting(KEYS.lastRunAt)) ?? "";
  return { enabled, system_prompt: systemPrompt, last_command: lastCommand, last_reply: lastReply, last_run_at: lastRunAt };
}

export async function updateModerationSettings(patch: Record<string, string>): Promise<Record<string, string>> {
  if (patch.enabled != null) await setSetting(KEYS.enabled, patch.enabled);
  if (patch.system_prompt != null) await setSetting(KEYS.systemPrompt, patch.system_prompt);
  return getModerationState();
}

export async function runModerationCommand(command: string): Promise<{ reply: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const state = await getModerationState();
  if (state.enabled === "false") {
    throw new Error("AI moderation is disabled");
  }

  const trimmed = command.trim();
  if (trimmed.length < 2) {
    throw new Error("Command too short");
  }

  const recentListings = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      seller_name: listingsTable.seller_name,
      seller_phone: listingsTable.seller_phone,
      created_at: listingsTable.created_at,
    })
    .from(listingsTable)
    .orderBy(desc(listingsTable.created_at))
    .limit(25);

  const pendingReports = await db
    .select()
    .from(listingReportsTable)
    .where(eq(listingReportsTable.status, "pending"))
    .orderBy(desc(listingReportsTable.created_at))
    .limit(15);

  const context = JSON.stringify(
    {
      recent_listings: recentListings.map((l) => ({
        id: l.id,
        title: l.title,
        seller_name: l.seller_name,
        seller_phone: l.seller_phone.replace(/\d(?=\d{4})/g, "*"),
        created_at: l.created_at.toISOString(),
      })),
      pending_reports: pendingReports.map((r) => ({
        id: r.id,
        listing_id: r.listing_id,
        reason: r.reason,
        status: r.status,
      })),
    },
    null,
    0,
  );

  const client = new Anthropic({ apiKey });
  const system = state.system_prompt || DEFAULT_SYSTEM;

  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system,
    messages: [
      {
        role: "user",
        content: `Platform snapshot (phones partially masked):\n${context}\n\nOwner command:\n${trimmed}`,
      },
    ],
  });

  const reply =
    message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim() || "(no response)";

  await setSetting(KEYS.lastCommand, trimmed);
  await setSetting(KEYS.lastReply, reply);
  await setSetting(KEYS.lastRunAt, new Date().toISOString());

  return { reply };
}
