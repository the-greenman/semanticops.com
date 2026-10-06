# source/: the SemanticOps site as an SRS repository

The facts of the website live here, once, as records. The build projects them two ways: JSON for the human pages (`src/data/`) and data for agents (`public/llms.txt`, `public/agents/`). Nothing factual lives in a script, a template or a component. To change what the site says, change a record.

SRS is pronounced "source", and this is the pun in practice: these records are the source, and every page is a projection.

## What is in it

- Namespace `com.semanticops.site`. Root container (the repository identity and navigation): the purpose record, then the six pages in navigation order (home, model, patterns, architecture, principles, projects).
- Seven Types in `package/types/`: `page`, `section`, `concept`, `project`, `principle`, `pattern` (a generic situation, its symptoms, the SRS mechanism and a small invented case) and `route-step` (one line of `llms.txt`). Every Field in `package/fields/` carries `aiGuidance`: read it before writing a record, it holds the copy rules.
- One Container per page (`home`, `model`, `patterns`, `architecture`, `principles`, `projects`), anchored on that page's `page` record. A container's ordered outline is the page order. A record can sit in several containers (the four projects appear on home and on the projects page).
- One Composition per page in `package/compositions/`, declared as a presentation in `manifest.json` with a repository-relative output path (`projections/<page>.md`; nothing is written there, the pipeline places the output in `public/agents/`, so the repository packs into a self-contained `.srs`). One View per Type in `package/views/` controls how a record reads as markdown.
- Two more Containers, `start-here` and `data`, hold `route-step` records and no page. Their order is the order of the `## Start here` and `## Data` sections of `llms.txt`, so nothing factual is left in the script.
- Relations are only the true canonical ones: `depends-on` between concepts and between projects.

## The sample repository

`examples/meeting/` (outside `source/`) is a real SRS repository in its own namespace, `com.example.meeting`, built only with the CLI: a meeting Note, a `decision` Record graduated from it (`derived-from`), two `task` Records that `depends-on` the decision, and a Container, View and Composition that render a decision document. The invented case is deliberately ordinary; copy that mentions it must stay generic and never name real projects. The Model page's concept examples are real JSON trimmed from its files, set through `srs record update`, so regenerate them if the sample changes. `npm run source` validates it and writes `public/try/meeting.srs` (a deterministic pack that srs-web opens from this device), `meeting.md` (the people view) and `meeting.json`. Change it only with the CLI, then run `npm run source`.

## Rules

1. **Use the tools, never hand-edit JSON.** Do not create, copy or edit files under `records/`, `relations/`, `package/` or `manifest.json` by hand. A file you drop is a member that takes part in nothing and skips validation. Use the `srs` CLI or an MCP server; both enforce the Type and relation contracts and return diagnostics.
2. **Copy rules.** No em dashes, sentence-case headings, plain concrete technical prose, no marketing words. Nothing that the brief lists as dead or over-claimed (issue, RFC, revision or build numbers; counts; dead vocabulary). `npm run source` fails on a few of these automatically.
3. **Do not relate page members with `contains`.** The current renderer silently drops a container member that is the target of a `contains` edge from another member of the same container. Express layout with the container outline, never with relations.
4. **A slug is a key.** The human site picks components and diagrams by `slug`. Keep slugs short, kebab-case, unique across the whole repository, and never rename a published one.

## Editing with the CLI

The binary is pinned and vendored by the build into `.bin/srs` (never use a `srs` from `PATH`). From the repository root:

```bash
node scripts/source/ensure-srs-cli.mjs                 # fetch the pinned binary if missing
S=.bin/srs; R=source

$S repo map --repo $R --pretty                         # orient
$S type list --repo $R --pretty                        # the seven Types
$S container list --repo $R --pretty                   # the page containers, by title
$S record list --repo $R --type com.semanticops.site/concept --pretty
$S type schema --repo $R <typeId> --pretty             # field keys and aiGuidance before writing

# change a record (send the COMPLETE fieldValues; an omitted key is removed)
$S record get --repo $R <instanceId> --pretty
$S record update --repo $R <instanceId> <<'JSON'
{ "fieldValues": { "slug": "field", "title": "Field", "summary": "...", "body": "..." } }
JSON

# add a record, then place it on a page
$S record create --repo $R --type com.semanticops.site/concept <<'JSON'
{ "fieldValues": { "slug": "new-idea", "title": "New idea", "summary": "...", "body": "..." } }
JSON
$S container members add --repo $R <pageContainerId> <instanceId> --position 4   # order is data
$S container members move --repo $R <pageContainerId> <instanceId> --position 2

$S relation create --repo $R <<'JSON'
{ "relationType": "depends-on", "sourceInstanceId": "<dependent>", "targetInstanceId": "<needed>" }
JSON

$S repo validate --repo $R --pretty                    # always: read payload.diagnostics, not the exit code
```

## Editing with an MCP server

`srs mcp serve` exposes the same operations as validated tools (`find`, `read`, `record_create`, `record_update`, `relation_create`, `container_member_add`, `container_member_move`, `repo_validate`, `type_schema`) and resources (`srs://<repoId>/map`, `/navigation`, `/agent-index`, `/record/{id}`, `/container/{id}`).

```bash
.bin/srs --repo source mcp serve      # stdio MCP server over this repository
```

Mount it in your client's MCP configuration with that command. Read `/agent-index` first, `type_schema` before creating a record of a Type, and finish with `repo_validate`.

## Regenerating the site data

```bash
npm run source
```

This validates `source/` (any diagnostic fails the build), renders every page, and rewrites `src/data/`, `public/llms.txt`, `public/agents/` and `public/try/` (including the `.srs` bundle of this repository and the unmodified `srs repo agent-index` output as `agent-index.md`). Everything is rendered and linted in a staging directory first and swapped in only if it all passes. The lint covers the copy rules and the never-say list, over the page JSON, the markdown, `llms.txt` and the `aiGuidance` of this repository's definitions; `agent-index.md` is raw tool output and is exempt. The output is committed. A clean re-run produces no diff; `node scripts/source/build-source.mjs --check` exits non-zero if the committed output is stale.

The contract the pages consume is in `src/data/README.md`.
