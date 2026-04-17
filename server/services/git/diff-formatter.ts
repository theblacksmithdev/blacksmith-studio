import { MAX_DIFF_SIZE } from "./constants.js";

/**
 * Truncate an oversized diff with a trailing explanation. Keeps the
 * truncation policy in one place so services can't accidentally disagree
 * on the limit.
 */
export function capDiff(
  diff: string,
  reason = "file too large to display",
): string {
  if (diff.length <= MAX_DIFF_SIZE) return diff;
  return diff.slice(0, MAX_DIFF_SIZE) + `\n\n... diff truncated (${reason})`;
}

/** Render a full file's content as an all-additions diff (for untracked files). */
export function asAllAdditionsDiff(content: string): string {
  return content
    .split("\n")
    .map((line) => `+${line}`)
    .join("\n");
}
