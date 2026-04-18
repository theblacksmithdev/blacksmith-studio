/**
 * Decide whether an artifact body should render as a full HTML preview.
 *
 * Handles two common shapes:
 *   1. Fenced block — ```html …\n</html>\n``` (ui-designer output).
 *   2. Raw HTML document — starts with <!doctype html> or <html …>.
 *
 * Returns the unwrapped HTML string when one of the patterns matches,
 * or null when the body should flow through the normal markdown path.
 */
export function extractHtmlArtifact(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) return null;

  const fenceMatch = FENCE_RE.exec(trimmed);
  if (fenceMatch) return (fenceMatch[1] ?? "").trim();

  if (DOCTYPE_RE.test(trimmed) || HTML_TAG_RE.test(trimmed)) {
    return trimmed;
  }
  return null;
}

// Accepts ```html … ``` with optional trailing newline; tolerant of
// arbitrary whitespace and case (`HTML`, `htm`).
const FENCE_RE = /^```(?:html|htm)\s*\n([\s\S]*?)\n?```\s*$/i;
const DOCTYPE_RE = /^<!doctype\s+html/i;
const HTML_TAG_RE = /^<html(\s|>)/i;
