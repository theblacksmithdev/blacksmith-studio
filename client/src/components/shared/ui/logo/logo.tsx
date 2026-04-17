import type { SVGProps } from "react";

/**
 * Blacksmith Studio Logo — Monogram
 *
 * A bold geometric "B" with a triangular chip struck from the top-right
 * corner — the forge metaphor abstracted to a single typographic mark.
 * A small ember-fleck hovers above the notch to suggest the chip that
 * just came off.
 *
 * Design notes:
 * - Monochrome only (respects CLAUDE.md: no green/blue status colors).
 * - Single filled <path> with evenodd rule for the letter interior so
 *   the whole glyph is one vector shape — scales cleanly from 12px up.
 * - No animation; the mark is meant to feel sturdy and permanent.
 *
 * Usage:
 *   <Logo />                          — 32px default, brand accent
 *   <Logo size={48} />                — custom size
 *   <Logo variant="mono" />           — inherits current text color
 *   <Logo variant="brand" />          — uses --studio-accent
 */

export type LogoVariant = "mono" | "brand";

interface LogoProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  size?: number;
  variant?: LogoVariant;
}

/**
 * Outer contour of the monogram, traced clockwise from top-left, with a
 * 45° chip taken from the top-right corner. The two interior openings
 * (the classic B holes) follow as sub-paths; `fill-rule="evenodd"` carves
 * them out of the outer shape.
 */
const MONOGRAM_PATH = [
  // Outer contour (with top-right chip)
  "M 10 8",
  "L 32 8",
  "L 37 13",
  "L 37 22",
  "L 39 22",
  "L 39 40",
  "L 10 40",
  "Z",
  // Top opening
  "M 17 14",
  "L 33 14",
  "L 33 21",
  "L 17 21",
  "Z",
  // Bottom opening
  "M 17 26",
  "L 34 26",
  "L 34 33",
  "L 17 33",
  "Z",
].join(" ");

/** The small ember-fleck that just chipped off the corner. */
const FLECK_PATH = "M 41 5 L 44 7 L 43 10 L 40 8 Z";

export function Logo({
  size = 32,
  variant = "brand",
  style,
  ...props
}: LogoProps) {
  const color = variant === "brand" ? "var(--studio-accent)" : "currentColor";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      style={style}
      {...props}
    >
      <path d={MONOGRAM_PATH} fill={color} fillRule="evenodd" />
      <path d={FLECK_PATH} fill={color} opacity="0.45" />
    </svg>
  );
}
