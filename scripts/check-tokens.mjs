#!/usr/bin/env node
// The token guard. Ported in spirit from srs-web's tests/styles-tokens.test.ts and
// muDemocracy's scripts/check-type-tokens.mjs. Fails on:
//   1. a colour literal (hex, rgb, hsl, named) or a var(--x, fallback) outside tokens.css,
//      in .css and .astro files (<style> blocks, SVG attributes and frontmatter included)
//   2. a primitive read outside tokens.css (components read semantic or component tokens only)
//   3. a literal font-size, font-family, font-weight, letter-spacing or line-height
//   4. a semantic colour with no dark redefinition, or two dark blocks that disagree
//   5. a component <style> whose rules are not inside @layer components
//   6. a var(--x) that is read but defined nowhere
//   7. a diagram colour under 3:1, or a text colour under 4.5:1, on its grounds
//   8. the layer order not declared first in Base.astro (inlined component CSS would set it instead)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { colourReport, contrast, isHex, loadTokens, resolve } from "./lib/tokens.mjs";

const ROOT = process.cwd();
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = walk(join(ROOT, "src")).filter((p) => /\.(css|astro)$/.test(p));
const rel = (p) => relative(ROOT, p);
const errors = [];
const fail = (file, line, msg) => errors.push(`${file}${line ? `:${line}` : ""}  ${msg}`);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));
const lineOf = (text, idx) => text.slice(0, idx).split("\n").length;

const t = loadTokens(ROOT);
const primitiveNames = [...t.primitives.keys()].map((n) => n.slice(2));

// ---- 1, 2, 3, 6: scan every css and astro file -------------------------------------
const NAMED = "white|black|red|green|blue|yellow|orange|purple|pink|brown|gray|grey|navy|teal|silver|maroon|olive|lime|aqua|fuchsia";
const COLOUR = [
  ["hex colour", /#[0-9a-fA-F]{3,8}\b/g],
  ["rgb()", /\brgba?\(/g],
  ["hsl()", /\bhsla?\(/g],
  ["oklch/lab/hwb()", /\b(oklch|oklab|lch|lab|hwb)\(/g],
  ["named colour", new RegExp(`\\b(fill|stroke|color|background(?:-color)?|border(?:-[a-z]+)?-color|outline-color|stop-color)\\s*[:=]\\s*["']?(${NAMED})\\b`, "gi")],
  ["var() fallback", /var\(\s*--[\w-]+\s*,/g],
];
const PRIMITIVE_READ = new RegExp(`var\\(\\s*--(${primitiveNames.map((n) => n.replace(/[-]/g, "\\-")).join("|")})\\s*\\)`, "g");
const TYPE_PROPS = /(?<![\w-])(font-size|font-family|font-weight|letter-spacing|line-height|font)\s*(?::\s*([^;}"'\n]+)|=\s*(?:"([^"]*)"|\{([^}]*)\}))/g;
const TYPE_OK = /^(var\(--[\w-]+\)|inherit|initial|unset)$/;

const defined = new Set(["--font-plex-sans", "--font-plex-mono"]); // emitted by the Astro Fonts API
const used = [];

for (const file of files) {
  const raw = readFileSync(file, "utf8");
  const text = stripComments(raw);
  const name = rel(file);
  const isTokens = name === "src/styles/tokens.css";
  for (const m of text.matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
  for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) used.push([name, lineOf(text, m.index), m[1]]);
  if (!isTokens) {
    for (const [label, re] of COLOUR) for (const m of text.matchAll(re)) fail(name, lineOf(text, m.index), `${label} outside tokens.css: ${m[0]}`);
    for (const m of text.matchAll(PRIMITIVE_READ)) fail(name, lineOf(text, m.index), `reads primitive ${m[0]}: use a semantic or component token`);
  }
  for (const m of text.matchAll(TYPE_PROPS)) {
    const value = (m[2] ?? m[3] ?? m[4] ?? "").trim().replace(/\s*!important$/, "");
    const line = text.slice(0, m.index).split("\n").pop() ?? "";
    if (/^\s*--[\w-]+\s*:/.test(line + m[0])) continue; // a token definition
    if (!TYPE_OK.test(value)) fail(name, lineOf(text, m.index), `literal ${m[1]}: ${value}`);
  }
}

// ---- 6: every var() read resolves to something defined -------------------------------
for (const [file, line, name] of used) if (!defined.has(name) && !name.startsWith("--astro-code-")) fail(file, line, `reads ${name}, which is defined nowhere`);

// ---- 4: dark redefinitions -----------------------------------------------------------
const themed = (n) => /^--(color|shadow)-/.test(n);
for (const name of t.light.keys()) {
  if (!themed(name)) continue;
  if (!t.darkMedia.has(name)) fail("src/styles/tokens.css", 0, `${name} has no dark redefinition under prefers-color-scheme`);
  if (!t.darkManual.has(name)) fail("src/styles/tokens.css", 0, `${name} has no dark redefinition under [data-theme="dark"]`);
}
for (const [name, v] of t.darkMedia) {
  if (!t.light.has(name)) fail("src/styles/tokens.css", 0, `${name} is redefined for dark but not defined for light`);
  else if (t.darkManual.get(name) !== v) fail("src/styles/tokens.css", 0, `${name} differs between the two dark blocks: "${v}" vs "${t.darkManual.get(name)}"`);
}
for (const name of t.darkManual.keys()) if (!t.darkMedia.has(name) && name !== "color-scheme") fail("src/styles/tokens.css", 0, `${name} is in the manual dark block but not the media one`);

// ---- 5: component <style> blocks sit inside @layer components -----------------------
for (const file of files.filter((f) => f.endsWith(".astro"))) {
  const raw = readFileSync(file, "utf8");
  for (const m of raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const css = stripComments(m[1]);
    if (css.trim() === "@layer tokens, base, layout, components, theme, utilities;") continue; // the layer order statement itself
    const rules = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") {
        depth--;
        if (depth === 0) {
          rules.push(css.slice(start, i + 1).trim());
          start = i + 1;
        }
      }
    }
    const outside = css.slice(start).trim();
    if (outside) rules.push(outside);
    for (const r of rules) if (!/^@layer\s+components\s*\{/.test(r)) fail(rel(file), lineOf(raw, m.index), `style rule outside @layer components: ${r.slice(0, 50).replace(/\s+/g, " ")}`);
    if (rules.length === 0) fail(rel(file), lineOf(raw, m.index), "empty <style> block");
  }
}

// ---- 8: the layer order is fixed first in the document (inlined component CSS would otherwise set it) --
const ORDER = "@layer tokens, base, layout, components, theme, utilities;";
for (const f of ["src/layouts/Base.astro", "src/styles/index.css"]) {
  if (!readFileSync(join(ROOT, f), "utf8").includes(ORDER)) fail(f, 0, `must declare the layer order: ${ORDER}`);
}
const base = readFileSync(join(ROOT, "src/layouts/Base.astro"), "utf8");
if (base.indexOf(ORDER) > base.indexOf("<Font")) fail("src/layouts/Base.astro", 0, "the layer order statement must come before any other head content that can carry CSS");

// ---- 7: contrast ---------------------------------------------------------------------
const GRAPHIC = ["--color-structure", "--color-record", "--color-field", "--color-relation"];
const TEXT = ["--color-text", "--color-text-strong", "--color-muted", "--color-muted-strong"];
const report = colourReport(t);
const rows = [];
for (const r of report) {
  const need = GRAPHIC.includes(r.name) ? 3 : TEXT.includes(r.name) ? 4.5 : 0;
  if (!need) continue;
  for (const [scheme, list] of [["light", r.onLight], ["dark", r.onDark], ["ink", r.onInk]]) {
    for (const [ground, c] of list) {
      if (c === null) continue;
      rows.push(`${r.name} ${scheme}/${ground} ${c.toFixed(2)}`);
      if (c < need) fail("src/styles/tokens.css", 0, `${r.name} on ${scheme} ${ground} is ${c.toFixed(2)}:1, needs ${need}:1`);
    }
  }
}
// Text drawn on a fill: [text token, fill token, minimum], checked in both schemes.
const ON_FILL = [
  ["--color-on-strong", "--color-text-strong", 4.5],
  ["--color-on-note", "--color-note", 4.5],
  ["--color-ground", "--color-record", 4.5], // the label inside a record disc
];
for (const [fg, bg, need] of ON_FILL) {
  for (const [scheme, maps] of [["light", [t.light, t.primitives]], ["dark", [t.darkManual, t.light, t.primitives]]]) {
    const a = resolve(fg, ...maps);
    const b = resolve(bg, ...maps);
    if (!isHex(a) || !isHex(b)) continue;
    const c = contrast(a, b);
    rows.push(`${fg} on ${bg} ${scheme} ${c.toFixed(2)}`);
    if (c < need) fail("src/styles/tokens.css", 0, `${fg} on ${bg} (${scheme}) is ${c.toFixed(2)}:1, needs ${need}:1`);
  }
}
// Notes (gold) are a fill drawn with a relation-coloured edge: the edge carries the 3:1.

if (process.argv.includes("--verbose")) console.log(rows.join("\n"));
if (errors.length) {
  console.error(`check-tokens: ${errors.length} problem(s)\n` + errors.join("\n"));
  process.exit(1);
}
console.log(`check-tokens: ${files.length} files clean. ${t.primitives.size} primitives, ${[...t.light.keys()].filter(themed).length} themed semantic tokens, ${t.components.size} component tokens, ${rows.length} contrast pairs.`);
