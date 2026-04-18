/**
 * Shared descriptors used by the environments-tab hooks and
 * presentational rows. Kept small + data-only — no callbacks, no JSX.
 */

export interface BadgeDescriptor {
  tone: "ok" | "error" | "muted";
  label: string;
}
