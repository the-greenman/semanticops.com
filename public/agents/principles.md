<!-- generated from source/ by scripts/source/build-source.mjs; do not edit -->
# SemanticOps: principles

### Principles

The purpose, the governing core, the pairs SRS holds without settling, and the scope test that keeps the standard small.


### Transfer knowledge intact

SRS exists for one reason: to transfer a complex unit of knowledge, intact, from one mind or system to another.

Not a file, not a message, not a row in a database: a unit of knowledge with its meaning attached, It preserves declared meaning and context, giving the receiver a better basis for interpretation. Everything else in the system is in service of that.

Two responsibilities follow. Transfer knowledge in layers, so it can be received without overload. And structure it with shared building blocks, so its meaning can be shared. A Type's required Fields mean a unit of knowledge cannot be transferred half-formed.


### Depth without overload

Give the receiver enough context to understand, and never more than they can take in.

Depth of context and freedom from overload pull against each other, and SRS keeps both. Knowledge is layered and drillable: a meaningful surface that can be entered progressively, deeper on demand. In the model, a Container's outline is the surface and the records nested beneath an entry are the depth. Going deeper adds detail. It does not change the story.


### The governing core

SRS preserves semantic sovereignty through portable data.

Meaning stays under the control of the people who made it, and moves between tools, implementations and time without captivity or silent loss. Portability alone is not enough: data that travels without a stable identity, its relations or interpretable semantics has lost the meaning it carried.

The principles below follow from it. The openness of the spec is the mechanism for all of them: an open, implementable standard is what makes the data portable and the decisions the group's own.


### No engineered control hierarchy

The model must not presume who is in charge, who approves, or how a group is organised. Structure describes knowledge, never authority.

Most collaboration tools quietly encode the structure of the organisation that built them: Conway's law made permanent in software. SRS is designed not to. Its structure comes from the knowledge being shared, not from a chain of command baked into the format. Relations are claims about knowledge, not control flow.


### Data sovereignty

The people who create knowledge own it. It is portable and readable without permission from any central service or vendor.

Sovereignty is structural, not aspirational. A repository is a folder of plain JSON files, and its definitions travel with it. Reading it depends on no service staying in business.


### Decision sovereignty

Groups decide for themselves how they organise, govern, and act on their knowledge. SRS supplies the substrate for those decisions; it does not make them, and it does not lock them in.

SRS records what was decided and why. It never takes the decision, and it carries no roles or approvals that would decide on a group's behalf.


### Pairs we keep

Some principles come as pairs. SRS does not pick a winner. It holds both, and a specific mechanism holds each pair.

Depth without overload, above, is the first. The pairs below are held the same way. None is a slogan to balance by feel: each is held by something concrete in the data model, so you can check it.


### Fixed meaning, changing state

A definition never changes underneath the records that use it, and records still move through states.

Field semantics are immutable and a Record binds to an exact Type version, so what a value means is fixed. State is separate: with the lifecycle extension a Record moves through declared states, such as draft and ratified, without its meaning changing. When meaning must change, the answer is a new version or a successor, never an edit in place.


### One source, two readers

The same records serve people and agents, each through a surface built for them.

Facts live once, as records, and a Composition projects them for each reader. People read a projection designed for people. Agents read the records as data, through tools or as files, with no scraping. Neither surface is a degraded copy of the other, because neither is the source.


### Structure describes, never commands

A Relation says how two pieces of knowledge are connected. It never says who may act.

Relations are semantic claims between instances, not ownership or control flow. A `depends-on` edge blocks nothing, and a `contains` edge does not make a record belong to a container. The model has no roles, approvals or permissions to attach authority to.


### Declared, never derived

Membership is declared, never derived.

What a container holds is what it says it holds, in its own ordered `memberInstanceIds` list. It is not inferred from relations, from a folder, or from a query that could answer differently tomorrow. A boundary means what it holds, and because it is declared it can be drawn again, differently, without touching the records inside.


### People decide, AI assists

AI may observe, extract, propose, question, organise, explain and coach. People decide, agree, ratify and remain accountable.

In the SemanticOps stance, agents propose and people ratify. AI output is a proposal until a person accepts it. SRS gives agents tools to read and write records and does not enforce this as a tool rule: a repository enforces it through its own governance, or a client can apply a session write guard.


### When two designs both work

These preferences choose between designs that both work. Each is stated as this over that.

They are defaults, not laws. Each applies to a specific part of the model, and the explanation names that part.


### Increment over edit

A change is a new version, not an overwrite of the old one.

A Type that changes gets a new version. Records stay bound to the version they were written against, so old data keeps its meaning.


### Identifier over label

Things are known by a stable identifier. A name is only a label.

UUIDs never change when something is copied, imported or exported. A Record's `typeId` decides its Type. The name beside it is a hint, and when the two disagree the identifier wins.


### Successor over overwrite

When a record is replaced, write its successor and keep the original.

A superseded decision is not edited. A new Record is linked to it with `supersedes` or `refines`, so the history of what was believed stays readable.


### Declaration over location

What belongs where is declared, not inferred from position.

A container lists its members. It does not collect whatever happens to sit beside them or hang beneath them through `contains` edges.


### Stated over assumed

Say what a record claims about itself. Do not leave it to be guessed.

An unattributed statement is unattributed: not invalid, and not assumed to come from anyone. Where origin or meaning matters, it is stated in the data.


### One way over many

One mechanism for each goal.

Two ways to do the same thing drift apart. SRS keeps one and removes or migrates the other, so the way in use is also the way that is documented.


### Migration over drift

When the model changes, migrate the data. Do not let it drift.

A change to the standard ships with a migration that carries existing repositories forward. A tool that meets data newer than it understands refuses it instead of silently downgrading it.


### Portability over possession

A capability that exists only in place is captivity.

If the only way to use a feature is inside one tool or one place, the tool owns the knowledge. Every held construct has a form that travels: a repository, a package, a single file.


### Understand what you can, preserve what you cannot

A conforming tool keeps data it does not understand intact.

An extension a tool does not implement, or a field it has never seen, is carried through unchanged and not dropped. Recognition is optional. Preservation is not.


### What is out of scope

The test for any proposed capability: does it help transfer a unit of knowledge with its meaning intact, without encoding who is in charge?

If not, it is out of scope. SRS deliberately does not provide:

- an org chart, roles, or an approval or permission hierarchy
- a workflow or process engine
- a specific application or UI
- a storage engine, database or sync service
- a messaging or transport protocol
- the governance decisions themselves

Those belong to clients, to infrastructure and to the groups that build on SRS. The model stays free of them on purpose.


