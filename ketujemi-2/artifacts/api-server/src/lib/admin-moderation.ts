import { claudeTextCompletion } from "./claude-client";
import { gatherAdminOperatorContext } from "./admin-operator-context";
import { db, adminSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const KEYS = {
  enabled: "ai_moderation_enabled",
  systemPrompt: "ai_moderation_system_prompt",
  lastCommand: "ai_moderation_last_command",
  lastReply: "ai_moderation_last_reply",
  lastRunAt: "ai_moderation_last_run_at",
} as const;

const DEFAULT_SYSTEM = `You are a private moderation assistant for KetuJemi.com (classifieds marketplace).
The operator is the sole platform owner. Follow their instructions precisely.
Never mention or invent an owner name, company name, or brand identity.
Respond in the same language as the owner's command (Albanian, Macedonian, or English).
When suggesting actions, be concrete (listing IDs, user IDs, short reasons).
Use the platform context JSON to answer — do not invent data not present in the snapshot.`;

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

  const context = await gatherAdminOperatorContext();
  const system = state.system_prompt || DEFAULT_SYSTEM;

  const reply = await claudeTextCompletion({
    system,
    user: `Platform context (JSON):\n${JSON.stringify(context, null, 2)}\n\nOwner command:\n${trimmed}`,
    maxTokens: 2048,
  });

  const text = reply.trim() || "(no response)";

  await setSetting(KEYS.lastCommand, trimmed);
  await setSetting(KEYS.lastReply, text);
  await setSetting(KEYS.lastRunAt, new Date().toISOString());

  return { reply: text };
}
