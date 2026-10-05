#!/usr/bin/env node
// Vendors the PINNED srs release into ./.bin/srs (gitignored). The archive's sha256 is pinned and
// verified before anything is extracted; ./.bin/srs.pin records the URL and the hash. A binary on
// PATH is never trusted. The SRS env override (a path to your own binary) is refused with --check,
// so a drift check can only ever run against the pinned build.
import { mkdirSync, writeFileSync, chmodSync, existsSync, rmSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { REPO_ROOT, VENDORED_SRS_BIN } from "./lib-srs.mjs";

const RELEASE_URL =
  "https://github.com/the-greenman/srs-rust/releases/download/v0.1.0-build.470/srs-x86_64-unknown-linux-gnu.tar.gz";
const SHA256 = "64777447585976e7fb0ce54bf05dd787558c1327c56cdb76cefdd1990e305a19";
const BIN_DIR = join(REPO_ROOT, ".bin");
const PIN_MARKER = join(BIN_DIR, "srs.pin");
const PIN = `${RELEASE_URL}\nsha256:${SHA256}\n`;

const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

if (process.env.SRS) {
  if (process.argv.includes("--check")) die("--check refuses the SRS override: it must run against the pinned release. Unset SRS.");
  console.log(`SRS override in use (${process.env.SRS}); not downloading.`);
  process.exit(0);
}
if (process.platform !== "linux" || process.arch !== "x64")
  die(`only linux-x86_64 release assets exist (this is ${process.platform}-${process.arch}); set SRS=/path/to/srs`);

if (existsSync(VENDORED_SRS_BIN) && existsSync(PIN_MARKER) && readFileSync(PIN_MARKER, "utf8") === PIN) {
  console.log(`srs CLI already vendored at ${VENDORED_SRS_BIN} for this pin.`);
  process.exit(0);
}

console.log(`Vendoring the pinned srs CLI from ${RELEASE_URL} ...`);
let archive;
try {
  const res = await fetch(RELEASE_URL);
  if (!res.ok) die(`download failed: HTTP ${res.status} ${res.statusText}`);
  archive = Buffer.from(await res.arrayBuffer());
} catch (err) {
  die(`download failed: ${err.cause?.code ?? err.message}`);
}
const actual = createHash("sha256").update(archive).digest("hex");
if (actual !== SHA256) die(`sha256 mismatch for the srs archive: expected ${SHA256}, got ${actual}. Nothing was installed.`);

mkdirSync(BIN_DIR, { recursive: true });
const archivePath = join(BIN_DIR, "srs.tar.gz");
writeFileSync(archivePath, archive);
try {
  execFileSync("tar", ["-xzf", archivePath, "-C", BIN_DIR, "srs"]);
} finally {
  rmSync(archivePath, { force: true });
}
chmodSync(VENDORED_SRS_BIN, 0o755);
writeFileSync(PIN_MARKER, PIN);
console.log(`Installed srs CLI to ${VENDORED_SRS_BIN}`);
