/**
 * From a flat list of entries to bands. A band is a section, a concept, a pattern, or any entry whose look
 * asks for a surface of its own; the entries that follow it, up to the next band, are its items.
 * Order is never changed: this only decides where one band ends and the next begins, and which
 * ground each one sits on.
 */
import type { Entry } from "./content";
import { lookFor, type Look, type Surface } from "./presentation";

export interface Band {
  head: Entry;
  headLook: Look;
  surface: Surface;
  /** The ordinal of a concept band ("01"), counted through the page. Unset for any other band. */
  number?: string;
  /** Consecutive items of one form, each run laid out as a group (a grid of cards, a list of pairs). */
  runs: Run[];
}

export interface Run {
  form: "project" | "principle" | "pair" | "headline";
  items: { entry: Entry; look: Look }[];
}

const formOf = (entry: Entry, look: Look): Run["form"] =>
  entry.type === "project" ? "project" : look.as === "pair" ? "pair" : look.as === "headline" ? "headline" : "principle";

type Ground = "paper" | "page";
const turn = (g: Ground): Ground => (g === "paper" ? "page" : "paper");

/** The ground of the last paper or page band (ink does not count), or paper: every page opens on paper. */
const lastGround = (bands: Band[]): Ground => bands.findLast((b) => b.surface !== "ink")?.surface as Ground | undefined ?? "paper";

/** The ground the next band takes: the other of paper and page, from the last one that was either. */
export const closingSurface = (bands: Band[]): Ground => turn(lastGround(bands));

/** Entries to bands. The page opens on a paper band (the home hero, the page header), so the first band here is page. */
export function toBands(entries: Entry[], page: string): Band[] {
  const bands: Band[] = [];
  let concepts = 0;
  for (const entry of entries) {
    const look = lookFor(page, entry.slug);
    const opens = bands.length === 0 || entry.type === "section" || entry.type === "concept" || entry.type === "pattern" || look.band !== undefined;
    if (opens) {
      const surface: Surface = look.band ?? closingSurface(bands);
      const number = entry.type === "concept" ? String(++concepts).padStart(2, "0") : undefined;
      bands.push({ head: entry, headLook: look, surface, number, runs: [] });
      continue;
    }
    const band = bands[bands.length - 1];
    const form = formOf(entry, look);
    const run = band.runs[band.runs.length - 1];
    if (run && run.form === form) run.items.push({ entry, look });
    else band.runs.push({ form, items: [{ entry, look }] });
  }
  return bands;
}

/** The page's own index: one anchor per band, titled by its head record. */
export const indexOf = (bands: Band[]) =>
  bands.map((b) => ({ href: `#${b.head.slug}`, label: b.head.type === "project" ? b.head.fields.name : b.head.fields.title, number: b.number }));

/** A page is long enough for an index when it has this many bands or more. */
export const INDEX_MIN_BANDS = 4;
