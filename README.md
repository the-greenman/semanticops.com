# semanticops.com

The SemanticOps website: a human site and an agent site, projected from one SRS repository.

SRS (Semantic Record System, pronounced "source") builds portable semantic documents that both humans and AI can understand and use. This site explains the kind of technology it is and where it is going.

## Status

Phase 1: the design system and the living styleguide. Open `/styleguide` for every token, component, diagram and mark. The front page is a holding page built from the same components. Real pages arrive in Phase 2, assembled only from components.

## Develop

```bash
npm install
npm run dev         # http://localhost:4321 ; the styleguide is at /styleguide
npm run check       # token guard and copy guard
npm run typecheck   # astro check
npm run build       # static site into dist/
```

`npm run build` is `astro build` only: any static host can serve `dist/`, and no `srs` binary is needed to build.

## How it fits together

- **Tokens and components** live in `src/styles/` and `src/components/`. Three token tiers (primitives, semantic, component), light and dark, every component inside `@layer components`. Diagrams are composed from a small set of primitives. See `CLAUDE.md` for the rules.
- **Two surfaces, one source.** Facts live in `source/` as an SRS repository. `npm run source` projects them into JSON for the human pages (`src/data/`) and into the agent site (`public/llms.txt`, `public/agents/`). Those outputs are committed and never edited by hand.
- **Hosting.** Static output. `wrangler.jsonc` describes an assets-only Cloudflare deployment to `semanticops.com`, performed by Cloudflare Workers Builds, not by hand.

## Credit

SemanticOps is a project of [the-organization.com](https://the-organization.com).
