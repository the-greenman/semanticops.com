#!/usr/bin/env node
// The link guard. Walks dist/**/*.html (run `npm run build` first) and fails when:
//   - an internal href or src does not resolve to a file in dist/
//   - a #fragment does not match an id in the page it points at
//   - an id is used twice in one page (a duplicate silently breaks a deep link)
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = join(process.cwd(), "dist");
if (!existsSync(DIST)) {
  console.error("check-links: dist/ is missing. Run npm run build first.");
  process.exit(1);
}
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const htmlFiles = walk(DIST).filter((p) => p.endsWith(".html"));

const attr = (name) => new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>"']+))`, "g");
const values = (html, name) => [...html.matchAll(attr(name))].map((m) => m[1] ?? m[2] ?? m[3]);

// The file a URL path serves: a page (dir/index.html or name.html) or a plain asset.
const fileFor = (path) => {
  const p = join(DIST, decodeURIComponent(path));
  if (path.endsWith("/")) return existsSync(join(p, "index.html")) ? join(p, "index.html") : undefined;
  if (existsSync(p) && statSync(p).isFile()) return p;
  if (existsSync(`${p}.html`)) return `${p}.html`;
  if (existsSync(join(p, "index.html"))) return join(p, "index.html");
  return undefined;
};

const pages = new Map(); // file -> { html, ids }
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  pages.set(file, { html, ids: values(html, "id") });
}

const errors = [];
let checked = 0;
for (const [file, { html, ids }] of pages) {
  const here = "/" + relative(DIST, file);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${here}  duplicate id "${id}"`);
    seen.add(id);
  }
  for (const ref of [...values(html, "href"), ...values(html, "src")]) {
    if (/^([a-z][a-z0-9+.-]*:|\/\/|data:)/i.test(ref)) continue; // external
    checked++;
    const [pathPart, fragment] = ref.split("#");
    const query = pathPart.split("?")[0];
    const target = query === "" ? file : fileFor(query.startsWith("/") ? query : new URL(query, `http://x${here}`).pathname);
    if (!target) {
      errors.push(`${here}  broken link: ${ref}`);
      continue;
    }
    if (fragment) {
      const t = pages.get(target);
      if (!t) errors.push(`${here}  fragment on a non-page: ${ref}`);
      else if (!t.ids.includes(decodeURIComponent(fragment))) errors.push(`${here}  no id "${fragment}" in ${"/" + relative(DIST, target)} (from ${ref})`);
    }
  }
}

if (errors.length) {
  console.error(`check-links: ${errors.length} problem(s)\n` + [...new Set(errors)].join("\n"));
  process.exit(1);
}
console.log(`check-links: ${htmlFiles.length} pages, ${checked} internal links and anchors resolve, no duplicate ids.`);
