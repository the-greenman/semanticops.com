<!-- generated from source/ by scripts/source/build-source.mjs; do not edit -->
# SemanticOps: home

### Home

SRS is an open standard for portable semantic documents that people and AI can both understand and use. This site is generated from the records of an SRS repository.


### Portable semantic documents for people and AI

SRS builds portable semantic documents that both humans and AI can understand and use.

It is an open standard for knowledge that people and software can inspect, understand, move and continue using without dependence on the system that created it. Informally: a PDF for meaning.

SRS is pronounced "source". The name is the point. Records are the source, and every document you read is a projection of them.


### Knowledge does not travel intact

The hard part is to transfer a complex unit of knowledge, intact, from one mind or system to another. Not a file, not a message, not a row in a database.

A wall of prose can only be interpreted by a human, and only whole. A database row can be queried, but the meaning around it stays behind. The context of a collaboration is usually lost the moment it leaves the room: the decision survives, while the reasons, the objections and the dependencies do not.

Two demands pull against each other. The receiver needs depth of context to understand, and no one, human or AI, can take in everything at once. SRS keeps both. Knowledge is layered and drillable: a meaningful surface that can be entered progressively, deeper on demand.


### Records are the source. Documents are projections.

Records are the source of truth. Rendered documents are projections of those records: derived, never authoritative.

Instead of writing a document and hoping its structure can be recovered later, SRS captures knowledge as small, typed, addressable records with explicit relations between them. A Composition says how records become a document. A Presentation is a repository's declared commitment to render it. The Projection is the file that results, and it can be regenerated at any time.

This site works that way. Every page, and every file in the agent section below, is generated from records in an SRS repository.


### Six constructs, each small

A small set of constructs does all the work.

- **Field**: the smallest unit of meaning, with a stable identity and guidance for AI.
- **Type**: a versioned composition of Fields that says which questions a record must answer.
- **Record**: knowledge bound to a Type. A **Note** is its free-text precursor.
- **Relation**: a typed, binary edge between two records, read as source, type, target.
- **Container**: a declared, ordered selection of records. A boundary means what it holds.
- **Package**: the Fields and Types a repository uses, distributed together.

The [model page](/model) takes each in turn, with real examples.


### Implemented once, consumed the same everywhere

A capability is implemented once, in the core, and consumed identically by every client. Clients add presentation, never semantics.

The core holds types and validation and does no I/O. One repository service wraps it. Adapters expose that service as a command line with a stable JSON contract, as WebAssembly bindings and as an MCP server. Clients, a browser editor and a VS Code extension, add presentation on top.

The test: if two clients could ever disagree about the answer, the logic is in the wrong place. See [architecture](/architecture).


### A standard, an engine and two editors

Four projects share one standard, and each does one job.

Each project is described by the kind of technology it is. The [projects page](/projects) says where each fits.


### srs

**Kind**: Open standard

The specification, authored as its own data.

An open, implementation-independent standard for portable semantic documents. It is authored as an SRS repository: the JSON Schemas, base packages, conformance material and decision charter are all records, and the rendered specification is a projection of them.

**Audience**: Implementers, tool builders and anyone who needs to know exactly what a conforming repository is.

**Makes possible**: A second implementation, in any language, that reads and writes the same repositories as the first.

**Repository**: https://github.com/the-greenman/srs

**Licence**: Apache-2.0


### srs-rust

**Kind**: Reference engine

One core behind a CLI, WebAssembly bindings and an MCP server.

A library-first reference implementation. The core holds types and validation. One repository service sits over it and is exposed as a command line with a stable JSON contract, as WASM bindings and as an MCP server.

**Audience**: Engineers who script, validate or embed SRS, and agents that need a tool-enforced way to write records.

**Makes possible**: Every client gets the same answer, because the logic exists once.

**Repository**: https://github.com/the-greenman/srs-rust

**Licence**: MIT or Apache-2.0

**Depends on**: srs


### srs-web

**Kind**: Browser editor

Edit SRS repositories entirely client-side, on storage you own.

An opinionated browser editor, thin over the WASM core. It works against local files, Dropbox, Google Drive and GitHub, and includes an agents panel.

**Audience**: People who work with structured knowledge and want it to stay theirs.

**Makes possible**: Reading and editing a repository with nothing to install, while the files stay in your own storage.

**Repository**: https://github.com/the-greenman/srs-web

**Licence**: Apache-2.0

**Depends on**: srs-rust


### srs-vscode

**Kind**: VS Code extension

Repositories in your workspace, with views for navigating them.

A thin VS Code extension over the srs binary. Tree and navigator views, validation on save, preview and a relation graph, for engineers who keep repositories in their workspace.

**Audience**: Engineers who keep SRS repositories next to their code.

**Makes possible**: Working on records the way you work on source: in the editor, in git, with validation as you save.

**Repository**: https://github.com/the-greenman/srs-vscode

**Licence**: Apache-2.0

**Depends on**: srs-rust


### Commitments that decide the rest

When two designs both work, these choose between them.

One governing idea and a short list of pairs that SRS refuses to settle. All of them are on the [principles page](/principles).


### The governing core

SRS preserves semantic sovereignty through portable data.

Meaning stays under the control of the people who made it, and moves between tools, implementations and time without captivity or silent loss. Portability alone is not enough: data that travels without a stable identity, its relations or interpretable semantics has lost the meaning it carried.

Three principles follow. The openness of the spec is the mechanism for all three: an open, implementable standard is what makes the data portable and the decisions the group's own.


### Depth without overload

Give the receiver enough context to understand, and never more than they can take in.

Depth of context and freedom from overload pull against each other, and SRS keeps both. Knowledge is layered and drillable: a meaningful surface that can be entered progressively, deeper on demand. In the model, a Container's outline is the surface and the records nested beneath an entry are the depth. Going deeper adds detail. It does not change the story.


### One source, two readers

The same records serve people and agents, each through a surface built for them.

Facts live once, as records, and a Composition projects them for each reader. People read a projection designed for people. Agents read the records as data, through tools or as files, with no scraping. Neither surface is a degraded copy of the other, because neither is the source.


### Agents read this site as data

This site has two surfaces built from one source. People get the pages. Agents get the records.

Every page is projected from an SRS repository, so an agent never needs to scrape HTML. [/llms.txt](/llms.txt) is the entry point. `/agents/<page>.md` and `/agents/<page>.json` carry each page as markdown and as JSON. [/agents/semanticops.srs](/agents/semanticops.srs) is the whole repository as one portable archive that an SRS client or MCP server can open and query.

The same facts reach two readers. Each surface can be designed for its reader because the meaning lives in the records and not in either surface.


### Read it, run it, argue with it

The standard is open and in a formation phase, so the useful contributions are early ones.

The specification, the reference engine, the browser editor and the VS Code extension are public on GitHub. Read the records, run `srs repo validate` on your own folder, and open an issue where the standard is unclear or wrong.

- [srs](https://github.com/the-greenman/srs): the specification
- [srs-rust](https://github.com/the-greenman/srs-rust): the reference engine and CLI
- [srs-web](https://github.com/the-greenman/srs-web): the browser editor
- [srs-vscode](https://github.com/the-greenman/srs-vscode): the VS Code extension


