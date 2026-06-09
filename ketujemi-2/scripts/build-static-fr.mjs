/** @deprecated Use generate-fr-i18n.mjs (sq→fr). */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "generate-fr-i18n.mjs")], {
  stdio: "inherit",
});
