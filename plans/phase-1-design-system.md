# Phase 1: design system and living styleguide

Scope: tokens, components, diagrams and `/styleguide`. The content pipeline (`source/`, `src/data/`, `public/agents/`) is a separate unit and is not touched here. Phase 2 assembles real pages from these components after the owner reviews the styleguide.

## Stack

Astro 6, static output, TypeScript strict, no UI framework. `dist/` is a plain static site. `wrangler.jsonc` is assets-only. IBM Plex Sans and Mono are self-hosted from `@fontsource` through the Astro Fonts API (local provider, latin woff2). Zero client JS apart from the theme init and toggle.

## Token tiers (`src/styles/`)

1. **Primitives** (`tokens.css`): muDemocracy v3 paper and ink greys, plus the diagram palette from the the-organization.com family (royal blue, vermilion, green, khaki, pale gold) with lit variants for dark. Never read outside `tokens.css`.
2. **Semantic** (`tokens.css`): `--color-*` (surface, text, line, and the diagram meanings `structure`, `record`, `field`, `relation`, `note`), `--size-*`, `--space-*`, `--radius-*`, `--rule-*`, `--z-*`. Dark redefines every semantic colour under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])` and under `:root[data-theme="dark"]`. The same dark set applies to `[data-surface="ink"]`, so an ink band is "the dark scheme, locally" and everything inside it re-resolves.
3. **Component** (`tokens-components.css`): `--<block>-<prop>[-<state>]` on `:root, [data-surface]` so they re-resolve inside ink surfaces.

Layers: `tokens, base, layout, components, theme, utilities`. Every component `<style>` wraps its rules in `@layer components`.

## Components

Layout: `Base` (layout), `SiteHeader` (popover menu on mobile), `SiteFooter`, `Section` (paper, ink, page; narrow, default, wide), `ThemeToggle`.
Content: `Eyebrow`, `Lede`, `Prose`, `Button` (a or button; primary, secondary, ghost, mono), `Tag` (status by border and fill), `Chip`, `CodeSample` (Shiki `css-variables` mapped to tokens), `Quote`, `Pronunciation`.
Cards: `RecordCard`, `ConceptCard`, `ProjectCard`, `PrincipleItem`, `FeatureGrid`, `Legend`.
Marks: `SrsMark` (line, halves, ring), `SemanticOpsMark` (network, orbit), `Wordmark`.
Diagram primitives (`components/diagram/`): `Figure`, `Disc`, `RingNode`, `BrokenRing`, `Link`, `Target`, `Knockout`, `Halves`, `Glyph`, `Cluster` (recursive composite of the primitives).
Diagrams: `HeroCluster`, `ProjectionFan`, `CapabilityStack`, `MaturityLadder`, `RelationSentence`, `TwoSurfaces`.

## Diagram design (in words)

- Colour carries meaning once: blue structure and boundaries, vermilion records, green fields, khaki relations, pale gold notes, ink for derived output. Knockout gaps (ground-coloured stroke, `paint-order`) separate overlapping shapes. Containers are broken rings, never closed circles.
- Each diagram renders a wide layout (viewBox about 720 wide) and a narrow stacked layout (viewBox 340 wide), switched by a container query on the figure plate at 600px, so text never falls under 11px effective size.
- Motion is CSS only (links draw in, a cluster opens) and is removed under `prefers-reduced-motion`.
- HeroCluster: a repository as a broken ring with six discs, khaki hexagram links and a target centre; one disc opens into a smaller copy of itself, which opens once more.
- ProjectionFan: a cluster of records on the left (the only place edits go), four hollow ink rings on the right (Markdown, HTML, JSON, agent context) joined by fan links.
- CapabilityStack: four ruled rows (core, service, adapters, clients) with links between them.
- MaturityLadder: a dashed pale-gold Note, six vermilion records linked back to it by `derived-from`; the Note stays.
- RelationSentence: seven rows of `source [type] target`, each a disc, a labelled link and a disc.
- TwoSurfaces: a source cluster above two readers drawn as the two halves of one disc, each carrying a seed of the other.

## Checks

- `npm run check`: `scripts/check-tokens.mjs` (no colour literals or colour fallbacks outside `tokens.css`; no literal type values; every semantic colour has both dark redefinitions and the two dark blocks agree; diagram colours meet 3:1 on every ground; every component `<style>` is inside `@layer components`) and `scripts/check-copy.mjs` (no em dashes, no lineage vocabulary in visible copy).
- `npm run typecheck`: `astro check`.
- `npm run build`: `astro build`.
