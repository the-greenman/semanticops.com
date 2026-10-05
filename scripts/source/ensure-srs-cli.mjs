#!/usr/bin/env node
// Vendors the PINNED srs release into ./.bin/srs (gitignored) and records the pin in
// ./.bin/srs.pin. A binary on PATH is never trusted. An SRS env override skips the download.
import { mkdirSync, writeFileSync, chmodSync, existsSync, rmSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { REPO_ROOT, VENDORED_SRS_BIN } from "./lib-srs.mjs";

const RELEASE_URL =
  "https://github.com/the-greenman/srs-rust/releases/download/v0.1.0-build.470/srs-x86_64-unknown-linux-gnu.tar.gz";
const BIN_DIR = join(REPO_ROOT, ".bin");
const PIN_MARKER = join(BIN_DIR, "srs.pin");

if (process.env.SRS) {
  console.log(`SRS override in use (${process.env.SRS}); not downloading.`);
  process.exit(0);
}
if (existsSync(VENDORED_SRS_BIN) && existsSync(PIN_MARKER) && readFileSync(PIN_MARKER, "utf8").trim() === RELEASE_URL) {
  console.log(`srs CLI already vendored at ${VENDORED_SRS_BIN} for this pin.`);
  process.exit(0);
}

console.log(`Vendoring the pinned srs CLI from ${RELEASE_URL} ...`);
const res = await fetch(RELEASE_URL);
if (!res.ok) {
  console.error(`Failed to download srs CLI: HTTP ${res.status} ${res.statusText}`);
  process.exit(1);
}
mkdirSync(BIN_DIR, { recursive: true });
const archivePath = join(BIN_DIR, "srs.tar.gz");
writeFileSync(archivePath, Buffer.from(await res.arrayBuffer()));
execFileSync("tar", ["-xzf", archivePath, "-C", BIN_DIR]);
rmSync(archivePath);
chmodSync(VENDORED_SRS_BIN, 0o755);
writeFileSync(PIN_MARKER, RELEASE_URL + "\n");
console.log(`Installed srs CLI to ${VENDORED_SRS_BIN}`);
