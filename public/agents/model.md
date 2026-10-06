<!-- generated from source/ by scripts/source/build-source.mjs; do not edit -->
# SemanticOps: model

### Model

The SRS model in order: Field, Type, Package, Note, Record, Relation, Container, repository, validation, rendering and identity, each with a real example.


### Small constructs, stated once

SRS does all its work with a few constructs. Each is a definition you can read, a file you can inspect and a rule a tool can check.

The worked example on the home page is a real repository, and every example below is trimmed from it. A meeting note graduates into a decision, two tasks depend on the decision, and a container puts them in reading order. The specification uses the same mechanisms: it is itself an SRS repository.

Meaning is defined in Fields and Types, held in Notes and Records, connected by Relations, bounded by Containers and distributed in Packages. What follows is the model in order.


### Field

The atomic, reusable unit of meaning.

A Field has a stable UUID, a namespace, a snake_case name, an integer version and a faceted `fieldType` that says what shape its values take. Its `aiGuidance` travels with the definition instead of living in an application's prompt, so any agent that meets the Field learns how to read and write it.

Field semantics are immutable. A Field means the same thing everywhere it is used, and a Type cannot override it. Different meaning is a different Field.

**Example (JSON)**: {
  "id": "1d1f36c1-73a1-482f-b084-4716a914a231",
  "namespace": "com.example.meeting",
  "name": "statement",
  "version": 1,
  "description": "What was decided.",
  "aiGuidance": {
    "purpose": "One sentence stating the decision in the present tense."
  },
  "fieldType": {
    "datatype": "string",
    "format": "plain"
  }
}

**Definition**: https://srs.semanticops.com/schema/2.0/field.json


### Type

A versioned composition of Fields.

A Type lists Fields as assignments: which Field, in what order, and whether it is required. Required Fields are how a Type asks its questions, so a unit of knowledge cannot be transferred half-formed. A display label on an assignment is rendering only and never changes what the Field means.

A Record binds to an exact `typeId` and `typeVersion`. When a Type gains a new version, existing Records are not migrated. You write a successor and link it with `supersedes` or `refines`, and the original stays.

**Example (JSON)**: {
  "id": "ec2e7ef3-00a5-4a55-8617-a3f1def4cd6a",
  "namespace": "com.example.meeting",
  "name": "decision",
  "version": 1,
  "fields": [
    {
      "fieldId": "db25089d-c5f1-4c4c-88bc-9ffd491d7124",
      "required": true
    },
    {
      "fieldId": "1d1f36c1-73a1-482f-b084-4716a914a231",
      "required": true
    },
    {
      "fieldId": "466f519d-c7d5-4d2d-90db-623346322ca4",
      "required": true
    }
  ],
  "identityFieldId": "db25089d-c5f1-4c4c-88bc-9ffd491d7124"
}

**Definition**: https://srs.semanticops.com/schema/2.0/type.json

**Depends on**: Field


### Package

Fields and Types, distributed together.

A Package is the set of definitions a repository uses: Fields, Types, Compositions and more, indexed in `package.json`. It travels as a single `.srspkg` bundle, so a definition can move between repositories without being retyped. A Package can declare the packages it requires, by package id and SemVer version.

A Package carries definitions only, never records. The records stay with the repository that holds them.

**Example (JSON)**: {
  "id": "f62ac372-70c9-4d2a-9b59-f0e0d3d8c9d9",
  "namespace": "com.example.meeting",
  "name": "primary",
  "version": "1.0.0",
  "fields": [
    "fields/title-db25089d.json",
    "fields/statement-1d1f36c1.json",
    "fields/reasons-466f519d.json",
    "fields/owner-0ebea21d.json"
  ],
  "types": [
    "types/decision-ec2e7ef3.json",
    "types/task-2cd8f150.json"
  ]
}

**Definition**: https://srs.semanticops.com/schema/2.0/package-manifest.json


### Note

Free text with no Type, for capture before structure.

A Note holds named sections of free text and is bound to no Type. It exists so that capture is never blocked by structure: write first, decide later what the knowledge is.

Maturity is a ladder, not a gate. A Note stays a Note for as long as that is useful, and nothing is lost when it becomes something firmer.

**Example (JSON)**: {
  "instanceId": "11111111-1111-4111-8111-111111111111",
  "title": "Weekly planning, 6 October",
  "sections": [
    {
      "name": "body",
      "label": "Notes",
      "content": "Monday is lost to incident reviews, and two people are part-time on Mondays. We agreed to move the weekly standup to Tuesdays. Two follow-ups: update the calendar invite, and tell the support rota."
    }
  ]
}

**Definition**: https://srs.semanticops.com/schema/2.0/note.json


### Record and graduation

Knowledge bound to a Type, and how a Note becomes one.

A Record is an instance of a Type. `typeId` and `typeVersion` select the Type, and `fieldValues` maps Field names to values. The Record also carries `typeNamespace` and `typeName` as hints. If they disagree with the resolved Type, the `typeId` wins and the Record is invalid.

Graduation turns a Note into one or more Records. Each new Record is linked to its Note by a `derived-from` relation, and the Note is preserved. One meeting note can yield one decision, three tasks and two risks.

**Example (JSON)**: {
  "instanceId": "6e37d4fb-440e-4962-8af6-49cddaf63de7",
  "typeId": "ec2e7ef3-00a5-4a55-8617-a3f1def4cd6a",
  "typeVersion": 1,
  "typeNamespace": "com.example.meeting",
  "typeName": "decision",
  "fieldValues": {
    "title": "Move the weekly standup to Tuesdays",
    "statement": "The weekly standup moves from Monday to Tuesday.",
    "reasons": "Monday is lost to incident reviews. Two people are part-time on Mondays."
  }
}

**Definition**: https://srs.semanticops.com/schema/2.0/record.json

**Depends on**: Type


### Relation

A typed, binary edge between two instances.

A Relation is first-class: its own file, its own identity, exactly two endpoints. It reads source, type, target, so `A refines B` is stored once, in that direction, and the inverse is derived and never stored. A Relation is a semantic claim about knowledge, not ownership and not control flow, and it never changes the records it joins.

Seven canonical types ship in the core package: `contains`, `depends-on`, `precedes`, `supersedes`, `refines`, `derived-from` and `evidences`. A custom type is written `namespace/name` and needs its own installed definition. `precedes` means semantic order only, where a different order would be wrong.

**Example (JSON)**: {
  "relationId": "6e23c144-b61c-44de-8964-2a1d8139781e",
  "relationType": "depends-on",
  "sourceInstanceId": "dda4f664-601c-44cb-8c08-c5cd32f5194f",
  "targetInstanceId": "6e37d4fb-440e-4962-8af6-49cddaf63de7"
}

**Definition**: https://srs.semanticops.com/schema/2.0/relation.json

**Depends on**: Record and graduation


### Container

A declared, ordered selection of records.

A Container is a boundary drawn around records. Membership is declared, never derived: what is in a container is what its `memberInstanceIds` list says, not whatever is reachable through `contains` edges. The list is an ordered outline of entries, each with an `instanceId` and an optional `depth`, so order is data and nesting follows from depth.

A boundary means what it holds, and boundaries are drawn and redrawn: the same record can sit in many containers. A Container's own id is never the source or target of a Relation.

**Example (JSON)**: {
  "containerId": "00b74bf1-f776-4ef0-a9b6-6496cac5c04d",
  "title": "Decision document",
  "anchorInstanceId": "6e37d4fb-440e-4962-8af6-49cddaf63de7",
  "memberInstanceIds": [
    {
      "instanceId": "6e37d4fb-440e-4962-8af6-49cddaf63de7"
    },
    {
      "instanceId": "3fc0b3f1-9169-4eac-bb35-6e24d90fbccc",
      "depth": 1
    },
    {
      "instanceId": "dda4f664-601c-44cb-8c08-c5cd32f5194f",
      "depth": 1
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
  "namespace": "com.example.meeting",
  "repositoryId": "000973a1-2f84-485c-8350-8811a3f18c1b",
  "title": "com.example.meeting",
  "container": {
    "containerId": "000973a1-2f84-485c-8350-8811a3f18c1b",
    "title": "com.example.meeting",
    "identityInstanceId": "b3d88ba0-2245-4a7a-bd44-2b3eff8d6b21"
  }
}

**Definition**: https://srs.semanticops.com/schema/2.0/manifest.json


### Validation

Diagnostics are data.

Validation checks every file against its schema, every Record against its Type and every reference against the repository. Problems come back as a list of diagnostics: structured data that a tool or an agent can act on. A command that ran exits with code 0 whether or not the data is valid, so check `ok` and the diagnostics, not the exit code. Success carries `payload.diagnostics` and a summary. Failure carries a top-level `diagnostics` list.

Identity conflicts are fatal: a duplicate id, or a reference to an id that does not exist, stops the repository from loading. Informational conflicts resolve to the declared authority, and say so.

**Example (JSON)**: {
  "ok": true,
  "command": "repo validate",
  "version": "0.1.0",
  "payload": {
    "diagnostics": [],
    "summary": {
      "checked": 5,
      "errors": 0,
      "warnings": 0
    }
  }
}

{
  "ok": false,
  "command": "repo validate",
  "version": "0.1.0",
  "diagnostics": [
    "[records/tier-2/decision-6e37d4fb.json] missing required field key: title"
  ]
}

**Definition**: https://github.com/the-greenman/srs

**Depends on**: Type


### The rendering chain

Composition, Presentation, Projection: how records become documents.

Records are never the document. Three steps lead from one to the other. A **Composition** says how records become a document: which records, in what order, through which views. A **Presentation** is a repository's declared commitment to render a Composition to a named output. A **Projection** is the artifact that results.

Themes wrap content and never replace, suppress or reorder it. Order comes from the container's own outline or from a rule, never from a template. A Projection can be deleted and regenerated, because it was never the source.

**Example (JSON)**: {
  "namespace": "com.example.meeting",
  "name": "decision-document",
  "version": 1,
  "sections": [
    {
      "sectionId": "entries",
      "source": {
        "type": "container-subset",
        "containerId": "00b74bf1-f776-4ef0-a9b6-6496cac5c04d"
      },
      "ordering": {
        "source": "arranged"
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
  "instanceId": "b3d88ba0-2245-4a7a-bd44-2b3eff8d6b21",
  "typeId": "3c000001-0000-4000-a000-000000000001",
  "typeVersion": 1,
  "typeNamespace": "com.semanticops.core",
  "typeName": "purpose"
}

**Definition**: https://github.com/the-greenman/srs

**Depends on**: Field


