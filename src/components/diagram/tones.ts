/**
 * The meaning each diagram colour carries (defined once as semantic tokens, shown as
 * the legend on /styleguide). `ink` is derived output: rendered, never authoritative.
 */
export type Tone = "structure" | "record" | "field" | "relation" | "note" | "ink";

export const TONES: Tone[] = ["structure", "record", "field", "relation", "note", "ink"];
