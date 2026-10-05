// Parses src/styles/tokens.css and tokens-components.css into plain data. Used by the
// token guard (scripts/check-tokens.mjs) and by the /styleguide token tables, so the
// tables can never drift from the file: they are the file.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

/** Parse CSS into rules: { selector, at, decls: [[name, value]], start }. Nested @media/@layer are flattened with `at`. */
export function parseRules(css, at = "", offset = 0) {
  const text = stripComments(css);
  const rules = [];
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf("{", i);
    if (open === -1) break;
    const head = text.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === "{") depth++;
      else if (text[j] === "}") depth--;
      j++;
    }
    const body = text.slice(open + 1, j - 1);
    if (head.startsWith("@")) {
      rules.push(...parseRules(body, head, offset + open + 1));
    } else {
      const decls = [];
      for (const m of body.matchAll(/(--[\w-]+|[\w-]+)\s*:\s*([^;]+);?/g)) decls.push([m[1], m[2].trim()]);
      rules.push({ selector: head.replace(/\s+/g, " "), at, decls, start: offset + open });
    }
    i = j;
  }
  return rules;
}

/** Split tokens.css at its tier marker comments and tag each rule with its tier. */
export function loadTokens(root = process.cwd()) {
  const src = readFileSync(join(root, "src/styles/tokens.css"), "utf8");
  const markers = [...src.matchAll(/\/\*\s*tier:\s*([^*]+?)\s*\*\//g)].map((m) => ({ tier: m[1], at: m.index }));
  const rules = parseRules(src).map((r) => {
    let tier = "";
    for (const m of markers) if (m.at <= r.start + 1) tier = m.tier;
    return { ...r, tier };
  });
  const decl = (r) => new Map(r.decls);
  const primitives = new Map();
  const light = new Map();
  const darkMedia = new Map();
  const darkManual = new Map();
  const extra = []; // rules after the dark-manual marker that are not the dark set itself
  for (const r of rules) {
    if (r.tier === "primitive") for (const [k, v] of r.decls) primitives.set(k, v);
    else if (r.tier === "semantic" && r.selector === ":root" && r.at === "") for (const [k, v] of r.decls) light.set(k, v);
    else if (r.tier === "semantic, dark (media)") for (const [k, v] of r.decls) darkMedia.set(k, v);
    else if (r.tier.startsWith("semantic, dark (manual")) {
      if (r.selector.includes('[data-theme="dark"]')) for (const [k, v] of r.decls) darkManual.set(k, v);
      else extra.push(r);
    }
  }
  const comp = readFileSync(join(root, "src/styles/tokens-components.css"), "utf8");
  const components = new Map();
  for (const r of parseRules(comp)) for (const [k, v] of r.decls) components.set(k, v);
  return { primitives, light, darkMedia, darkManual, extra, components, src };
}

/** Resolve a custom property to a literal through var() chains. */
export function resolve(name, ...maps) {
  const seen = new Set();
  let cur = name;
  for (;;) {
    if (seen.has(cur)) return undefined;
    seen.add(cur);
    let v;
    for (const m of maps) if (m.has(cur)) { v = m.get(cur); break; }
    if (v === undefined) return undefined;
    const ref = v.match(/^var\((--[\w-]+)\)$/);
    if (!ref) return v;
    cur = ref[1];
  }
}

const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export function luminance(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
export const isHex = (v) => /^#[0-9a-fA-F]{6}$/.test(v ?? "");

/** The grounds a colour is read against, per scheme: [label, hex]. */
export function grounds(t) {
  const L = (n) => resolve(n, t.light, t.primitives);
  const D = (n) => resolve(n, t.darkManual, t.light, t.primitives);
  return {
    light: [["bg", L("--color-bg")], ["page", L("--color-page")]],
    dark: [["bg", D("--color-bg")], ["page", D("--color-page")]],
    ink: [["ink", D("--color-ink-bg")]],
  };
}

/** Contrast of every semantic colour against its grounds, for the styleguide table and the guard. */
export function colourReport(t) {
  const g = grounds(t);
  const rows = [];
  for (const [name] of t.light) {
    if (!/^--color-/.test(name)) continue;
    const l = resolve(name, t.light, t.primitives);
    const d = resolve(name, t.darkManual, t.light, t.primitives);
    rows.push({
      name,
      light: l,
      dark: d,
      onLight: g.light.map(([k, bg]) => [k, isHex(l) && isHex(bg) ? contrast(l, bg) : null]),
      onDark: g.dark.map(([k, bg]) => [k, isHex(d) && isHex(bg) ? contrast(d, bg) : null]),
      onInk: g.ink.map(([k, bg]) => [k, isHex(d) && isHex(bg) ? contrast(d, bg) : null]),
    });
  }
  return rows;
}
