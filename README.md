# semanticops.com

The SemanticOps website: a human site and an agent site, projected from one SRS repository.

SRS (pronounced "source") is an open standard for portable semantic documents that people and AI can both understand and use. This site explains the kind of technology it is and where it is going.

## Status

The site is live at [semanticops.com](https://semanticops.com): five pages (home, model, architecture, principles, projects), assembled from the styleguide components and the generated data. The agent site is at [`/llms.txt`](https://semanticops.com/llms.txt), the entry point for agents. [srs.semanticops.com](https://srs.semanticops.com) is a separate site: the specification and schema host, with its own content and its own repository ([srs](https://github.com/the-greenman/srs)), which this repo never touches.

`/styleguide` stays the contract for every token, component and diagram. A page added in `source/` becomes a route and a nav entry; how a record looks is one line in `src/lib/presentation.ts`.

## The SemanticOps projects

| Project | Kind | In one line |
|---|---|---|
| [srs](https://github.com/the-greenman/srs) | Open standard | The specification, authored as its own data. |
| [srs-rust](https://github.com/the-greenman/srs-rust) | Reference engine | One core behind a CLI, WebAssembly bindings and an MCP server. |
| [srs-web](https://github.com/the-greenman/srs-web) | Browser editor | Edit SRS repositories entirely client-side, on storage you own. |
| [srs-vscode](https://github.com/the-greenman/srs-vscode) | VS Code extension | Repositories in your workspace, with views for navigating them. |

muDemocracy is the first consumer of SRS, covering decision practice. This site presents each project at [semanticops.com/projects](https://semanticops.com/projects/).

## Develop

```bash
npm install
npm run dev         # http://localhost:4321 ; the styleguide is at /styleguide
npm run check       # token guard and copy guard
npm run typecheck   # astro check
npm run build       # static site into dist/
npm run check:links # after a build: every internal link and #anchor resolves
```

`npm run build` is `astro build` only: any static host can serve `dist/`, and no `srs` binary is needed to build.

## How it fits together

- **Tokens and components** live in `src/styles/` and `src/components/`. Three token tiers (primitives, semantic, component), light and dark, every component inside `@layer components`. Diagrams are composed from a small set of primitives. See `CLAUDE.md` for the rules.
- **Two surfaces, one source.** Facts live in `source/` as an SRS repository. `npm run source` projects them into JSON for the human pages (`src/data/`) and into the agent site (`public/llms.txt`, `public/agents/`). Those outputs are committed and never edited by hand.
- **Pages.** `src/pages/[page].astro` generates a route for every page in `src/data/site.json`; `src/lib/presentation.ts` pairs each record's slug with its look (band surface, diagram, glyph); `src/components/page/` turns the entries into bands. Nothing factual is written in a component.
- **Hosting.** Static output. `wrangler.jsonc` describes an assets-only Cloudflare deployment to `semanticops.com`, performed by Cloudflare Workers Builds, not by hand.

## Credit

SemanticOps is a project of [the-organization.com](https://the-organization.com).
