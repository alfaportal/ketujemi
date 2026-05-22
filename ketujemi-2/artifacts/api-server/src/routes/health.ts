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
  let frontendBuilt = false;
  if (staticRoot) {
    try {
      const indexPath = path.join(path.resolve(staticRoot), "index.html");
      hasFrontend = fs.existsSync(indexPath);
      if (hasFrontend) {
        const html = fs.readFileSync(indexPath, "utf8");
        frontendBuilt =
          html.includes("/assets/") && !html.includes('src="/src/main.tsx"');
      }
    } catch {
      hasFrontend = false;
      frontendBuilt = false;
    }
  }

  const data = HealthCheckResponse.parse({ status: "ok" });
  res.setHeader("Cache-Control", "no-store");
  res.json({
    ...data,
    buildId: readBuildId(),
    hasFrontend,
    frontendBuilt,
  });
});

export default router;
