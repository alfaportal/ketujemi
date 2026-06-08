import rateLimit from "express-rate-limit";
import { notifyAdminLoginRateLimited } from "./admin-login-alert.js";

/** Login & register: 10 requests / 15 min per IP */
export const authLoginRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

/** POST /listings: generous cap (avoid blocking normal sellers testing the form). */
export const postListingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: "RATE_LIMIT_POST_LISTING",
      message:
        "Shumë përpjekje për të postuar shpejt. Prisni 10–15 minuta dhe provoni përsëri.",
    });
  },
});

/** POST /admin/login — strict brute-force protection */
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    notifyAdminLoginRateLimited(req);
    res.status(429).json({
      error: "ADMIN_LOGIN_RATE_LIMIT",
      message: "Shumë përpjekje. Prisni 15 minuta dhe provoni përsëri.",
    });
  },
});

/** GET /listings (search): 60 requests / minute per IP */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

/** POST /ai/analyze-listing-image — vision is expensive */
export const analyzeListingImageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: "RATE_LIMIT_IMAGE_ANALYZE",
      message: "Shumë analiza fotosh. Prisni pak dhe provoni përsëri, ose plotësoni manualisht.",
    });
  },
});

/** Authenticated AI helpers (suggestions, polish, category, shop description). */
export const aiAuthenticatedLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: "RATE_LIMIT_AI",
      message: "Shumë kërkesa ndaj sistemit tonë. Prisni pak dhe provoni përsëri.",
    });
  },
});

/** Public support chat — stricter cap. */
export const aiSupportChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: "RATE_LIMIT_SUPPORT_CHAT",
      message: "Shumë mesazhe. Prisni disa minuta para se të provoni përsëri.",
    });
  },
});

/** GET similar listings — light cache-friendly cap. */
export const aiSimilarListingsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
