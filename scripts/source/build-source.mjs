#!/usr/bin/env node
// Projects source/ (an SRS repository) into the committed site data:
//   src/data/<page>.json + site.json   JSON for the human pages
//   public/agents/<page>.md|.json      the agent site
//   public/llms.txt                    agent entry point
//   public/agents/semanticops.srs      the whole repository as a portable archive
// Facts live in the records. This script only runs the srs CLI and reshapes its output.
// Usage: node scripts/source/build-source.mjs [--check]   (--check fails if the output differs from git)
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { REPO_ROOT, resolveSrsBinary } from "./lib-srs.mjs";

const SOURCE = join(REPO_ROOT, "source");
const DATA_DIR = join(REPO_ROOT, "src", "data");
const AGENTS_DIR = join(REPO_ROOT, "public", "agents");
const BUNDLE = join(AGENTS_DIR, "semanticops.srs");
const BANNER = "<!-- generated from source/ by scripts/source/build-source.mjs; do not edit -->\n";

execFileSync(process.execPath, [join(REPO_ROOT, "scripts", "source", "ensure-srs-cli.mjs")], { stdio: "inherit" });
const SRS = resolveSrsBinary();

function srs(...args) {
  const out = execFileSync(SRS, ["--repo", SOURCE, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const env = JSON.parse(out);
  if (!env.ok) fail(`srs ${args.join(" ")} failed: ${JSON.stringify(env.diagnostics)}`);
  return env.payload;
}
function fail(msg) {
  console.error(msg);
  process.exit(1);
}
const write = (path, text) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  console.log(`  wrote ${relative(REPO_ROOT, path)}`);
};
const json = (o) => `${JSON.stringify(o, null, 2)}\n`;

// 1. validate: any diagnostic, error or warning, stops the build (the exit code never signals invalid data)
const { diagnostics } = srs("repo", "validate");
if (diagnostics.length) fail(`source/ is not valid:\n${diagnostics.join("\n")}`);

// clear previous outputs so a removed page cannot linger
for (const dir of [DATA_DIR, AGENTS_DIR]) {
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir)) if (/\.(json|md|srs)$/.test(f) && f !== "README.md") rmSync(join(dir, f));
}

// 2. render every declared presentation: markdown as declared, JSON from the same Composition
const { presentations } = srs("repo", "presentation", "list");
if (!presentations.length) fail("no renderedPresentations declared in source/manifest.json");
const pages = [];
for (const { compositionId, format, outputPath } of presentations) {
  const { composition } = srs("composition", "get", compositionId);
  const containers = [...new Set(composition.sections.map((s) => s.source?.containerId).filter(Boolean))];
  if (containers.length !== 1) fail(`composition ${compositionId} must name exactly one page container`);
  const target = resolve(SOURCE, outputPath);
  if (dirname(target) !== AGENTS_DIR) fail(`presentation output ${outputPath} is outside public/agents/`);
  const render = (fmt) => srs("render", "composition", "--view", compositionId, "--container", containers[0], "--view-format", fmt);
  const rendered = render(format);
  if (rendered.diagnostics.length) fail(`render ${outputPath}: ${rendered.diagnostics.join("; ")}`);
  write(target, BANNER + rendered.rendered);
  pages.push({ page: basename(outputPath, extname(outputPath)), projection: render("json").projection });
}

// 3. thin presentation transform: rename keys, drop volatile ones, give relation targets their slug.
// Order and membership are taken from the render output untouched.
const slugOf = new Map();
for (const { projection } of pages)
  for (const s of projection.sections) for (const r of s.records) slugOf.set(r.instanceId, r.fields.slug);
const entry = (r) => ({
  instanceId: r.instanceId,
  type: r.typeName,
  slug: r.fields.slug,
  fields: r.fields,
  ...(r.relations && {
    relations: r.relations.map((x) => ({
      type: x.relationType,
      direction: x.direction,
      label: x.label,
      targets: x.targets.map((t) => ({ instanceId: t.instanceId, slug: slugOf.get(t.instanceId), label: t.displayLabel })),
    })),
  }),
});
const outputs = pages.map(({ page, projection }) => ({
  page,
  title: projection.containerTitle,
  entries: projection.sections.flatMap((s) => s.records.map(entry)),
}));

// copy lint: the owner's copy rules, checked on everything that ships
const banned = [/\u2014/, /\b(RFC-\d+|Tier 1|TypedRecord|three tiers|graduatedAt|rootInstanceIds|instanceIndex|assertedBy|DocumentView|createdBy)\b/, /\b(yin|yang|taiji|taijitu|wuji|Tao)\b/i];
for (const o of outputs)
  for (const hit of banned.map((re) => JSON.stringify(o).match(re)).filter(Boolean))
    fail(`copy rule violated on page ${o.page}: ${hit[0]}`);

for (const o of outputs) {
  write(join(DATA_DIR, `${o.page}.json`), json(o));
  write(join(AGENTS_DIR, `${o.page}.json`), json(o));
}

// 4. site.json: the repository identity and the pages in the root container's navigation order
const nav = srs("repo", "navigation").navigation;
const identity = srs("record", "get", nav.identity.instanceId).record.fieldValues;
const sitePages = nav.sections.map((s) => {
  const o = outputs.find((x) => x.entries[0]?.instanceId === s.instanceId);
  if (!o) fail(`navigation section ${s.instanceId} has no rendered page`);
  const { slug, title, summary } = o.entries[0].fields;
  return { page: slug, title, summary };
});
write(join(DATA_DIR, "site.json"), json({ title: identity.title, purpose: identity.statement, pages: sitePages }));

// 5. llms.txt: generated header (from the presentations) + the repository's own agent index
const repoTitle = srs("repo", "map").repoMap.repository.title;
const files = outputs.flatMap((o) => [`/agents/${o.page}.md`, `/agents/${o.page}.json`]);
const header = [
  "<!-- generated from source/ by scripts/source/build-source.mjs; do not edit -->",
  `# ${repoTitle}: files for agents`,
  "",
  "Generated from the SRS repository at source/:",
  "",
  ...files.map((f) => `- ${f}`),
  `- /agents/${basename(BUNDLE)} (the whole repository as one portable .srs archive)`,
  "",
  "---",
  "",
].join("\n");
write(join(REPO_ROOT, "public", "llms.txt"), header + srs("repo", "agent-index").rendered);

// 6. the bundle (deterministic)
srs("archive", "pack", "--output", BUNDLE);
console.log(`  wrote ${relative(REPO_ROOT, BUNDLE)}`);

if (process.argv.includes("--check")) {
  const dirty = execFileSync("git", ["status", "--porcelain", "--", "source", "src/data", "public/llms.txt", "public/agents"], { cwd: REPO_ROOT, encoding: "utf8" });
  if (dirty) fail(`generated output differs from git:\n${dirty}`);
}
