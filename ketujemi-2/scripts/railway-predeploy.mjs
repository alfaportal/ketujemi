import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shell = process.platform === "win32";

const result = spawnSync("pnpm", ["run", "db:push"], { cwd: root, stdio: "inherit", shell });
if (result.status !== 0) process.exit(result.status ?? 1);
