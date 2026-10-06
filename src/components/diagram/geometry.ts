/** Small geometry helpers shared by the diagram primitives. Angles are degrees, clockwise from 3 o'clock (SVG). */

export interface Point {
  x: number;
  y: number;
}

const rad = (deg: number) => (deg * Math.PI) / 180;

export const round = (n: number) => Math.round(n * 100) / 100;

/** Every ring and link is drawn this much heavier than the width it is given: one knob for the line weight of the whole diagram family. */
export const LINE_WEIGHT = 1.35;

export function polar(cx: number, cy: number, r: number, deg: number): Point {
  return { x: round(cx + r * Math.cos(rad(deg))), y: round(cy + r * Math.sin(rad(deg))) };
}

/** An SVG arc path along a circle from one angle to another, clockwise. */
export function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  const sweep = (((to - from) % 360) + 360) % 360;
  return `M${a.x} ${a.y}A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

/** The angular width, in degrees, that a shape of radius `size` occupies on a circle of radius `r`. */
export function angularWidth(r: number, size: number): number {
  return (2 * Math.asin(Math.min(1, size / r)) * 180) / Math.PI;
}

/** Shorten a segment by `inset` at both ends, so a line stops at the edge of a node. */
export function trim(a: Point, b: Point, insetA: number, insetB = insetA): [Point, Point] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return [
    { x: round(a.x + ux * insetA), y: round(a.y + uy * insetA) },
    { x: round(b.x - ux * insetB), y: round(b.y - uy * insetB) },
  ];
}

/** The six part positions of a cluster on its ring. */
export function hexPoints(cx: number, cy: number, r: number, start = -90): Point[] {
  return Array.from({ length: 6 }, (_, i) => polar(cx, cy, r, start + i * 60));
}

export type LabelPosition = "below" | "above" | "right" | "left" | "inside";

/** Where a node's short label sits relative to the node: the position, its text anchor and baseline. */
export function labelAt(cx: number, cy: number, r: number, position: LabelPosition) {
  switch (position) {
    case "above":
      return { x: cx, y: cy - r - 10, anchor: "middle", base: "auto" };
    case "right":
      return { x: cx + r + 12, y: cy, anchor: "start", base: "central" };
    case "left":
      return { x: cx - r - 12, y: cy, anchor: "end", base: "central" };
    case "inside":
      return { x: cx, y: cy, anchor: "middle", base: "central" };
    default:
      return { x: cx, y: cy + r + 20, anchor: "middle", base: "auto" };
  }
}

/** Break a label into lines of at most `max` characters, on word spaces: for the narrow layouts, where a label cannot run wide. */
export function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  for (const word of text.split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + " " + word).length <= max) lines[lines.length - 1] = last + " " + word;
    else lines.push(word);
  }
  return lines;
}
