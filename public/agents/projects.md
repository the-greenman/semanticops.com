<!-- generated from source/ by scripts/source/build-source.mjs; do not edit -->
# SemanticOps: projects

### Projects

The four SemanticOps projects as kinds of technology: the standard, the reference engine, the browser editor and the VS Code extension.


### A standard, an engine and two editors

SemanticOps is four projects that share one standard.

The standard says what a repository is. The engine implements it once, and the two editors add presentation on top of that engine. All four are public.


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


### μDemocracy

μDemocracy is the first consumer of SRS.

It uses the standard for decision practice, which makes it the first test of whether the model holds up outside the specification. What μDemocracy needs from SRS is what SRS is tested against. Visit [mudemocracy.org](https://mudemocracy.org).


### Where it is going

The direction is more portability, not more platform.

Planned: working offline and reintegrating changes afterwards, a richer semantic diff, and federation between repositories. The standard is in a formation phase, so these will move.


