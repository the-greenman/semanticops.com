# Agent Index

**SemanticOps** — The facts of the SemanticOps website, authored once as an SRS repository and projected as JSON for the human site and as data for agents.

Repository ID: `0dbab76e-7f8e-4276-8791-c00a8627965d`

Contents: 66 instances (66 records, 0 notes)

## Types

- `com.semanticops.site/page` v1 (3 fields) — One page of the site: its title and the description used for it.
- `com.semanticops.site/section` v1 (5 fields) — A block of prose with a heading: a hero, an argument, a call to action.
- `com.semanticops.site/concept` v1 (6 fields) — A defined idea of the SRS model or architecture, with a real example.
- `com.semanticops.site/project` v1 (9 fields) — One of the SemanticOps projects, described as a kind of technology.
- `com.semanticops.site/principle` v1 (4 fields) — A principle or design preference of SRS, stated as a claim with its mechanism.
- `com.semanticops.core/purpose` v1 (2 fields) — A Tier-2 typed record capturing the purpose or mission of a repository. Always available in every conforming SRS repository via the implicit core base package (RFC-018). identityInstanceId on the root container MUST reference a record of this type.

## Sections

- **Home** (`e84378a8-016b-4cfc-871c-ca594aa2986b`, type `page`)
- **Model** (`f902a0ee-d308-4711-8b4b-1a722dfeadca`, type `page`)
- **Architecture** (`582af71a-eed6-4a38-a1a0-1a9f048c9710`, type `page`)
- **Principles** (`92d6197a-4325-41fd-b236-bd12997e86c8`, type `page`)
- **Projects** (`de391831-5aac-4610-a23f-b2982489c4d7`, type `page`)
