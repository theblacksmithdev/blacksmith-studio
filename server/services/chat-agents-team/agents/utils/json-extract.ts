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
 * handled so `"\""` doesn't prematurely end the string.
 */
export function extractJsonStructure(
  raw: string,
  open: "{" | "[",
): string | null {
  const close = open === "{" ? "}" : "]";
  const stripped = stripCodeFence(raw);

  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];

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
        return stripped.slice(start, i + 1);
      }
    }
  }

  return null;
}

/**
 * Strip a surrounding markdown code fence if present. Accepts fences with
 * or without a language tag (``` or ```json). If the response contains
 * prose outside the fence, returns the fenced content so the scanner sees
 * just the JSON body.
 */
function stripCodeFence(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/```(?:json|JSON)?\s*\n?([\s\S]*?)\n?\s*```/);
  return match ? match[1] : trimmed;
}
