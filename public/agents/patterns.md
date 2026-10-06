<!-- generated from source/ by scripts/source/build-source.mjs; do not edit -->
# SemanticOps: patterns

### Patterns

Four ordinary situations where meaning gets lost in prose, and what SRS does about each, mechanism by mechanism.


### Where records beat prose

Each pattern is an ordinary situation, what goes wrong in it, and the mechanism SRS uses.

The cases are small and invented. They are not products and not case studies: each is a situation that any team keeping knowledge in text will recognise. Where a rule is a repository's own governance and not something the tools enforce, the pattern says so.


### A markdown knowledge base decays

A team keeps its knowledge as markdown notes that people and agents both edit. It is kept in order with real discipline: an index note, aliases, a rename protocol, written load instructions for agents and a validator script.

**What goes wrong**: Every one of those rules is prose or convention. Nothing refuses a bad state, so bad states get in.

- A rename leaves links pointing at nothing, including inside the navigation notes themselves.
- A share of notes become orphans that nothing links to.
- Frontmatter keys and `status` words drift between hand-written notes.
- The index note falls behind the folder.
- Nobody can say which note is current.

**What SRS does**:
- **Immutable ids and a title field.** A rename touches one field. Every edge still targets the id.
- **Typed fields.** A record with a missing or wrong key is rejected.
- **Typed relations.** An edge is validated: its target must exist and its type must be installed.
- **Supersession.** "Current" is a query over `supersedes` relations, not a guess.
- **A generated agent index** replaces hand-kept load instructions.

**Case**: Rename "Decision architecture" to "Decision practice". In markdown, nine links keep the old name. In SRS, one field changes and `srs repo validate` stays clean. Delete a target and validation fails, instead of the page rendering an empty link.


### Claims that cite their sources

A team wants its knowledge to be usable: each claim should say where it came from, and a disagreement should be visible instead of buried. They also want AI to help write it without inventing things.

**What goes wrong**:
- A claim in prose has no address, so a source cannot be checked against the sentence it supports.
- A counter-claim sits in another document, or in someone's memory.
- Systems that build chunking, embeddings and retrieval into the knowledge schema weld meaning to infrastructure: change the retrieval and the knowledge model moves with it.

**What SRS does**:
- **A claim is a record.** It is linked to its evidence with `evidences`.
- **Evidence is a record** that names a source and a quotation from it.
- **A counter-claim** is another claim with its own source, linked to the first.
- **Guidance steers AI writing.** Each Field carries `aiGuidance` that says how it is to be written.
- **Retrieval stays outside.** SRS keeps the semantics in the core and leaves retrieval to a companion layer. `find` is lexical.

**Case**: The claim "Remote standups reduce meeting load" is evidenced by quotation Q1 of source S1, a survey. A counter-claim, "Standups shift load to chat", has its own source S2. A guide page renders the claim, its evidence and the counter-claim together.


### An agent annotates and never edits

A person writes the text. An agent helps by adding structure around it: titles for untitled paragraphs, links to sources and problems, counter-claims.

**What goes wrong**:
- When the agent edits the text itself, the author's words change under them.
- There is no clean way to take the agent's work back out.
- Edits and annotations end up mixed in one file.

**What SRS does**:
- **Structure lives in separate records.** Titles, links and counter-claims are records and relations beside the text.
- **Removal is clean.** Delete the agent's records and the text is byte-identical.
- **Each annotation is its own record**, so what the agent added can be told apart from what the person wrote.
- **Enforcement is honest.** SRS gives the mechanism: records, relations, and a session write guard that a client can apply. The rule that agents never edit the text is the repository's own governance, not a tool rule.

**Case**: A paragraph has no title. The agent adds a title record, a link to a source and a counter-claim, each as its own record. The paragraph itself is never touched. Remove the three records and the text is exactly what the author wrote.


### A standard kept as records

A specification is kept as records: sections, invariants, concepts and decisions, each decision with its accepted costs and review triggers. The published document is generated from them.

**What goes wrong**:
- A specification kept as one document drifts from its own parts.
- A hand edit to the output is not reflected in the source, and nobody notices.
- A decision loses its reasons, so nobody knows when to reconsider it.

**What SRS does**:
- **Sections, invariants, concepts and decisions are records**, linked by relations such as `refines`.
- **The document is a projection.** A Composition renders it, and it can be regenerated at any time.
- **A drift check** re-renders the document and fails if anyone hand-edited the output.
- **A decision names its cost and its review trigger**, so reconsidering it is a recorded act.

**Case**: Decision D2 "Use opaque ids" `refines` D1 "Records need stable identity". Its accepted cost is "ids are unreadable" and its review trigger is "if tooling cannot resolve ids". A hand edit to the rendered page turns the drift check red. The SRS specification itself is maintained this way.


