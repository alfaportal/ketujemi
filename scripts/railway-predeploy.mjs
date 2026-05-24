import { spawnSync } from "node:child_process";
import { resolveAppRoot, resolveMonorepoRoot } from "./resolve-app-root.mjs";

const appRoot = resolveAppRoot();
const monorepoRoot = resolveMonorepoRoot(appRoot);
const shell = true;

/** Railway often sets NODE_ENV=production; drizzle-kit must be installed (now a dependency). */
const installEnv = {
  ...process.env,
  NODE_ENV: "development",
  NPM_CONFIG_PRODUCTION: "false",
  CI: "true",
};

function runPnpm(args, cwd, { required = true, label } = {}) {
  if (label) console.log(`[railway-predeploy] ${label} …`);

  const result = spawnSync("pnpm", args, {
    cwd,
    env: installEnv,
    stdio: "inherit",
    shell,
  });

  if (result.status !== 0) {
    if (required) {
      console.error(`[railway-predeploy] Command failed: pnpm ${args.join(" ")}`);
      process.exit(result.status ?? 1);
    }
    console.warn(
      `[railway-predeploy] Optional step failed (exit ${result.status}): pnpm ${args.join(" ")}`,
    );
  }
}

console.log("[railway-predeploy] monorepo root:", monorepoRoot);
console.log("[railway-predeploy] app root:", appRoot);

if (!installEnv.DATABASE_URL?.trim()) {
  console.error(
    "[railway-predeploy] DATABASE_URL is not set. Add it in Railway → Variables before preDeploy.",
  );
  process.exit(1);
}

console.log("[railway-predeploy] Installing dependencies (including devDeps for drizzle-kit) …");
runPnpm(["install", "--no-frozen-lockfile"], monorepoRoot, {
  label: "pnpm install",
});

runPnpm(["--filter", "@workspace/db", "exec", "drizzle-kit", "--version"], appRoot, {
  label: "verify drizzle-kit is on PATH",
});

runPnpm(["run", "db:push"], appRoot, {
  required: false,
  label: "drizzle-kit push (db:push) — optional; wallet SQL + API startup cover schema",
});

runPnpm(["--filter", "@workspace/db", "sql:run", "wallet-migration.sql"], appRoot, {
  label: "wallet-migration.sql",
});

runPnpm(
  ["--filter", "@workspace/db", "sql:run", "phone-verify-challenges-migration.sql"],
  appRoot,
  { label: "phone-verify-challenges-migration.sql" },
);

runPnpm(["run", "db:seed:parent-images"], appRoot, {
  required: false,
  label: "db:seed:parent-images",
});

console.log("[railway-predeploy] done");
