import rateLimit from "express-rate-limit";

/** Login & register: 10 requests / 15 min per IP */
export const authLoginRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

/** POST /listings: 5 requests / hour per IP */
export const postListingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

/** GET /listings (search): 60 requests / minute per IP */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
