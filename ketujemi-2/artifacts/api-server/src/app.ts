import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import googleOAuthPublicRouter from "./routes/google-oauth-public";
import facebookOAuthPublicRouter from "./routes/facebook-oauth-public";
import tiktokOAuthPublicRouter from "./routes/tiktok-oauth-public";
import { logger } from "./lib/logger";
import { attachStaticFrontend } from "./lib/serve-static";
import { canonicalHostRedirect } from "./lib/canonical-host";
import { isCorsOriginAllowed } from "./lib/cors-config.js";

const app: Express = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);

  /** www → ketujemi.com (301), http → https — canonical host for SEO. */
  app.use(canonicalHostRedirect);

  app.use((_req, res, next) => {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
    res.setHeader("Permissions-Policy", "microphone=(self)");
    next();
  });
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 16) {
  throw new Error(
    "SESSION_SECRET must be set (min 16 chars) — required for signed session cookies.",
  );
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (isCorsOriginAllowed(origin)) {
        callback(null, origin ?? true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(cookieParser(sessionSecret));
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, _res, next) => {
    const r = req as express.Request & { rawBody?: Buffer };
    r.rawBody = Buffer.isBuffer(r.body) ? r.body : Buffer.from("");
    next();
  },
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(googleOAuthPublicRouter);
app.use(facebookOAuthPublicRouter);
app.use("/api", facebookOAuthPublicRouter);
app.use(tiktokOAuthPublicRouter);
app.use("/api", router);
attachStaticFrontend(app);

export default app;
