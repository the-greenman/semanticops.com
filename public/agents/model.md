<!-- generated from source/ by scripts/source/build-source.mjs; do not edit -->
# SemanticOps: model

### Model

The SRS model in order: Field, Type, Package, Note, Record, Relation, Container, repository, validation, rendering and identity, each with a real example.


### Small constructs, stated once

SRS does all its work with a few constructs. Each is a definition you can read, a file you can inspect and a rule a tool can check.

Meaning is defined in Fields and Types, held in Notes and Records, connected by Relations, bounded by Containers and distributed in Packages. What follows is the model in order. Each example is trimmed from the specification, which is itself an SRS repository.


### Field

The atomic, reusable unit of meaning.

A Field has a stable UUID, a namespace, a snake_case name, an integer version and a faceted `fieldType` that says what shape its values take. Its `aiGuidance` travels with the definition instead of living in an application's prompt, so any agent that meets the Field learns how to read and write it.

Field semantics are immutable. A Field means the same thing everywhere it is used, and a Type cannot override it. Different meaning is a different Field.

**Example (JSON)**: {
  "id": "d5e6f7a8-b9c0-4d1e-8f3a-4b5c6d7e8f9a",
  "namespace": "com.semanticops.srs",
  "name": "description",
  "version": 1,
  "description": "A detailed description of the record.",
  "aiGuidance": {
    "purpose": "Descriptions can be multi-paragraph and may include markdown formatting. Explain the what, why, and how."
  },
  "fieldType": {
    "datatype": "string",
    "format": "markdown"
  }
}

**Definition**: https://srs.semanticops.com/schema/2.0/field.json


### Type

A versioned composition of Fields.

A Type lists Fields as assignments: which Field, in what order, and whether it is required. Required Fields are how a Type asks its questions, so a unit of knowledge cannot be transferred half-formed. A display label on an assignment is rendering only and never changes what the Field means.

A Record binds to an exact `typeId` and `typeVersion`. When a Type gains a new version, existing Records are not migrated. You write a successor and link it with `supersedes` or `refines`, and the original stays.

**Example (JSON)**: {
  "id": "3c000001-0000-4000-a000-000000000001",
  "namespace": "com.semanticops.core",
  "name": "purpose",
  "version": 1,
  "fields": [
    {
      "fieldId": "3b000001-0000-4000-a000-000000000001",
      "order": 0,
      "required": true
    },
    {
      "fieldId": "3b000002-0000-4000-a000-000000000002",
      "order": 1,
      "required": false
    }
  ]
}

**Definition**: https://srs.semanticops.com/schema/2.0/type.json

**Depends on**: Field


### Package

Fields and Types, distributed together.

A Package is the set of definitions a repository uses: Fields, Types, Compositions and more, indexed in `package.json`. It travels as a single `.srspkg` bundle, so a definition can move between repositories without being retyped. A Package can declare the packages it requires, by package id and SemVer version.

A Package carries definitions only, never records. The records stay with the repository that holds them.

**Example (JSON)**: {
  "id": "3a000001-0000-4000-a000-000000000001",
  "namespace": "com.semanticops.core",
  "name": "core",
  "version": "1.0.0",
  "fields": [
    "fields/statement-3b000001.json",
    "fields/title-3b000002.json"
  ],
  "types": [
    "types/purpose-3c000001.json"
  ]
}

**Definition**: https://srs.semanticops.com/schema/2.0/package-manifest.json


### Note

Free text with no Type, for capture before structure.

A Note holds named sections of free text and is bound to no Type. It exists so that capture is never blocked by structure: write first, decide later what the knowledge is.

Maturity is a ladder, not a gate. A Note stays a Note for as long as that is useful, and nothing is lost when it becomes something firmer.

**Example (JSON)**: {
  "instanceId": "c0f7c97d-84a9-48a5-bc4d-41d7ee5f8cd9",
  "title": "Human Meaning and AI Collaboration",
  "sections": [
    {
      "name": "purpose",
      "content": "SRS should help humans remember that meaning is their job. AI can assist with extraction, synthesis, critique, comparison, and context assembly, but it cannot become the authority that decides what something means for a community, organization, or domain."
    },
    {
      "name": "human_responsibility",
      "content": "Meaning is not only pattern recognition. It involves responsibility, context, judgment, values, memory, consent, and commitment. A Record may capture negotiated semantic state, but the negotiation is a human and social act. SRS should make that act more legible, not replace it."
    }
  ]
}

**Definition**: https://srs.semanticops.com/schema/2.0/note.json


### Record and graduation

Knowledge bound to a Type, and how a Note becomes one.

A Record is an instance of a Type. `typeId` and `typeVersion` select the Type, and `fieldValues` maps Field names to values. The Record also carries `typeNamespace` and `typeName` as hints. If they disagree with the resolved Type, the `typeId` wins and the Record is invalid.

Graduation turns a Note into one or more Records. Each new Record is linked to its Note by a `derived-from` relation, and the Note is preserved. One meeting note can yield one decision, three tasks and two risks.

**Example (JSON)**: {
  "instanceId": "1f1da0e0-acae-4a66-bac3-30ec1ffd75df",
  "typeId": "2a000004-0000-4000-a000-000000000004",
  "typeVersion": 1,
  "typeNamespace": "com.semanticops.spec",
  "typeName": "concept",
  "fieldValues": {
    "canonical_key": "record:concepts/semantic-sovereignty",
    "title": "Semantic sovereignty"
  }
}

**Definition**: https://srs.semanticops.com/schema/2.0/record.json

**Depends on**: Type


### Relation

A typed, binary edge between two instances.

A Relation is first-class: its own file, its own identity, exactly two endpoints. It reads source, type, target, so `A refines B` is stored once, in that direction, and the inverse is derived and never stored. A Relation is a semantic claim about knowledge, not ownership and not control flow, and it never changes the records it joins.

Seven canonical types ship in the core package: `contains`, `depends-on`, `precedes`, `supersedes`, `refines`, `derived-from` and `evidences`. A custom type is written `namespace/name` and needs its own installed definition. `precedes` means semantic order only, where a different order would be wrong.

**Example (JSON)**: {
  "relationId": "0b02f66a-323c-4cda-be78-366f141c3043",
  "relationType": "refines",
  "sourceInstanceId": "0750c62f-b419-496d-b64c-ab7c8c4f5404",
  "targetInstanceId": "9ee14517-9c12-4d06-b7bb-c5d59684d7f5"
}

**Definition**: https://srs.semanticops.com/schema/2.0/relation.json

**Depends on**: Record and graduation


### Container

A declared, ordered selection of records.

A Container is a boundary drawn around records. Membership is declared, never derived: what is in a container is what its `memberInstanceIds` list says, not whatever is reachable through `contains` edges. The list is an ordered outline of entries, each with an `instanceId` and an optional `depth`, so order is data and nesting follows from depth.

A boundary means what it holds, and boundaries are drawn and redrawn: the same record can sit in many containers. A Container's own id is never the source or target of a Relation.

**Example (JSON)**: {
  "containerId": "6587bc86-9461-43f4-b790-504b2bcbddb5",
  "title": "Semantic Record System Specification",
  "identityInstanceId": "9288ed3d-dba7-4a3a-9fbb-a77ff919816c",
  "memberInstanceIds": [
    {
      "instanceId": "9288ed3d-dba7-4a3a-9fbb-a77ff919816c"
    },
    {
      "instanceId": "69010931-a272-452e-b540-fd89d4551b92"
    },
    {
      "instanceId": "1f57e484-f870-4704-814d-f3f0614c3641"
    }
  ]
}

**Definition**: https://srs.semanticops.com/schema/2.0/container.json

**Depends on**: Record and graduation


### Repository on disk

Plain JSON files in git, one file per record and per relation.

A directory is an SRS repository when it contains a `.srs/` marker. The files are the repository:

```
.srs/             marker
manifest.json     identity, package references, root container
package/          Field, Type and Composition definitions
records/          one JSON file per Note or Record
relations/        one JSON file per Relation
```

The directory tree is authoritative: a file under `records/` is a member. Sovereignty is structural, not aspirational. This is a folder. It diffs in git, opens in any editor and needs no service to read.

Every repository has a root container, named in the manifest, that is its identity and the top of its navigation.

**Example (JSON)**: {
  "namespace": "com.semanticops.srs",
  "repositoryId": "4172fada-bc38-5479-ac18-4be3194a68ca",
  "title": "Semantic Record System Specification",
  "packageRefs": [
    {
      "mode": "local",
      "path": "package/base"
    },
    {
      "mode": "local",
      "path": "package/core"
    }
  ]
}

**Definition**: https://srs.semanticops.com/schema/2.0/manifest.json


### Validation

Diagnostics are data.

Validation checks every file against its schema, every Record against its Type and every reference against the repository. Problems come back as a list of diagnostics: structured data that a tool or an agent can act on. A command that ran exits with code 0 whether or not the data is valid, so read the diagnostics, not the exit code.

Identity conflicts are fatal: a duplicate id, or a reference to an id that does not exist, stops the repository from loading. Informational conflicts resolve to the declared authority, and say so.

**Example (JSON)**: {
  "ok": false,
  "command": "repo validate",
  "version": "0.1.0",
  "diagnostics": [
    "[records/tier-2/page-582af71a.json] missing required field key: eyebrow"
  ]
}

**Definition**: https://github.com/the-greenman/srs

**Depends on**: Type


### The rendering chain

Composition, Presentation, Projection: how records become documents.

Records are never the document. Three steps lead from one to the other. A **Composition** says how records become a document: which records, in what order, through which views. A **Presentation** is a repository's declared commitment to render a Composition to a named output. A **Projection** is the artifact that results.

Themes wrap content and never replace, suppress or reorder it. Order comes from the container's own outline or from a rule, never from a template. A Projection can be deleted and regenerated, because it was never the source.

**Example (JSON)**: {
  "id": "3a000005-0000-4000-a000-000000000005",
  "namespace": "com.semanticops.spec",
  "name": "spec-glossary",
  "version": 1,
  "sections": [
    {
      "sectionId": "concepts",
      "title": "Glossary",
      "order": 0,
      "source": {
        "type": "discovery-query",
        "query": {
          "typeNamespace": "com.semanticops.spec",
          "typeName": "concept"
        }
      },
      "renderViewId": "5c000005-0000-4000-a000-000000000005",
      "ordering": {
        "fieldId": "1a000001-0000-4000-a000-000000000001",
        "direction": "asc"
      }
    }
  ],
  "exportConfig": {
    "format": "markdown"
  }
}

**Definition**: https://srs.semanticops.com/schema/2.0/composition.json

**Depends on**: Container


### Extensions

Opt-in capability modules, declared in the manifest.

Capabilities beyond the core are independent modules named `ext:...`. A repository declares the ones it uses in `declaredExtensions`, so a reader knows what to expect before opening a single record: lifecycle states on records, views and compositions, themes, type inheritance, discovery queries. A tool can compare what is declared with what the content uses and report the difference.

The rule for tools is: understand what you can, preserve what you cannot.

**Example (JSON)**: {
  "declaredExtensions": [
    "ext:lifecycle",
    "ext:repository",
    "ext:themes-l1",
    "ext:views-l1",
    "ext:views-l2"
  ]
}

**Definition**: https://srs.semanticops.com/schema/2.0/manifest.json


### Identity and versioning

UUIDs never change. Versions only increase.

Every Field, Type, Record, Relation and Container has a UUID. It never changes when a definition is copied, imported, exported or renamed. Names are for people. The display form is `namespace/name@version`, for example `com.semanticops.core/purpose@1`.

A version is a positive integer that increments within a UUID lineage. Changing a Field's namespace or name makes a new Field with a new UUID, not a new version. A Record binds to an exact Type version, and a change is an increment, not an edit.

**Example (JSON)**: {
  "instanceId": "9288ed3d-dba7-4a3a-9fbb-a77ff919816c",
  "typeId": "3c000001-0000-4000-a000-000000000001",
  "typeVersion": 1,
  "typeNamespace": "com.semanticops.core",
  "typeName": "purpose"
}

**Definition**: https://github.com/the-greenman/srs

**Depends on**: Field


