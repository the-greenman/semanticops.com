/**
 * The presentation map: the one place that pairs a record's `slug` with how this site shows it.
 * A client's presentation choices live here and nowhere else. The records say what; this says
 * how: which band surface, which diagram, which glyph, which form of a principle. Nothing here is
 * copy, and nothing here changes order.
 *
 * A look is found by slug. `page:slug` overrides it for one page (a record shared by two pages
 * can look different on each). A slug with no look takes the default of its entry type.
 *
 * To show a record differently, add or change one line below. To add a page, add its records in
 * `source/`: it needs no entry here until you want it to look special.
 */
import type { GlyphKind } from "../components/types";
import AgentAnnotates from "../components/diagram/AgentAnnotates.astro";
import CapabilityStack from "../components/diagram/CapabilityStack.astro";
import MaturityLadder from "../components/diagram/MaturityLadder.astro";
import ClaimChain from "../components/diagram/ClaimChain.astro";
import ProjectionFan from "../components/diagram/ProjectionFan.astro";
import RelationSentence from "../components/diagram/RelationSentence.astro";
import RecordsToDocument from "../components/diagram/RecordsToDocument.astro";
import RenameDrift from "../components/diagram/RenameDrift.astro";
import TwoSurfaces from "../components/diagram/TwoSurfaces.astro";
import WorkedExample from "../components/diagram/WorkedExample.astro";

/** The ground of a band: paper, the white page, or an ink band (the dark scheme, locally). */
export type Surface = "paper" | "page" | "ink";

/**
 * The diagrams a look can name, by component name. Every one takes a figure number and a unique id,
 * and nothing else is needed. Entry.astro draws the one a look names.
 */
export const visuals = {
  AgentAnnotates,
  CapabilityStack,
  ClaimChain,
  MaturityLadder,
  ProjectionFan,
  RecordsToDocument,
  RelationSentence,
  RenameDrift,
  TwoSurfaces,
  WorkedExample,
};
export type VisualName = keyof typeof visuals;

export interface Look {
  /** Open a band of this surface. Unset: paper and page take turns, and ink is only ever asked for here. */
  band?: Surface;
  /** A diagram that explains the entry, drawn beneath it, by name. */
  visual?: VisualName;
  /** The glyph of a concept, from the diagram vocabulary. Unset: the neutral part. */
  glyph?: GlyphKind;
  /** Set a section's lede as a large quotation rather than a standfirst. */
  ledeAs?: "quote";
  /** Do not repeat the section body: the cards below carry it. */
  body?: false;
  /** How a section's body is laid out, when it is not plain prose: `options` is the ranked ways to start (TryIt). */
  body_as?: "options";
  /** A section shown as cards of these concepts (by slug), linked to where they are explained. */
  cards?: string[];
  /** A principle: `headline` (a large quotation) or `pair` (two poles joined by a seam). Unset: a numbered item. */
  as?: "headline" | "pair";
  /** The page's opening band, composed by hand rather than by PageBands (home's hero). */
  hero?: boolean;
  /** For a hero: the pages its calls to action lead to, as page keys. The first is the primary action. The labels are the page records' titles. */
  actions?: string[];
}

const looks: Record<string, Look> = {
  // ---- home
  "home:hero": { hero: true, actions: ["model", "architecture"] },
  // The worked example sits in a band of its own, right after the hero.
  "worked-example": { band: "page", visual: "WorkedExample" },
  problem: { ledeAs: "quote" },
  idea: { band: "ink", visual: "ProjectionFan" },
  "model-glance": { cards: ["field", "type", "record", "relation", "container", "package"], body: false },
  "one-core": { visual: "CapabilityStack" },
  "agents-as-data": { band: "ink", visual: "TwoSurfaces" },
  "try-it": { band: "ink", body_as: "options" },

  // ---- patterns: one diagram each. The page and its intro take the defaults of their types.
  "markdown-decays": { visual: "RenameDrift" },
  "claims-with-sources": { visual: "ClaimChain" },
  "agent-annotates": { visual: "AgentAnnotates" },
  "standard-as-records": { visual: "RecordsToDocument" },

  // ---- model: the concepts as chapters, a glyph each where the idea has one in the vocabulary
  field: { glyph: "field" },
  note: { glyph: "note" },
  record: { band: "ink", glyph: "record", visual: "MaturityLadder" },
  relation: { glyph: "relation", visual: "RelationSentence" },
  container: { glyph: "structure" },
  repository: { glyph: "structure" },
  "rendering-chain": { band: "ink", glyph: "derived", visual: "ProjectionFan" },
  "identity-versioning": { glyph: "identity" },

  // ---- architecture
  "spec-independence": { glyph: "structure" },
  "capability-layering": { band: "ink", visual: "CapabilityStack" },
  "tools-over-mimicry": { band: "ink" },

  // ---- principles
  "governing-core": { band: "ink", as: "headline" },
  "fixed-meaning-changing-state": { as: "pair" },
  "one-source-two-readers": { as: "pair", visual: "TwoSurfaces" },
  "structure-describes": { as: "pair" },
  "declared-never-derived": { as: "pair" },
  "human-ai-stance": { as: "pair" },
  scope: { band: "ink", ledeAs: "quote" },

  // ---- projects
  "first-consumer": { band: "ink" },

  // ---- per-page overrides: a record on two pages can look different on each
  // On home the governing core sits inside its band, the pair is a plain item, and the diagram is the agents band's.
  "home:governing-core": { band: undefined },
  "home:one-source-two-readers": { as: undefined, visual: undefined },

  // ---- the styleguide's demonstration of PageBands: a demo slug takes its look from here, like any other
  "styleguide:demo-ink": { band: "ink" },
};

/** The look of a record on a page. */
export const lookFor = (page: string, slug: string): Look => ({ ...looks[slug], ...looks[`${page}:${slug}`] });

/** The map as rows, for the styleguide: what each slug is paired with, read from the map itself so it cannot drift. */
export const lookTable = () =>
  Object.entries(looks).map(([key, l]) => ({
    key,
    band: l.band ?? "",
    visual: l.visual ?? "",
    glyph: l.glyph ?? "",
    form: l.hero ? "hero" : (l.as ?? (l.ledeAs ? "lede as quote" : l.cards ? "cards" : l.body_as ?? "")),
  }));
