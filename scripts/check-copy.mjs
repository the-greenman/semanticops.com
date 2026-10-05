#!/usr/bin/env node
// The copy guard. Owner rules for everything a reader sees:
//   - no em dashes (or en dashes), anywhere, in any file
//   - no lineage vocabulary and no marketing filler in visible copy (comments may name the lineage)
//   - none of the dead or over-claimed terms from the brief, no issue, RFC or revision numbers
// Visible copy = every .astro, .css, .ts and .md file under src/ and the .svg files under
// public/, with comments removed. Docs (README, CLAUDE.md, AGENTS.md, plans/) get the dash check only.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((n) => {
        const p = join(dir, n);
        return statSync(p).isDirectory() ? walk(p) : [p];
      })
    : [];
const rel = (p) => relative(ROOT, p);
const lineOf = (text, idx) => text.slice(0, idx).split("\n").length;

const blank = (m) => m.replace(/[^\n]/g, " ");
const stripComments = (s) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/(^|[^:"'\w\\])\/\/.*$/gm, (m, pre) => pre + blank(m.slice(pre.length)));

const DASH = /[—–]/g;
const WORDS = [
  ["lineage vocabulary", /\b(yin|yang|tao|taoism|taoist|dao|daoist|daoism|taiji|taijitu|wuji|confuc\w*|autopoie\w*|cybernetic\w*|requisite variety|second-order|harmony of opposites|ink-wash|enso)\b/gi],
  ["marketing filler", /\b(revolutionary|seamless\w*|unlock\w*|empower\w*|leverag\w*|game-chang\w*|cutting-edge|next-generation|world-class|best-in-class)\b/gi],
  ["dead or over-claimed term", /(Tier 1|TypedRecord|graduatedAt|three tiers|rootInstanceIds|instanceIndex|assertedBy|hyperedge|DocumentView|createdBy|relations\.json|audit trail|changelog)/g],
  ["issue, RFC or revision number", /(\bRFC-?\d+|\bADR-?\d+|\bsrs#\d+|\bdataModelRevision\b|\bbuild\.\d+)/g],
];

const errors = [];
const srcFiles = [...walk(join(ROOT, "src")).filter((p) => /\.(astro|css|ts|md|mdx)$/.test(p)), ...walk(join(ROOT, "public")).filter((p) => p.endsWith(".svg"))];
const docFiles = ["README.md", "CLAUDE.md", "AGENTS.md", ...walk(join(ROOT, "plans")).map(rel)].map((p) => join(ROOT, p)).filter(existsSync);

for (const file of [...srcFiles, ...docFiles]) {
  const raw = readFileSync(file, "utf8");
  for (const m of raw.matchAll(DASH)) errors.push(`${rel(file)}:${lineOf(raw, m.index)}  dash character: use a full stop, comma, colon or spaced hyphen`);
}
for (const file of srcFiles) {
  const text = stripComments(readFileSync(file, "utf8"));
  for (const [label, re] of WORDS) for (const m of text.matchAll(re)) errors.push(`${rel(file)}:${lineOf(text, m.index)}  ${label}: "${m[0]}"`);
}

if (errors.length) {
  console.error(`check-copy: ${errors.length} problem(s)\n` + errors.join("\n"));
  process.exit(1);
}
console.log(`check-copy: ${srcFiles.length} source files and ${docFiles.length} docs clean.`);
