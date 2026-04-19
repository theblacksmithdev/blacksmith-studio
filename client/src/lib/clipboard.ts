/**
 * Clipboard helpers. Centralised so callers don't need to remember the
 * permission / async contract of `navigator.clipboard` — errors (e.g.
 * browser denial, insecure context) are swallowed and surfaced as a
 * boolean so UIs can show a toast without try/catch noise at every
 * call site.
 */

/** Write `text` to the system clipboard. Resolves `true` on success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
