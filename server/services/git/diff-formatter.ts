import { MAX_DIFF_SIZE } from "./constants.js";

/**
 * Pure helpers for capping and formatting diff strings.
 *
 * Single Responsibility: large-diff handling. Keeps the truncation policy
 * in one place so services don't accidentally disagree on the limit.
 */
export class DiffFormatter {
  /** Truncate an oversized diff with a trailing explanation. */
  static cap(diff: string, reason = "file too large to display"): string {
    if (diff.length <= MAX_DIFF_SIZE) return diff;
    return (
      diff.slice(0, MAX_DIFF_SIZE) +
      `\n\n... diff truncated (${reason})`
    );
  }

  /** Render a full file's content as an all-additions diff (for untracked files). */
  static asAllAdditions(content: string): string {
    return content
      .split("\n")
      .map((line) => `+${line}`)
      .join("\n");
  }
}
