import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { attachStaticFrontend } from "./lib/serve-static";

const app: Express = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
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
app.use(cors({ origin: true, credentials: true }));
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

app.use("/api", router);
attachStaticFrontend(app);

export default app;
