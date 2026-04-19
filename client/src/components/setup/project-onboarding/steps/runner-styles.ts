/**
 * Styles specific to the runner step — kept separate from `styles.ts`
 * so shared step chrome stays tidy and the runner-only bits don't leak
 * into other steps' scopes.
 */

export const configListCss = {
  border: "1px solid var(--studio-border)",
  borderRadius: "12px",
  background: "var(--studio-bg-surface)",
  overflow: "hidden",
};

export const configRowCss = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 12px",
  borderBottom: "1px solid var(--studio-border)",
  "&:last-of-type": { borderBottom: "none" },
};

export const configCommandCss = {
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  fontSize: "11.5px",
  color: "var(--studio-text-muted)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
  maxWidth: "100%",
};
