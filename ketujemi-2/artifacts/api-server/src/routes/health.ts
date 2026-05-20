import fs from "node:fs";
import path from "node:path";
import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function readBuildId(): string {
  return (
    process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.GITHUB_SHA?.slice(0, 7) ??
    process.env.APP_BUILD_ID ??
    "unknown"
  );
}

router.get("/healthz", (_req, res) => {
  const staticRoot = process.env.STATIC_ROOT?.trim();
  let hasFrontend = false;
  if (staticRoot) {
    try {
      hasFrontend = fs.existsSync(path.join(path.resolve(staticRoot), "index.html"));
    } catch {
      hasFrontend = false;
    }
  }

  const data = HealthCheckResponse.parse({ status: "ok" });
  res.setHeader("Cache-Control", "no-store");
  res.json({
    ...data,
    buildId: readBuildId(),
    hasFrontend,
  });
});

export default router;
