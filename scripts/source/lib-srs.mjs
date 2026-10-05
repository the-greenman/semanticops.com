// Shared resolution for the `srs` binary used by the source pipeline.
// Priority: explicit SRS env var > vendored ./.bin/srs (installed from the pin by
// ensure-srs-cli.mjs). A PATH `srs` is never used: local binaries are often stale.
import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(here, "..", "..");
export const VENDORED_SRS_BIN = join(REPO_ROOT, ".bin", "srs");

export function resolveSrsBinary() {
  if (process.env.SRS) return process.env.SRS;
  if (existsSync(VENDORED_SRS_BIN)) return VENDORED_SRS_BIN;
  throw new Error("srs binary not found: run `node scripts/source/ensure-srs-cli.mjs` first");
}
