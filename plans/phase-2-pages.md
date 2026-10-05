# Phase 2: the five pages

Scope: assemble the real pages from the styleguide components and the generated data. No new facts in code: copy comes from `src/data/*.json`, and a change to a fact is a change to a record in `source/` followed by `npm run source`.

## Routes

- `/` is `src/pages/index.astro`: a hand-composed hero (mark, name lockup, HeroCluster) and then the same band assembly as every other page.
- `/model`, `/architecture`, `/principles`, `/projects` are one dynamic route, `src/pages/[page].astro`, with `getStaticPaths` from `site.pages`. A page record added in `source/` becomes a route and a nav entry with no code change.
- `<title>` and meta description come from the page record (`entries[0]`); home takes its title from the hero section.
- Header and footer nav derive from `site.json`; `components/nav.ts` is deleted. The footer's repository links derive from the project records.

## Layers

| File | Job |
|---|---|
| `src/lib/content.ts` | Types the data contract, loads `site.json` and the page files (`import.meta.glob`), builds the slug index for relation links. Never reorders. |
| `src/lib/markdown.ts` | One shared `createMarkdownProcessor` (from `@astrojs/markdown-remark`, already installed); block and inline render. |
| `src/lib/presentation.ts` | **The one place** that pairs a slug with a look: band surface, diagram, glyph, lede-as-quote, principle form. Page-scoped overrides as `page:slug`. |
| `src/components/page/PageBands.astro` | Groups the flat entry list into bands (a section, a concept, or an entry whose look names a band opens one) and picks the surface; paper and page alternate, ink only where the map says so. |
| `src/components/page/Entry.astro` | Renders one entry by type and look, with its `id={slug}`. |

## Presentation map (slug to look)

| Slug | Look |
|---|---|
| `home:hero` | `hero` look: hand-composed on home (SrsMark halves, Pronunciation lockup, HeroCluster); its two buttons lead to the pages named in `actions` (model, architecture), labelled by the page records |
| `problem` | lede as a Quote |
| `idea` | ink band, ProjectionFan |
| `model-glance` | ConceptCards of the six model concepts (linked to `/model#slug`); body not repeated |
| `one-core`, `capability-layering` | CapabilityStack (capability-layering on an ink band) |
| `record` | ink band, MaturityLadder (graduation is where the ladder explains) |
| `relation` | RelationSentence |
| `rendering-chain` | ink band, ProjectionFan |
| `tools-over-mimicry` | ink band (the rejected write is the point) |
| `agents-as-data` | ink band, TwoSurfaces |
| `governing-core` | headline: Quote and explanation; on `/principles` it opens an ink band |
| the five held pairs | PrincipleItem as a pair: the two poles are the `pole_a` and `pole_b` fields of the record |
| `one-source-two-readers` | TwoSurfaces on `/principles` only |
| `scope`, `first-consumer` | ink band; `scope` lede as a Quote |
| projects | ProjectCard grid, relations as links |
| the rest | default by type: section (header, lede, prose), concept (text and example), principle (numbered item) |

Figure numbers count per page, in order. Diagram labels remain the component defaults from Phase 1.

## New components (each with a specimen)

`ConceptEntry` (a concept as a chapter: text beside its JSON), `RelationList` (relation chips), `OnThisPage` (anchor index), `AgentEdition` (the quiet link to a page's data), `PageLinks` (the other pages). Changed: `ProjectCard` (tagline, audience, makes possible, relations, id), `PrincipleItem` (claim, id, level, and the held-pair variant) and `ConceptCard` (id), `SectionHeader` (glyph). The assemblers in `components/page/` have no visual of their own and are documented in the styleguide.

## Records changed

`held-pairs` (principles): the body said "Four more follow" and five pairs follow, so the count is dropped. The `principle` type gained two optional fields, `pole_a` and `pole_b`, developed in place at version 1 (the site package is pre-publication), and the five pair records carry them. All through the pinned srs CLI, then `npm run source`.

## Checks

`npm run source:check`, `npm run check`, `npm run typecheck`, `npm run build`, and `npm run check:links` (walks `dist/**/*.html`: every internal href and `#anchor` resolves). Screenshots of all five pages at 1440 and 390, light and dark; no horizontal scroll at 320 and 390.
