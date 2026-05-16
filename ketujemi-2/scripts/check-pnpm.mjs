import { existsSync, unlinkSync } from "node:fs";

for (const file of ["package-lock.json", "yarn.lock"]) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

const userAgent = process.env.npm_config_user_agent ?? "";
// Only block when another package manager is clearly in use.
if (userAgent && !userAgent.includes("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}
