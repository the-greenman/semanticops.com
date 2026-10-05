# Phase 1: content source and agent surface

The site's facts are authored once, as an SRS repository at `source/` (namespace `com.semanticops.site`). A build step projects it two ways: JSON for the human pages and a data surface for agents. Nothing factual lives in a script.

## Content model

Package `com.semanticops.site`, authored with `srs field|type|view|composition create`. Every Field carries `aiGuidance`.

| Type | Fields (identity first) |
|---|---|
| `page` | `title`, `slug`, `summary` (meta description) |
| `section` | `title`, `slug`, `eyebrow`, `lede`, `body` (markdown) |
| `concept` | `title`, `slug`, `summary` (one line), `body`, `example` (display text, JSON), `spec_link` (uri) |
| `project` | `name`, `slug`, `kind`, `tagline`, `summary`, `audience`, `makes_possible`, `repository` (uri), `licence` |
| `principle` | `title`, `slug`, `claim` (one sentence), `explanation` |

`slug` is the stable key the human site uses to pick components and diagrams: short, kebab-case, unique across the repository. `page` is added to the four requested types because each page needs a title and a meta description, and a page record is the anchor that links a page container to the root container's navigation.

Relations are only the true canonical ones, all `depends-on`: between concepts (a Type depends on a Field, a Record on a Type) and between projects (the engine implements the standard, the clients sit on the engine). `contains` is deliberately not used between members of one page: the pinned renderer silently drops a container member that is the target of a `contains` edge from a co-member, so layout stays in the container outline.

## Containers and outline

Root container (`manifest.container`): the identity record (`purpose`, one or two plain sentences), then the five page anchors in navigation order. One container per page, anchored on its `page` record, entries in page order. Records may sit in several containers (the four projects and three principles appear on home and on their own pages).

- home: page, hero, problem, idea, model-glance, one-core, projects-glance, the four projects, principles-glance, governing-core, depth-without-overload, one-source-two-readers, agents-as-data, get-involved
- model: page, model-intro, then twelve concepts (field to identity-versioning)
- architecture: page, architecture-intro, then seven concepts
- principles: page, purpose, depth-without-overload, governing-core, the three charter principles, the held pairs, the human and AI stance, design preferences, scope
- projects: page, projects-intro, srs, srs-rust, srs-web, srs-vscode, first-consumer, direction

## Compositions and presentations

One Composition per page: a single `container-subset` section with `ordering.source: arranged`, so order and depth come from the container. One L1 View per Type controls the markdown (identity as the heading, prose fields unlabelled); the JSON projection carries every field. Each Composition names its page container in its single section (a declared link, not a naming convention) and is declared as a presentation (markdown, `public/agents/<page>.md`); the JSON projection is the same Composition rendered with `--view-format json` (the CLI holds one declared presentation per Composition).

## Pipeline: `npm run source` -> `scripts/source/build-source.mjs`

1. ensure the pinned binary (`v0.1.0-build.470`) in gitignored `.bin/srs`;
2. `srs repo validate`, fail on any error or warning;
3. render each page to JSON, apply a thin presentation transform (name-key lift, relation targets get slugs, volatile keys dropped), write `src/data/<page>.json`; order and membership come from the render output untouched;
4. render each page to markdown at `public/agents/<page>.md`, copy the JSON to `public/agents/<page>.json`;
5. `srs repo agent-index` into `public/llms.txt` under a generated header listing the `/agents/*` files (from the presentations) and the bundle;
6. `srs archive pack` to `public/agents/semanticops.srs` (deterministic);
7. write `src/data/site.json` (identity statement and pages in the root container's navigation order). A small copy lint (em dash, dead vocabulary) fails the build.

Output is committed; a clean re-run produces no diff.

## Output contract

See `src/data/README.md`. In short: `{ page, title, entries: [ { instanceId, type, slug, fields, relations? } ] }`, entries in container order, field keys are Field names.

## Copy rules

Brief copy rules apply: no em dashes, sentence case, nothing from the never-say list, plain words for the Daoist and systems-science lineage (held pairs are named plainly, the lineage itself is never named in copy or aiGuidance). Examples in concept records are trimmed from `srs/srs/`, never from the stale docs.
