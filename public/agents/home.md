<!-- generated from source/ by scripts/source/build-source.mjs; do not edit -->
# SemanticOps: home

### Home

SRS is an open standard for portable semantic documents that people and AI can both understand and use. This site is generated from the records of an SRS repository.


### A document for people. A datastore for agents.

SRS is an open format for knowledge. You define the types you need, write records, and link them. People read the result as a document. Agents query it as data. It is plain files: no database, no server, no lock-in.

Informally, a PDF for meaning. Move the folder to another tool, another machine or another decade, and the identity, types, relations and context come with it.

SRS is pronounced "source". The name is the point. Records are the source, and every document you read is a projection of them.


### A meeting becomes a decision and two tasks

One meeting note yields a decision with its reasons and two tasks. The tasks link to the decision, and the decision links back to the note it came from.

The meeting is "Weekly planning, 6 October". From its notes the team captures the decision "Move the weekly standup to Tuesdays", with the reasons "Monday is lost to incident reviews; two people are part-time on Mondays", and two tasks: "Update the calendar invite" and "Tell the support rota".

Each task `depends-on` the decision. The decision is `derived-from` the meeting note, and the note is kept. A person opens the folder and reads a decision document. An agent opens the same folder and queries it like a datastore: find every task that depends on this decision, or every decision derived from this meeting. Nothing is copied between the two. Move the folder to another tool and the types, fields and links come with it.

The types used here (meeting note, decision, task) are not built into SRS. They were defined for this job, and their definitions sit in the same folder as the records.

This is a real SRS repository, and every example on the [model page](/model) is trimmed from it. [Try it yourself](#try-it).


### Define what you need. The definitions travel with the data.

SRS does not ship a fixed schema. You define the types your work needs, when it needs them, and those definitions live in the repository beside the records that use them. Anyone who receives the folder, person or agent, receives the vocabulary needed to read it.

1. **Capture.** Start with notes: loose, untyped, as written.
2. **Define.** When a shape emerges, define a Type for it from reusable Fields: a decision has a statement and reasons; a risk has a likelihood and an owner.
3. **Graduate.** Promote a note into a record bound to a type. The note is kept; the record links back to it.
4. **Relate.** Link records with typed relations: `depends-on`, `derived-from`, `supersedes`.
5. **Read two ways.** Compose records into documents for people. Let agents query the same records directly.
6. **Share the vocabulary.** Bundle Fields and Types as a Package so another group can start from yours, or fork it.

Types are versioned, so the vocabulary can change as the work does without breaking the records written under the old one.


### Knowledge does not travel intact

The hard part is to transfer a complex unit of knowledge, intact, from one mind or system to another. Not a file, not a message, not a row in a database.

Prose leaves structure and relationships to be inferred, by people and agents alike. A database row can be queried, but the meaning around it stays behind. The context of a collaboration is usually lost the moment it leaves the room: the decision survives, while the reasons, the objections and the dependencies do not.

So we keep two copies: a document people can read and a database software can query. They drift apart, and the database usually lives on someone else's infrastructure. SRS keeps one copy, in files you hold, that serves both.

Two demands pull against each other. The receiver needs depth of context to understand, and no one, human or AI, can take in everything at once. SRS keeps both. Knowledge is layered and drillable: a meaningful surface that can be entered progressively, deeper on demand.


### Records are the source. Documents are projections.

Records are the source of truth: the authoritative stored representation. Rendered documents are projections of those records: derived, never authoritative.

Instead of writing a document and hoping its structure can be recovered later, SRS captures knowledge as small, typed, addressable records with explicit relations between them. You decide how records become a document, and the document can be regenerated at any time. Edits go into the records, never into the output.

This site works that way. Every page, and every file in the agent section below, is generated from records in an SRS repository.


### Self-governance needs a record no one else holds

Groups that govern themselves keep their memory in files they own, in types they defined.

Groups that govern themselves (co-ops, collectives, communities, teams) make decisions together. More and more, they make them alongside agents that draft, summarise and act.

If the record of those decisions lives inside a platform, the platform holds the memory, sets the vocabulary and can take both away. SRS keeps the record in plain files the group owns, in types the group defined, readable by every participant, human or not.

Decision sovereignty is the property this protects: the group decides what it decided, why, and what follows from it, and can show it later.

SRS was first built to support [μDemocracy](https://mudemocracy.org), and stands on its own.


### Six constructs, each small

Six small constructs. You use the first two to define your own vocabulary, and the rest to fill and organise it.

- **Field**: the smallest unit of meaning, with a stable identity and guidance for AI.
- **Type**: a versioned composition of Fields that says which questions a record must answer. You define it and it is stored in the repository.
- **Record**: knowledge bound to a Type. A **Note** is its free-text precursor.
- **Relation**: a typed, binary edge between two records, read as source, type, target.
- **Container**: a declared, ordered selection of records. A boundary means what it holds.
- **Package**: the Fields and Types a repository uses, distributed together.

The [model page](/model) takes each in turn, with real examples.


### Implemented once, consumed the same everywhere

A capability is implemented once, in the core, and consumed identically by every client. Clients add presentation, never semantics.

The core holds types and validation and does no I/O. One repository service wraps it. Adapters expose that service as a command line with a stable JSON contract, as WebAssembly bindings and as an MCP server. Clients, a browser editor and a VS Code extension, add presentation on top. There is no server to run and no database to host: the core works directly on the files.

The test: if two clients could ever disagree about the answer, the logic is in the wrong place. See [architecture](/architecture).


### A standard, an engine and two editors

Four projects share one standard, and each does one job.

The [projects page](/projects) says where each fits.


### srs

**Kind**: Open standard

The specification, authored as its own data.

An open, implementation-independent standard for portable semantic documents. The specification is itself an SRS repository: its content (its prose, invariants, extensions and decisions) is authored as records, and the rendered specification is a projection of them. JSON Schemas and conformance fixtures are published alongside as files.

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

One governing idea, and the principles that follow from it. All of them are on the [principles page](/principles).


### The governing core

SRS preserves semantic sovereignty through portable data.

Meaning stays under the control of the people who made it, and moves between tools, implementations and time without captivity or silent loss. Portability alone is not enough: data that travels without a stable identity, its relations or interpretable semantics has lost the meaning it carried.

The principles below follow from it. The openness of the spec is the mechanism for all of them: an open, implementable standard is what makes the data portable and the decisions the group's own.


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


### Open the example, in order of effort

Four ways in, from no install to an agent that keeps its own memory.

The people view of the sample is [meeting.md](/try/meeting.md).


### Open it in your browser

No install and no account: the sample opens in the browser editor, built on srs-web. The files stay on your device.

https://app.semanticops.com/?open=https://semanticops.com/try/meeting.srs


### Run the CLI

Download the [srs release](https://github.com/the-greenman/srs-rust/releases/latest) (other platforms: build from source), unpack the sample, then check it and look around.

srs archive unpack meeting.srs --target meeting
srs repo validate --repo meeting
srs repo map --repo meeting
srs find --repo meeting --text standup


### Point your agent at it

Give your agent /llms.txt to read, or start the MCP server so its writes go through the tools. A first question to ask it: every task that depends on the standup decision.

srs mcp serve --repo meeting


### Give your coding agent a memory

Install a skill that keeps your project's decisions, conventions and known traps in an SRS repository your agent reads and writes. The script writes only into .claude/skills/srs-memory/ in your project and prints the next steps.

curl -fsSLO https://skill.semanticops.com/srs-memory/install.sh
bash install.sh


### Read it, run it, argue with it

The standard is open and in a formation phase, so the useful contributions are early ones.

The specification, the reference engine, the browser editor and the VS Code extension are public on GitHub. Read the records, run `srs repo validate` on your own folder, and open an issue where the standard is unclear or wrong.

- [srs](https://github.com/the-greenman/srs): the specification
- [srs-rust](https://github.com/the-greenman/srs-rust): the reference engine and CLI
- [srs-web](https://github.com/the-greenman/srs-web): the browser editor
- [srs-vscode](https://github.com/the-greenman/srs-vscode): the VS Code extension

Tell us what types you defined: the vocabularies people build are the best evidence of what the standard needs.


