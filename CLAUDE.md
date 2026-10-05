# CLAUDE.md

Rules for any agent working in this repository. `AGENTS.md` points here; it never restates it.

## What this is

The SemanticOps website: it explains SRS (Semantic Record System, pronounced "source") and its ecosystem to technical professionals. It is **two sites from one source**:

- the **human site**, free to be visual and creative (Astro pages built from components);
- the **agent site**, presented as data (`/llms.txt`, `/agents/*.md`, `/agents/*.json`, a `.srs` bundle).

Facts live **once**, as an SRS repository in `source/`. Records are the source of truth; both sites are projections of them. Never water the human site down for crawlers, and never make agents scrape it.

## Layout

```
src/styles/        tokens.css, tokens-components.css, base.css, utilities.css, diagram.css, index.css
src/components/    one component per file; diagram/ holds the primitives and the six diagrams
src/components/styleguide/   specimen helpers used only by /styleguide
src/layouts/Base.astro       page shell
src/pages/         index, 404, styleguide
scripts/           check-tokens.mjs, check-copy.mjs, lib/tokens.mjs (the token parser)
plans/             one page per phase
source/            the SRS repository of facts          (content pipeline owns it)
scripts/source/    the projection scripts               (content pipeline owns it)
src/data/          JSON projected for the human pages   (generated: never hand-edit)
public/llms.txt, public/agents/    the agent site        (generated: never hand-edit)
```

## The rules

### 1. Styleguide first

`/styleguide` is the contract. Build or change a component there first, with its specimen and a one or two sentence usage note, and **update the specimen in the same change as the component**. A component with no specimen does not exist. The token tables on the styleguide are parsed from the token files at build time; do not hand-write token values into it.

### 2. Pages are assembled only from components

A page contains components and the layout utilities in `utilities.css` (`stack`, `cluster`, `grid`, `split`, `sr-only`). **No page-local styles and no page-local markup styling.** If a page needs something that does not exist, add a component (and its specimen), then use it. Every section opens with `SectionHeader`.

### 3. Tokens only, three tiers, `@layer components`

- Tier 1 **primitives** (`tokens.css`): raw values. Read only inside `tokens.css`, never by a component.
- Tier 2 **semantic** (`tokens.css`): `--color-*`, `--size-*`, `--space-*`, `--radius-*`, `--rule-*`, `--z-*`. Components read these.
- Tier 3 **component** (`tokens-components.css`): `--<block>-<prop>[-<state>]`, declared on `:root, [data-surface]`, each defaulting to a semantic token. A variant re-assigns the token on its own selector.
- No hex, rgb, hsl or named colour, and no `var(--x, fallback)`, outside `tokens.css` (`.css` and `.astro`, SVG attributes included). No literal `font-size`, `font-family`, `font-weight`, `letter-spacing` or `line-height`.
- Every semantic colour is redefined for dark in **both** dark blocks (`prefers-color-scheme` guarded by `:root:not([data-theme="light"])`, and `[data-theme="dark"]`). The second block also matches `[data-surface="ink"]`, so an ink band is the dark scheme applied locally and everything inside re-resolves. The two blocks must stay identical.
- Cascade layers: `tokens, base, layout, components, theme, utilities`. Astro scoped `<style>` blocks are unlayered by default and would beat every layer, so **every component wraps its rules in `@layer components { ... }`**. The layer order statement must stay first in `Base.astro`'s `<head>`: small stylesheets are inlined in document order and the first mention of a layer sets its place (this broke the theme toggle once).
- Colour carries one meaning each (blue structure, vermilion records, green fields, khaki relations, gold notes). Define a new meaning as a semantic token with a dark value and a contrast check; never use hue alone to tell states apart.
- Light and dark must both pass: 3:1 for graphics, 4.5:1 for text. The guard measures them.

### 3a. Diagrams

Every diagram is composed from the primitives in `components/diagram/` (`Disc`, `RingNode`, `BrokenRing`, `Link`, `Target`, `Knockout`, `Halves`, `Cluster`, inside `Figure` and `Canvas`). **A diagram never draws its own circles or lines.** Each draws a wide and a narrow layout switched by the figure's container query, so no text is under 11px on screen. Each has `role="img"`, a `<title>` and a `<desc>`. Labels are props. Motion is CSS only, opt-in per figure (`motion`), and removed under `prefers-reduced-motion`. Containers are broken rings, never closed circles.

### 4. Two surfaces from one source

Facts live in `source/` (an SRS repository). `npm run source` regenerates `src/data/`, `public/llms.txt` and `public/agents/` and needs the `srs` binary. **Never hand-edit `src/data/`, `public/agents/` or `public/llms.txt`.** To change a fact, change a record in `source/` through the SRS tools (the MCP server first, the CLI as fallback; never write look-alike JSON by hand), then run `npm run source`. CI re-runs it and fails on drift. `npm run build` is `astro build` only, so any host can build without the binary.

### 5. Copy rules

- **No em dashes** (nor en dashes), anywhere: copy, captions, alt text, comments. Use full stops, commas, colons or a spaced hyphen.
- Plain, concrete, confident, short. Show the JSON; name the mechanism. No marketing filler ("revolutionary", "seamless", "unlock", "empower", "leverage").
- Headings in sentence case.
- Explain the kind of technology and where it is going, not its current state. No issue numbers, RFC numbers, record or test counts, revision numbers or build numbers.
- **Engage the source, do not adopt the language.** The design is shaped by held pairs (paper and ink, one source and two readers, meaning and expression) and by boundaries that are drawn and redrawn. Express that through geometry and structure. Visible copy never uses "yin", "yang", "Tao", "taiji", "wuji", "harmony of opposites" or cybernetic jargon, and nothing decorative that quotes an Eastern tradition. Code comments may name the lineage.
- Never say (dead or over-claimed): Tier 1, TypedRecord, "three tiers", `graduatedAt`; federation, registry or cross-repository relations as current; changelog, revisions, audit trail; relation `assertedBy`, `confidence`, `status`; `createdBy`; `rootInstanceIds`, `instanceIndex`, `relations.json`, hyperedges; "export" as the rendering word. Never describe SRS as a workflow or permission engine, a storage or sync service, a knowledge graph, a universal ontology, cryptographically signed, or auto-merging. `find` and `similar` are lexical. AI never decides or ratifies. No stability or 1.0 promises.
- Do not lift prose from stale docs (`srs/docs/overview/*`, `srs-rust/skills/SKILL.md`, the root `srs-usage.md`, `srs/docs/research/*`).

### 6. Static build, portable hosting

Astro static output only: no adapter, no SSR, TypeScript strict, no UI framework, zero client JS by default (the theme init and toggle are the only scripts). `dist/` is a plain static site any host can serve. Fonts are self-hosted (IBM Plex Sans and Mono through the Astro Fonts API from `@fontsource`); never add a font CDN.

`wrangler.jsonc` is assets-only (no `main`, no worker code, `not_found_handling: "404-page"`, custom domain `semanticops.com`, `workers_dev: false`). **Deploys are done by Cloudflare Workers Builds on push. Never run `wrangler deploy` and never run `npm run deploy` by hand** (it exists for a deliberate manual override by the owner only). `srs.semanticops.com` is a different site and stays untouched.

## Running the checks

```bash
npm run check       # token guard (scripts/check-tokens.mjs) and copy guard (scripts/check-copy.mjs)
npm run typecheck   # astro check
npm run build       # astro build into dist/
npm run dev         # local server; open /styleguide
```

Run all three before every commit. `node scripts/check-tokens.mjs --verbose` lists every measured contrast pair.

## Process

Plan, implement, self-review the diff (DRY, tokens only, `@layer components`, no em dashes, accessibility), update docs, dogfood: build, check, typecheck, and look at `/styleguide` and `/` at 1440 and 390 wide in light and dark. Work in a fresh worktree, never in the main checkout. Commit in logical steps with a plain, SSH-signed `git commit` (run `bash /home/greenman/dev/semanticops/check-signing.sh` first and expect `KEY_OK`; never bypass signing). Push branches only; the owner reviews the diff, then opens the PR. Default branch is `main`.
