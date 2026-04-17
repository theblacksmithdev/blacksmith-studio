/**
 * Robust JSON extraction for PM responses.
 *
 * The PM's output is a stream of assistant text that's *usually* a bare JSON
 * value, but Claude sometimes deviates:
 *   - wraps it in a markdown code fence (```json … ```)
 *   - prepends a sentence of prose ("Here's the plan:")
 *   - appends commentary that contains literal `{` `}` characters
 *
 * The old first-`{` / last-`}` slice breaks on any of those. This module
 * uses a balanced-brace scanner that respects string literals and escape
 * sequences, so it returns the FIRST complete JSON value in the response
 * and nothing else.
 */

/**
 * Find the first balanced JSON structure in `raw` that starts with `open`
 * and ends with the matching close character. Returns the substring, or
 * null if no complete structure was found.
 *
 * The scanner respects quoted strings: braces or brackets inside `"..."`
 * don't affect the depth counter. Escape sequences inside strings are
 * handled so `"\""` doesn't prematurely end the string. Prose before the
 * JSON and a trailing ``` fence (or other commentary) after it are ignored,
 * so no pre-stripping of markdown fences is needed — that was previously
 * done but caused truncation when `prompt` strings contained their own
 * ``` fenced snippets.
 */
export function extractJsonStructure(
  raw: string,
  open: "{" | "[",
): string | null {
  const close = open === "{" ? "}" : "]";

  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === open) {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === close) {
      if (depth === 0) continue;
      depth--;
      if (depth === 0 && start !== -1) {
        return raw.slice(start, i + 1);
      }
    }
  }

  return null;
}
