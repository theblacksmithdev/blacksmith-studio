import styled from "@emotion/styled";

/**
 * Ambient grid + gradient wash for the home/new landing page.
 *
 * Single Responsibility: paint a decorative background layer.
 * - Two stacked linear-gradients draw the grid lines at GRID_SIZE spacing.
 * - A radial mask fades the grid from the centre outward so it reads as
 *   atmosphere, not a spreadsheet.
 * - A second radial wash adds a soft luminance bloom for depth.
 *
 * Parent must be `position: relative` for the `inset: 0` layer to anchor.
 * Purely presentational — `pointer-events: none` and `aria-hidden`, so it
 * never interferes with interaction or assistive tech.
 *
 * Uses `--studio-border-hover` (0.16 alpha in both themes) for the grid
 * lines so they stay visible without theme-specific hardcoding — the
 * earlier version combined a 0.08-alpha variable with a 0.07 container
 * opacity, which multiplied out to effectively invisible.
 */

const GRID_SIZE = 32;
const WASH_OPACITY = 0.7;

const Layer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
`;

const GRID_MASK = `radial-gradient(
    ellipse 70% 60% at 50% 45%,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.7) 45%,
    transparent 95%
  )`;

const Grid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(
      to right,
      var(--studio-border-hover) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      var(--studio-border-hover) 1px,
      transparent 1px
    );
  background-size: ${GRID_SIZE}px ${GRID_SIZE}px;
  mask-image: ${GRID_MASK};
  -webkit-mask-image: ${GRID_MASK};
`;

const Wash = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse 120% 80% at 50% 40%,
      var(--studio-bg-surface) 0%,
      transparent 65%
    );
  opacity: ${WASH_OPACITY};
`;

export function StudioBackground() {
  return (
    <Layer aria-hidden="true">
      <Grid />
      <Wash />
    </Layer>
  );
}
