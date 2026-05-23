import Anthropic from "@anthropic-ai/sdk";

export type UiLang = "sq" | "mk" | "me";

export function parseUiLang(raw: unknown): UiLang {
  if (raw === "mk" || raw === "me") return raw;
  return "sq";
}

export function getAnthropicApiKey(): string | undefined {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return key || undefined;
}

export function isClaudeConfigured(): boolean {
  return !!getAnthropicApiKey();
}

export function getClaudeModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5";
}

export function getAnthropicClient(): Anthropic {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  return new Anthropic({ apiKey });
}

export function langLabel(lang: UiLang): string {
  if (lang === "mk") return "Macedonian";
  if (lang === "me") return "Montenegrin";
  return "Albanian";
}

/** Extract first JSON object from model text. */
export function parseJsonObject<T>(text: string): T | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function claudeJsonCompletion<T>(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T | null> {
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: getClaudeModel(),
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return parseJsonObject<T>(text);
}

/** Plain-text Claude reply (admin reports, chat). */
export async function claudeTextCompletion(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: getClaudeModel(),
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });

  return (
    message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim() || ""
  );
}
