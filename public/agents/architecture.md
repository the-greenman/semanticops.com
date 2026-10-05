<!-- generated from source/ by scripts/source/build-source.mjs; do not edit -->
# SemanticOps: architecture

### Architecture

How SRS is layered: a standard independent of any implementation, one core consumed identically by every client, and tool-enforced contracts for agents.


### Layers that each stand alone

Meaning, expression and operation are separate planes, and each layer works without the layers above it.

SRS is built so that the standard, the engine and the clients can each be replaced without rewriting the others. This page explains the layering, how agents use it, and why a tool is a safer door than a file.


### Spec independence

The standard stays valid with no implementation present.

The specification is data and schemas, not code. It remains valid without any Rust or JavaScript present, and the reference engine consumes it as an external repository instead of embedding it.

If every implementation disappeared, the standard would still say what a conforming repository is, and anyone could write another engine against it.

**Definition**: https://github.com/the-greenman/srs


### Self-hosting

The specification is itself an SRS repository.

The content of the specification lives as Records with their own Types. The rendered specification is a Projection of those records: derived, never authoritative. The standard is held to its own rules, because a standard that cannot describe itself is not ready to describe anything else.

This site follows the same pattern. Its facts are records in a repository, and every page is a projection of them.

**Definition**: https://github.com/the-greenman/srs


### Capability layering

Implemented once, consumed identically.

A capability is implemented once, in the core, and consumed identically by every client. Clients add presentation, never semantics. From the inside out: the core holds types and validation and does no I/O. One repository service wraps it. Adapters expose that service: a CLI with a stable JSON envelope, WebAssembly bindings and an MCP server. Clients such as a browser editor and a VS Code extension sit on the adapters.

The test: if two clients could ever disagree about the answer, the logic is in the wrong place.

**Example (JSON)**: {
  "ok": true,
  "command": "repo validate",
  "payload": {
    "diagnostics": []
  }
}

**Definition**: https://github.com/the-greenman/srs-rust

**Depends on**: Spec independence


### Three planes

Meaning, expression and operation.

**Meaning** is what things are: the substrate, then definitions, then instances. **Expression** is how meaning becomes something to read: selection, then composition, then presentation, then projection. **Operation** is how people and agents act on it: the core service, then adapters, then clients.

Each layer works without the layers above it. Meaning is complete without any expression, and expression is complete without any client. Meaning and expression are held apart on purpose: the same meaning can take many expressions, and no expression changes the meaning. That separation is what lets one source serve two readers.


### Agents and MCP

The same tools for a person's client and for an agent.

`srs mcp serve` runs an MCP server over a repository. Its tools include `find`, `read`, `record_create`, `record_update`, `record_transition`, `relation_create`, `note_create`, `note_graduate`, container edits and `repo_validate`. Its resources include a repository map, the navigation and an agent index: a one-page orientation that tells a cold agent what is here.

The same tools run in the browser over WebAssembly, so an agent in the editor and an agent on the command line meet one contract. `find` and `similar` are lexical: they match words, not embeddings.

**Example (JSON)**: {
  "name": "find",
  "arguments": {
    "typeName": "concept",
    "contentMatch": "relation",
    "limit": 5
  }
}

**Definition**: https://github.com/the-greenman/srs-rust

**Depends on**: Capability layering


### Tools over mimicry

Tool-enforced contracts beat look-alike files.

Agents imitate structure. Asked to add a record, an agent will readily write a JSON file that looks right, satisfies the format and skips validation and referential integrity. That is mimicry.

The defence is to make the tool the only door. A write goes through a tool that enforces the repository's Type and relation contracts, and a rejected write returns diagnostics and writes nothing. For example, a write tool refuses a relation whose type the package does not define, and says why.

**Example (JSON)**: {
  "content": [
    {
      "type": "text",
      "text": "relation validation failed for relation fb01853f-0177-46c2-9fb3-4feb6ea244b1: E1UnknownRelationType: E1: relation type 'owns' is not installed in the package"
    }
  ],
  "isError": true
}

**Definition**: https://github.com/the-greenman/srs-rust

**Depends on**: Agents and MCP


### Travelling forms

One repository, three portable forms.

A repository on disk is a folder, and it can travel in three forms. `.srs` is the default interchange: a deterministic zip of the folder, byte-identical when packed again. `.srsj` is a single JSON file. `.srspkg` carries a Package: definitions only, never records.

Portability over possession: a capability that exists only in place is captivity. If a repository can only be used inside the tool that made it, the tool owns the knowledge. This site publishes its own source as [/agents/semanticops.srs](/agents/semanticops.srs).

**Definition**: https://github.com/the-greenman/srs


