/** Shared prop types for components. */

/** A lifecycle status, drawn by Tag: told by border and fill, never by hue alone. */
export type Status = "draft" | "proposed" | "active" | "ratified" | "superseded" | "archived";

/** The ideas of the diagram vocabulary that Glyph can draw. */
export type GlyphKind = "structure" | "record" | "field" | "relation" | "identity" | "note" | "derived";
