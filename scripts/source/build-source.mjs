#!/usr/bin/env node
// Projects source/ (an SRS repository) into the committed site data:
//   src/data/<page>.json + site.json   JSON for the human pages
//   public/agents/<page>.md|.json      the agent site, plus agent-index.md and the .srs bundle
//   public/llms.txt                    agent entry point (llmstxt convention)
//   public/try/meeting.srs|.md|.json   the sample repository in examples/meeting (validated, packed, rendered)
// Facts live in the records. This script runs the srs CLI and reshapes its output.
// Everything is rendered and linted into a staging directory first; only when all of it passes is
// it swapped into src/data and public/agents. On any failure the tree is left untouched.
// Usage: node scripts/source/build-source.mjs [--check]   (--check fails if the output differs from git)
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { REPO_ROOT, resolveSrsBinary } from "./lib-srs.mjs";

const CHECK = process.argv.includes("--check");
const SOURCE = join(REPO_ROOT, "source");
const SAMPLE = join(REPO_ROOT, "examples", "meeting");
const TRY_DIR = join(REPO_ROOT, "public", "try");
const SAMPLE_NAME = "meeting";
const DATA_DIR = join(REPO_ROOT, "src", "data");
const AGENTS_DIR = join(REPO_ROOT, "public", "agents");
const LLMS = join(REPO_ROOT, "public", "llms.txt");
const MARKER = "generated from source/ by scripts/source/build-source.mjs; do not edit";
const BUNDLE_NAME = "semanticops.srs";
const INDEX_NAME = "agent-index.md";

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const ensured = spawnSync(process.execPath, [join(REPO_ROOT, "scripts", "source", "ensure-srs-cli.mjs"), ...(CHECK ? ["--check"] : [])], { stdio: "inherit" });
if (ensured.status !== 0) process.exit(ensured.status ?? 1); // the child already printed one line
const SRS = resolveSrsBinary();

function srsAt(repo, ...args) {
  const out = execFileSync(SRS, ["--repo", repo, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const env = JSON.parse(out);
  if (!env.ok) fail(`srs ${args.join(" ")} failed: ${JSON.stringify(env.diagnostics)}`);
  return env.payload;
}
const srs = (...args) => srsAt(SOURCE, ...args);
const json = (o) => `${JSON.stringify(o, null, 2)}\n`;

mkdirSync(join(REPO_ROOT, ".bin"), { recursive: true });
const STAGE = mkdtempSync(join(REPO_ROOT, ".bin", "stage-"));
const stageData = join(STAGE, "data");
const stageAgents = join(STAGE, "agents");
const stageTry = join(STAGE, "try");
mkdirSync(stageData);
mkdirSync(stageAgents);
mkdirSync(stageTry);
const staged = []; // everything written, for the log
const put = (dir, name, text) => {
  writeFileSync(join(dir, name), text);
  staged.push(relative(STAGE, join(dir, name)));
};

process.on("exit", () => rmSync(STAGE, { recursive: true, force: true })); // also covers fail()

function build() {
  // 1. validate: any diagnostic, error or warning, stops the build (the exit code never signals invalid data)
  const { diagnostics } = srs("repo", "validate");
  if (diagnostics.length) fail(`source/ is not valid:\n${diagnostics.join("\n")}`);

  // 2. render every declared presentation: markdown as declared, JSON from the same Composition
  const { presentations } = srs("repo", "presentation", "list");
  if (!presentations.length) fail("no renderedPresentations declared in source/manifest.json");
  const pages = [];
  for (const { compositionId, format, outputPath } of presentations) {
    const rel = normalize(outputPath);
    if (isAbsolute(rel) || rel.startsWith("..") || dirname(rel) !== "projections" || format !== "markdown")
      fail(`presentation ${outputPath} (${format}) must be a markdown file directly under projections/, inside the repository`);
    const page = basename(rel, extname(rel));
    const { composition } = srs("composition", "get", compositionId);
    const containers = [...new Set(composition.sections.map((s) => s.source?.containerId).filter(Boolean))];
    if (containers.length !== 1) fail(`composition ${compositionId} must name exactly one page container`);
    const render = (fmt) => {
      const r = srs("render", "composition", "--view", compositionId, "--container", containers[0], "--view-format", fmt);
      if (r.diagnostics.length) fail(`render ${page} (${fmt}): ${r.diagnostics.join("; ")}`);
      return r;
    };
    pages.push({ page, md: render("markdown").rendered, projection: render("json").projection });
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
  const outputs = pages.map(({ page, md, projection }) => {
    const entries = projection.sections.flatMap((s) => s.records.map(entry));
    if (entries[0]?.type !== "page" || entries[0].slug !== page)
      fail(`page key mismatch: presentation projections/${page}.md, but the container's first entry is ${entries[0]?.type} "${entries[0]?.slug}"`);
    return { page, md, data: { page, title: projection.containerTitle, entries } };
  });

  // 4. site.json: the repository identity and the pages in the root container's navigation order
  const nav = srs("repo", "navigation").navigation;
  const identity = srs("record", "get", nav.identity.instanceId).record.fieldValues;
  const sitePages = nav.sections.map((s) => {
    const o = outputs.find((x) => x.data.entries[0].instanceId === s.instanceId);
    if (!o) fail(`navigation section ${s.instanceId} has no rendered page`);
    const { slug, title, summary } = o.data.entries[0].fields;
    return { page: slug, title, summary };
  });
  const site = { title: identity.title, purpose: identity.statement, pages: sitePages };

  // 5. llms.txt (llmstxt convention): every line comes from the records (the start-here and data
  // containers hold route-step records) or from the page list
  const stepsOf = (title) => {
    const c = srs("container", "list").containers.find((x) => x.title === title);
    if (!c) fail(`container "${title}" not found in source/`);
    return srs("container", "get", c.containerId).container.memberInstanceIds.map((m) => srs("record", "get", m.instanceId).record.fieldValues);
  };
  const line = (r) => `- [${r.title}](${r.target}): ${r.why}`;
  const llms = [
    `# ${site.title}`,
    "",
    `> ${site.purpose}`,
    "",
    "## Start here",
    "",
    ...stepsOf(`${site.title}: start here`).map(line),
    "",
    "## Pages",
    "",
    ...site.pages.map((p) => `- [${p.title}](/agents/${p.page}.md): ${p.summary} ([JSON](/agents/${p.page}.json))`),
    "",
    "## Data",
    "",
    ...stepsOf(`${site.title}: data`).map(line),
    "",
    `<!-- ${MARKER} -->`,
    "",
  ].join("\n");

  // 6. lint everything that ships, before anything is written into the tree
  const problems = [];
  for (const o of outputs) {
    lintPageData(o.data, problems);
    lintMarkdown(o, problems);
  }
  lintText(json(site), "site.json", null, problems);
  lintText(llms, "llms.txt", null, problems);
  lintPackage(problems);
  if (problems.length) fail(`copy rules violated (nothing was written):\n${problems.map((p) => `  ${p}`).join("\n")}`);

  // 6b. the sample repository: it must validate, then it is packed (deterministic) and rendered
  const sample = srsAt(SAMPLE, "repo", "validate");
  if (sample.diagnostics.length) fail(`examples/meeting is not valid:\n${sample.diagnostics.join("\n")}`);
  const [sp] = srsAt(SAMPLE, "repo", "presentation", "list").presentations;
  if (!sp) fail("examples/meeting declares no presentation");
  const sampleContainer = srsAt(SAMPLE, "composition", "get", sp.compositionId).composition.sections[0].source.containerId;
  const sampleRender = (fmt) => {
    const r = srsAt(SAMPLE, "render", "composition", "--view", sp.compositionId, "--container", sampleContainer, "--view-format", fmt);
    if (r.diagnostics.length) fail(`render examples/meeting (${fmt}): ${r.diagnostics.join("; ")}`);
    return r;
  };

  // 7. stage every output
  for (const o of outputs) {
    put(stageAgents, `${o.page}.md`, `<!-- ${MARKER} -->\n${o.md}`);
    put(stageData, `${o.page}.json`, json(o.data));
    put(stageAgents, `${o.page}.json`, json(o.data));
  }
  put(stageData, "site.json", json(site));
  put(STAGE, "llms.txt", llms);
  // raw tool output: written unmodified and exempt from the lint (it is tool truth, not our copy)
  put(stageAgents, INDEX_NAME, srs("repo", "agent-index").rendered);
  srs("archive", "pack", "--output", join(stageAgents, BUNDLE_NAME));
  staged.push(`agents/${BUNDLE_NAME}`);
  put(stageTry, `${SAMPLE_NAME}.md`, sampleRender("markdown").rendered);
  put(stageTry, `${SAMPLE_NAME}.json`, json(sampleRender("json").projection));
  srsAt(SAMPLE, "archive", "pack", "--output", join(stageTry, `${SAMPLE_NAME}.srs`));
  staged.push(`try/${SAMPLE_NAME}.srs`);

  // 8. everything passed: swap into the tree. src/data/README.md is the one hand-written file there.
  swapDir(stageData, DATA_DIR, ["README.md"]);
  swapDir(stageAgents, AGENTS_DIR, []);
  swapDir(stageTry, TRY_DIR, []);
  mkdirSync(dirname(LLMS), { recursive: true });
  renameSync(join(STAGE, "llms.txt"), LLMS);
  for (const f of staged) console.log(`  wrote ${f.startsWith("llms") ? "public/llms.txt" : f.startsWith("data/") ? `src/${f}` : `public/${f}`}`);

  if (CHECK) {
    const dirty = execFileSync("git", ["status", "--porcelain", "--", "source", "examples", "src/data", "public/llms.txt", "public/agents", "public/try"], { cwd: REPO_ROOT, encoding: "utf8" });
    if (dirty) fail(`generated output differs from git:\n${dirty}`);
  }
}

// Replace `target` with `stage` in two renames, restoring the old directory if the second one fails.
// Files named in `keep` (hand-written) are carried over; every other file in `target` is removed.
function swapDir(stage, target, keep) {
  for (const k of keep) if (existsSync(join(target, k))) copyFileSync(join(target, k), join(stage, k));
  const old = join(STAGE, `old-${basename(target)}`);
  mkdirSync(dirname(target), { recursive: true });
  if (existsSync(target)) renameSync(target, old);
  try {
    renameSync(stage, target);
  } catch (err) {
    if (existsSync(old)) renameSync(old, target);
    throw err;
  }
}

// ---- copy lint: the owner's copy rules and never-say list. All patterns are case-insensitive. ----
// `allow` lists the slugs where a rule may legitimately fire (a scope list that says what SRS is not;
// a direction section that says "planned").
const RULES = [
  [/—/i, "em dash"],
  [/\b(?:revolutionary|seamless\w*|unlock\w*|empower\w*|leverag\w*)\b/i, "marketing word"],
  [/\b(?:yin|yang|tao|dao|taiji|taijitu|wuji|daoist|taoist|confucian\w*|cybernetic\w*|autopoie\w*|requisite variety|second-order|harmony of opposites)\b/i, "lineage term"],
  [/\brfc[\s-]?\d+/i, "RFC number"],
  [/(?:^|[\s(])#\d{2,}\b/i, "issue number"],
  [/\b(?:build|revision)[\s.#-]*\d+|dataModelRevision/i, "build or revision number"],
  [/\b\d[\d,]*\s+(?:records?|instances?|tests?|relations?|commits?|issues?)\b/i, "a count"],
  [/\btier[\s-]?1\b|\bthree tiers\b|\btyped\s?records?\b|\bgraduatedAt\b/i, "dead model term"],
  [/\bfederat\w*|\bregistry\b|\bcross-repository\b/i, "federation, registry or cross-repository", ["direction"]],
  [/\bchange\s?log\b|\brevisions?\b|\bfield history\b|\baudit trail\b/i, "changelog, revisions or audit trail"],
  [/\b(?:assertedBy|confidence|validFrom|validUntil|createdBy|valueType|value type)\b/i, "dead field name"],
  [/\bdocument\s?views?\b|\b(?:rendering|document|view)\s+export\b|\bexport\s+(?:format|config|view)\b/i, "dead rendering vocabulary"],
  [/\brootInstanceIds\b|\binstanceIndex\b|\brelations\.json\b|\bhyperedges?\b|\bmembers\[\]/i, "dead structure name"],
  [/\bprecedes\b[^.\n]{0,60}\b(?:layout|presentation(?:al)?)\b/i, "precedes as layout"],
  [/\b(?:stored|persisted)\s+inverse\b/i, "stored inverse relations"],
  [/\b(?:workflow|permission)\s+engine\b|\bknowledge graph\b|\btriple store\b|\buniversal ontology\b|\bcryptographically\b|\bauto-?merg\w*|\b(?:sql|vector)\s+(?:search|database|store)\b|\bsync service\b|\bstorage service\b/i, "over-claim", ["scope"]],
];

function lintText(text, where, slug, problems) {
  for (const [re, name, allow = []] of RULES) {
    if (slug && allow.includes(slug)) continue;
    const m = re.exec(text);
    if (m) problems.push(`${where}: ${name} ("${text.slice(Math.max(0, m.index - 25), m.index + m[0].length + 25).replace(/\s+/g, " ")}")`);
  }
}
// The fields that hold markdown (src/data/README.md). The human site renders them to HTML as trusted
// output, so the markdown itself must be plain: no raw HTML, and links only to http(s) or the site.
const MARKDOWN_FIELDS = new Set(["lede", "body", "explanation"]);
const HTML_TAG = /<\/?[A-Za-z][\w:-]*(?:\s[^>]*)?\/?>|<!--|<![A-Za-z]|<\?/g;
const LINK_TARGETS = [/\]\(\s*<?([^)\s>]+)/g, /^\s{0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s|$)/gm, /<([A-Za-z][A-Za-z0-9+.-]*:[^>\s]*)>/g];
// Code is shown, not interpreted, so a tag or a URL inside a fence or a code span is fine.
const withoutCode = (md) => md.replace(/^( {0,3})(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n\1\2[`~]*[ \t]*(?=\n|$)|(?![\s\S]))/gm, (m) => m.replace(/[^\n]/g, " ")).replace(/(`+)[^`]*?\1/g, (m) => m.replace(/[^\n]/g, " "));
function lintMarkdownField(md, where, problems) {
  const text = withoutCode(md);
  for (const tag of text.matchAll(HTML_TAG)) problems.push(`${where}: raw HTML in markdown ("${tag[0].slice(0, 40)}")`);
  for (const re of LINK_TARGETS)
    for (const m of text.matchAll(re)) {
      const scheme = /^([A-Za-z][A-Za-z0-9+.-]*):/.exec(m[1])?.[1];
      if (scheme && !/^https?$/i.test(scheme)) problems.push(`${where}: link scheme "${scheme}:" in markdown (only http, https or a relative link: "${m[1].slice(0, 40)}")`);
    }
}
function lintPageData(data, problems) {
  for (const e of data.entries) {
    for (const [field, value] of Object.entries(e.fields)) {
      if (typeof value !== "string") continue;
      const where = `page ${data.page}, slug ${e.slug}, field ${field}`;
      lintText(value, where, e.slug, problems);
      if (MARKDOWN_FIELDS.has(field)) lintMarkdownField(value, where, problems);
    }
    for (const r of e.relations ?? []) lintText(r.label ?? "", `page ${data.page}, slug ${e.slug}, relation label`, e.slug, problems);
  }
}
// The markdown is split on its record headings so a finding can name the slug it came from.
function lintMarkdown({ page, md, data }, problems) {
  const byHeading = new Map(data.entries.map((e) => [e.fields.title ?? e.fields.name, e.slug]));
  for (const chunk of md.split(/^### /m)) {
    const slug = byHeading.get(chunk.split("\n", 1)[0].trim()) ?? null;
    lintText(chunk, `agent markdown ${page}.md, slug ${slug ?? "(page heading)"}`, slug, problems);
  }
}
// Definitions in this repository's own namespace, read through the CLI. aiGuidance is read by agents,
// so it follows the same rules as the copy.
function lintPackage(problems) {
  for (const [kind, list] of [["field", "fields"], ["type", "types"], ["view", "views"], ["composition", "compositions"]]) {
    for (const d of srs(kind, "list")[list].filter((x) => x.namespace === "com.semanticops.site")) {
      const def = srs(kind, "get", d.id)[kind];
      lintText(JSON.stringify({ description: def.description, aiGuidance: def.aiGuidance }), `package ${kind} ${def.name} (description or aiGuidance)`, null, problems);
    }
  }
}

build();
