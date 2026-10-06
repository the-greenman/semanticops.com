/**
 * The data contract, typed, and the loader. Generated JSON in `src/data/` is the only source
 * of facts (see src/data/README.md). This module is presentation plumbing: it never reorders
 * or filters entries to change the order, and it holds no copy.
 */
import siteFile from "../data/site.json";

// ---- the contract ------------------------------------------------------------------

export interface RelationTarget {
  instanceId: string;
  /** Present when the target is rendered on some page, so it can be linked. */
  slug?: string;
  label: string;
}

export interface Relation {
  type: string;
  direction: string;
  /** "Depends on": the reading of the relation type, from the data. */
  label: string;
  targets: RelationTarget[];
}

interface Base<T extends string, F> {
  instanceId: string;
  type: T;
  slug: string;
  fields: F;
  relations?: Relation[];
}

export type PageRecord = Base<"page", { slug: string; title: string; summary: string }>;
export type SectionRecord = Base<"section", { slug: string; title: string; eyebrow?: string; lede: string; body?: string }>;
export type ConceptRecord = Base<"concept", { slug: string; title: string; summary: string; body: string; example?: string; spec_link?: string }>;
export type ProjectRecord = Base<
  "project",
  { slug: string; name: string; kind: string; tagline: string; summary: string; audience: string; makes_possible: string; repository: string; licence: string }
>;
export type PrincipleRecord = Base<
  "principle",
  { slug: string; title: string; claim: string; explanation: string; pole_a?: string; pole_b?: string }
>;

export type PatternRecord = Base<"pattern", { slug: string; title: string; pattern: string; symptoms: string; mechanism: string; case?: string }>;

export type TryOptionRecord = Base<"try-option", { slug: string; title: string; line: string; action_label: string; action_url?: string; command?: string }>;

export type Entry = SectionRecord | ConceptRecord | ProjectRecord | PrincipleRecord | PatternRecord | TryOptionRecord;
export type EntryType = Entry["type"];

interface PageFile {
  page: string;
  title: string;
  entries: [PageRecord, ...Entry[]];
}

export interface SiteFile {
  title: string;
  purpose: string;
  pages: { page: string; title: string; summary: string }[];
}

// ---- loading -------------------------------------------------------------------------

const files = import.meta.glob("../data/*.json", { eager: true, import: "default" }) as Record<string, unknown>;
const pageFiles = new Map<string, PageFile>();
for (const [path, data] of Object.entries(files)) {
  const key = path.match(/\/([^/]+)\.json$/)?.[1];
  if (key && key !== "site") pageFiles.set(key, data as PageFile);
}

export const site = siteFile as SiteFile;

export interface Page {
  /** The page key: `home`, `model`, and so on. Also the route. */
  key: string;
  /** The route path: `/` for home, `/model` for the rest. */
  href: string;
  /** The page's own record: `fields.title` is the display title, `fields.summary` the meta description. */
  record: PageRecord;
  title: string;
  summary: string;
  /** The content, in render order. */
  entries: Entry[];
}

const homeKey = "home";
const routeOf = (key: string) => (key === homeKey ? "/" : `/${key}`);

function load(key: string): Page {
  const file = pageFiles.get(key);
  if (!file) throw new Error(`site.json lists page "${key}" but src/data/${key}.json is missing: run npm run source`);
  const [record, ...entries] = file.entries;
  return { key, href: routeOf(key), record, title: record.fields.title, summary: record.fields.summary, entries };
}

/** Every page, in navigation order. */
export const pages: Page[] = site.pages.map((p) => load(p.page));
/** A page by key, or undefined: for lookups that must tolerate a key that is not a page (the styleguide's demo). */
export const findPage = (key: string): Page | undefined => pages.find((p) => p.key === key);
/** A page by key. A key that is not in site.json is a mistake in the presentation map, so it stops the build. */
export const getPage = (key: string): Page => {
  const page = findPage(key);
  if (!page) throw new Error(`"${key}" is not a page in site.json`);
  return page;
};
export const homePage = getPage(homeKey);

/** The pages that have a route of their own, in navigation order: what `[page].astro` generates. */
export const contentPages = pages.filter((p) => p.key !== homeKey);

/** Header nav: the brand is the link home, so the nav lists the other pages. */
const navItem = (p: Page) => ({ href: p.href, label: site.pages.find((s) => s.page === p.key)?.title ?? p.title });
export const headerNav = contentPages.map(navItem);
/** Footer nav: every page. */
export const footerNav = pages.map(navItem);

/** The repositories, from the project records (deduplicated: a project can sit on several pages). */
export const repositories = [
  ...new Map(
    pages
      .flatMap((p) => p.entries)
      .filter((e): e is ProjectRecord => e.type === "project")
      .map((e) => [e.instanceId, { name: e.fields.name, href: e.fields.repository }] as const),
  ).values(),
];

// ---- links ---------------------------------------------------------------------------

/**
 * Where a slug lives. A record can sit on several pages (the projects and three principles are
 * on home and on their own page): the owning page is the first non-home page that renders it.
 */
const owner = new Map<string, string>();
for (const p of [...contentPages, homePage]) for (const e of p.entries) if (!owner.has(e.slug)) owner.set(e.slug, p.key);

/** A link to a slug from a page: an in-page anchor when this page renders it, else its owning page. */
export function linkTo(slug: string, from: string): string | undefined {
  const where = owner.get(slug);
  if (!where) return undefined;
  if (findPage(from)?.entries.some((e) => e.slug === slug)) return `#${slug}`;
  return `${routeOf(where)}#${slug}`;
}

/** The agent edition of a page: the same records as data. */
export const agentEdition = (key: string) => ({ md: `/agents/${key}.md`, json: `/agents/${key}.json` });

/** The agent entry point and the whole-repository archive: files the pipeline writes. */
export const agentEntry = "/llms.txt";

/** A URL as shown in text: no scheme, no trailing slash. */
export const displayUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** A concept record by slug, wherever it is rendered: the cards of a glance show it by reference. */
export function findConcept(slug: string): ConceptRecord | undefined {
  for (const p of pages) for (const e of p.entries) if (e.type === "concept" && e.slug === slug) return e;
  return undefined;
}

/** The page that owns a slug (see `owner`): where a reader is sent to read about it. */
export const pageOf = (slug: string): Page | undefined => {
  const key = owner.get(slug);
  return key ? findPage(key) : undefined;
};
