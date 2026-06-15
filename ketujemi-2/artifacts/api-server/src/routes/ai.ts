import { Router } from "express";
import { isSessionOrAdminAuthorized } from "../lib/session-or-admin.js";
import { getSessionUser } from "../lib/session-user";
import { getPostingSuggestions } from "../lib/listing-posting-assistant";
import { polishListingDescription } from "../lib/listing-description-polish";
import { generateShopDescription } from "../lib/shop-description-generate";
import {
  analyzeListingImage,
  isListingImageAnalyzeConfigured,
} from "../lib/listing-image-analyze";
import { scanImageBase64ForProhibitedContent } from "../lib/listing-image-prohibited-scan";
import { suggestListingCategory } from "../lib/listing-category-suggest";
import { getSimilarListingsForListing } from "../lib/listing-ai-recommendations";
import { runSupportChat, supportChatFallbackReply, type ChatMessage } from "../lib/support-chatbot";
import { isClaudeConfigured, parseUiLang } from "../lib/claude-client";
import { isGoogleVisionConfigured } from "../lib/google-vision-client";
import {
  aiAuthenticatedLimiter,
  aiSimilarListingsLimiter,
  aiSupportChatLimiter,
  analyzeListingImageLimiter,
} from "../lib/express-rate-limiters";

const router = Router();

// ─── POST /ai/posting-suggestions ─────────────────────────────────────────────
router.post("/ai/posting-suggestions", aiAuthenticatedLimiter, async (req, res) => {
  if (!(await isSessionOrAdminAuthorized(req))) {
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

// ─── POST /ai/polish-listing-description ────────────────────────────────────────
router.post("/ai/polish-listing-description", aiAuthenticatedLimiter, async (req, res) => {
  if (!(await isSessionOrAdminAuthorized(req))) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const body = req.body as { description?: string; lang?: string };
  const description = typeof body.description === "string" ? body.description : "";
  const polished = await polishListingDescription({ description }, parseUiLang(body.lang));

  if (!polished) {
    res.status(400).json({ error: "DESCRIPTION_TOO_SHORT" });
    return;
  }

  res.json({ description: polished, ai_enabled: isClaudeConfigured() });
});

// ─── POST /ai/generate-shop-description ─────────────────────────────────────────
router.post("/ai/generate-shop-description", aiAuthenticatedLimiter, async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const body = req.body as {
    business_type?: string;
    shop_name?: string;
    category?: string;
    lang?: string;
  };
  const businessType = typeof body.business_type === "string" ? body.business_type : "";
  const description = await generateShopDescription(
    {
      business_type: businessType,
      shop_name: typeof body.shop_name === "string" ? body.shop_name : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
    },
    parseUiLang(body.lang),
  );

  if (!description) {
    res.status(400).json({ error: "GENERATION_FAILED" });
    return;
  }

  res.json({ description, ai_enabled: isClaudeConfigured() });
});

// ─── POST /ai/suggest-listing-category ─────────────────────────────────────────
router.post("/ai/suggest-listing-category", aiAuthenticatedLimiter, async (req, res) => {
  if (!(await isSessionOrAdminAuthorized(req))) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const body = req.body as { title?: string; description?: string; lang?: string };
  const suggestion = await suggestListingCategory(
    {
      title: typeof body.title === "string" ? body.title : "",
      description: typeof body.description === "string" ? body.description : "",
    },
    parseUiLang(body.lang),
  );

  res.json({ suggestion, ai_enabled: isClaudeConfigured() });
});

// ─── POST /ai/analyze-listing-image ───────────────────────────────────────────
router.post("/ai/analyze-listing-image", analyzeListingImageLimiter, async (req, res) => {
  try {
  if (!(await isSessionOrAdminAuthorized(req))) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const body = req.body as {
    image_base64?: string;
    media_type?: string;
    lang?: string;
    shop_name?: string;
    shop_category?: string;
  };
  const imageBase64 = typeof body.image_base64 === "string" ? body.image_base64.trim() : "";
  const mediaType = typeof body.media_type === "string" ? body.media_type.trim() : "image/jpeg";
  const shopName = typeof body.shop_name === "string" ? body.shop_name.trim() : "";
  const shopCategory = typeof body.shop_category === "string" ? body.shop_category.trim() : "";

  if (!imageBase64) {
    res.status(400).json({ error: "IMAGE_REQUIRED" });
    return;
  }

  if (!isListingImageAnalyzeConfigured()) {
    res.status(503).json({
      error: "AI_NOT_CONFIGURED",
      message: "Image analysis is not configured on the server.",
    });
    return;
  }

  const prohibitedHit = await scanImageBase64ForProhibitedContent(imageBase64, mediaType);
  if (prohibitedHit) {
    res.status(403).json({
      error: "PROHIBITED_CONTENT",
      message: prohibitedHit.reason,
      reason: `PROHIBITED_IMAGE:${prohibitedHit.label}`,
    });
    return;
  }

  const lang = typeof body.lang === "string" ? body.lang.trim() : "";

  const { result: analysis, pipeline } = await analyzeListingImage({
    imageBase64,
    mediaType,
    lang: lang || null,
    shop_name: shopName || null,
    shop_category: shopCategory || null,
  });

  if (!analysis) {
    res.status(422).json({
      error: "ANALYSIS_FAILED",
      ai_enabled: true,
      google_vision: isGoogleVisionConfigured(),
      claude_vision: isClaudeConfigured(),
    });
    return;
  }

  res.json({
    analysis,
    pipeline,
    ai_enabled: isListingImageAnalyzeConfigured(),
    google_vision: isGoogleVisionConfigured(),
    claude_vision: isClaudeConfigured(),
  });
  } catch (err) {
    req.log.error({ err }, "analyze-listing-image failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /ai/listings/:id/similar ─────────────────────────────────────────────
router.get("/ai/listings/:id/similar", aiSimilarListingsLimiter, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ error: "Invalid listing id" });
    return;
  }

  const similar = await getSimilarListingsForListing(id);
  res.json({ similar, heading: "Mund të të interesojë gjithashtu" });
});

// ─── POST /ai/support-chat ──────────────────────────────────────────────────────
router.post("/ai/support-chat", aiSupportChatLimiter, async (req, res) => {
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

  const lang = parseUiLang(
    (body as { ui_lang?: string; site_locale?: string }).ui_lang ??
      (body as { site_locale?: string }).site_locale ??
      body.lang,
  );
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
  res.json({
    claude_configured: isClaudeConfigured(),
    voice_backend: "webspeech",
  });
});

export default router;
