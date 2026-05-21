/**
 * Runs a command with NODE_OPTIONS including --disable-warning=DEP0040 (punycode deprecation).
 */
import { spawnSync } from "node:child_process";

const extra = "--disable-warning=DEP0040";
const existing = process.env.NODE_OPTIONS?.trim();
process.env.NODE_OPTIONS = existing ? `${existing} ${extra}` : extra;

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("Usage: node scripts/with-node-options.mjs <command> [args...]");
  process.exit(1);
}

const result = spawnSync(cmd, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

process.exit(result.status ?? 1);
