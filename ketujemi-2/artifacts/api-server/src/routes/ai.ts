import { Router } from "express";
import { getSessionUser } from "../lib/session-user";
import { getPostingSuggestions } from "../lib/listing-posting-assistant";
import { getSimilarListingsForListing } from "../lib/listing-ai-recommendations";
import { runSupportChat, supportChatFallbackReply, type ChatMessage } from "../lib/support-chatbot";
import { isClaudeConfigured, parseUiLang } from "../lib/claude-client";

const router = Router();

// ─── POST /ai/posting-suggestions ─────────────────────────────────────────────
router.post("/ai/posting-suggestions", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const body = req.body as {
    title?: string;
    description?: string;
    price?: number;
    price_agreement?: boolean;
    category_name?: string;
    parent_category_name?: string;
    image_count?: number;
    lang?: string;
  };

  const suggestions = await getPostingSuggestions(
    {
      title: typeof body.title === "string" ? body.title : "",
      description: typeof body.description === "string" ? body.description : "",
      price: Number(body.price) || 0,
      price_agreement: !!body.price_agreement,
      category_name: body.category_name ?? null,
      parent_category_name: body.parent_category_name ?? null,
      image_count: Number(body.image_count) || 0,
    },
    parseUiLang(body.lang),
  );

  res.json({ suggestions, ai_enabled: isClaudeConfigured() });
});

// ─── GET /ai/listings/:id/similar ─────────────────────────────────────────────
router.get("/ai/listings/:id/similar", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ error: "Invalid listing id" });
    return;
  }

  const similar = await getSimilarListingsForListing(id);
  res.json({ similar, heading: "Mund të të interesojë gjithashtu" });
});

// ─── POST /ai/support-chat ──────────────────────────────────────────────────────
router.post("/ai/support-chat", async (req, res) => {
  const body = req.body as { messages?: ChatMessage[]; lang?: string };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const valid = messages.filter(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0,
  );

  if (valid.length === 0 || valid[valid.length - 1]?.role !== "user") {
    res.status(400).json({ error: "Last message must be from user" });
    return;
  }

  const lang = parseUiLang(body.lang);
  let reply: string;
  try {
    reply = await runSupportChat(valid, lang);
  } catch {
    reply = supportChatFallbackReply(valid, lang);
  }
  res.json({ reply, ai_enabled: isClaudeConfigured() });
});

// ─── GET /ai/status ─────────────────────────────────────────────────────────────
router.get("/ai/status", (_req, res) => {
  res.json({ claude_configured: isClaudeConfigured() });
});

export default router;
