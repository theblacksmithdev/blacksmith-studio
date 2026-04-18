export type ChatComposerVariant = "spacious" | "compact";
export type SendShortcut = "enter" | "cmd+enter";

export interface VariantDefaults {
  minHeight: string;
  sendShortcut: SendShortcut;
}

/**
 * Calibrated ergonomics per surface.
 *
 * - `spacious` — new-conversation landing. Bigger textarea so drafts
 *   breathe; Cmd/Ctrl+Enter to send so Enter inserts newlines.
 * - `compact`  — inline conversation. Tight textarea; Enter sends so the
 *   back-and-forth stays fast.
 */
export const VARIANT_DEFAULTS: Record<ChatComposerVariant, VariantDefaults> = {
  spacious: { minHeight: "70px", sendShortcut: "cmd+enter" },
  compact: { minHeight: "44px", sendShortcut: "enter" },
};
