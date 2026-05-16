/**
 * Dev: esbuild --watch (rebuild bundle) + node --watch (restart server when dist changes).
 * Run from artifacts/api-server: `pnpm run dev`
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const distEntry = path.join(artifactDir, "dist", "index.mjs");
const envFile = path.resolve(artifactDir, "..", "..", ".env");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForBundle(maxMs = 120_000) {
  const start = Date.now();
  while (!existsSync(distEntry)) {
    if (Date.now() - start > maxMs) {
      throw new Error(`Timeout waiting for ${distEntry} after esbuild watch start`);
    }
    await sleep(50);
  }
}

const children = [];

function killAll() {
  for (const c of children) {
    try {
      c.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  }
}

process.on("SIGINT", () => {
  killAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  killAll();
  process.exit(0);
});

const buildWatch = spawn(
  process.execPath,
  [path.join(artifactDir, "build.mjs"), "--watch"],
  {
    cwd: artifactDir,
    stdio: "inherit",
  },
);
children.push(buildWatch);

await waitForBundle();

const server = spawn(
  process.execPath,
  ["--watch", "--enable-source-maps", `--env-file=${envFile}`, distEntry],
  {
    cwd: artifactDir,
    stdio: "inherit",
  },
);
children.push(server);

buildWatch.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    killAll();
    process.exit(code ?? 1);
  }
});

server.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    killAll();
    process.exit(code ?? 1);
  }
});
