import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Loader2 } from "lucide-react";

/**
 * Shared style primitives for the onboarding steps. Step components
 * are Chakra-first (`Box`/`Flex`/`VStack`/`Text`); anything that needs
 * keyframe animations, multi-variant state, or css-custom-property math
 * lives here so the component files stay about structure, not paint.
 */

/* ── Keyframes ──────────────────────────────────────────────── */

export const drift = keyframes`
  from { transform: translateY(8px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
`;

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

/* ── Styled ─────────────────────────────────────────────────── */

export const Spinner = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;
`;

/* ── Eyebrow chip variants ─────────────────────────────────── */

const baseEyebrowCss = {
  display: "inline-flex",
  alignSelf: "flex-start",
  alignItems: "center",
  gap: "6px",
  padding: "4px 10px",
  borderRadius: "999px",
  border: "1px solid var(--studio-border)",
  fontSize: "10.5px",
  fontWeight: 500,
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--studio-text-tertiary)",
};

export const welcomeEyebrowCss = {
  ...baseEyebrowCss,
  background: "color-mix(in srgb, var(--studio-bg-main) 90%, transparent)",
};

export const doneEyebrowCss = {
  ...baseEyebrowCss,
  background: "var(--studio-bg-main)",
};

/* ── Welcome step ──────────────────────────────────────────── */

export const welcomeRootCss = {
  animation: `${drift} 0.4s cubic-bezier(0.16, 1, 0.3, 1)`,
};

export const welcomeKickerCss = {
  fontSize: "22px",
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
  margin: 0,
};

export const featureCardCss = {
  position: "relative" as const,
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
  padding: "16px",
  border: "1px solid var(--studio-border)",
  borderRadius: "12px",
  background: "color-mix(in srgb, var(--studio-bg-main) 85%, transparent)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  transition:
    "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s ease, background 0.15s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    borderColor: "var(--studio-border-hover)",
    background: "color-mix(in srgb, var(--studio-bg-main) 95%, transparent)",
  },
};

export const iconSquareCss = {
  width: "28px",
  height: "28px",
  borderRadius: "8px",
  background: "var(--studio-bg-surface)",
  border: "1px solid var(--studio-border)",
  color: "var(--studio-text-secondary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const featureTitleCss = {
  fontWeight: 600,
  letterSpacing: "-0.005em",
};

export const featureDescCss = { lineHeight: 1.55 };

/* ── Done step ─────────────────────────────────────────────── */

export const doneHeroCss = {
  position: "relative" as const,
  overflow: "hidden" as const,
  padding: "40px 32px 32px",
  borderRadius: "18px",
  border: "1px solid var(--studio-border)",
  background:
    "radial-gradient(100% 60% at 30% 0%, color-mix(in srgb, var(--studio-accent) 10%, transparent) 0%, transparent 60%)," +
    "radial-gradient(80% 60% at 100% 100%, color-mix(in srgb, var(--studio-accent) 6%, transparent) 0%, transparent 70%)," +
    "var(--studio-bg-surface)",
  animation: `${drift} 0.4s cubic-bezier(0.16, 1, 0.3, 1)`,
};

export const doneEmblemCss = {
  width: "56px",
  height: "56px",
  borderRadius: "16px",
  background: "var(--studio-accent)",
  color: "var(--studio-accent-fg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow:
    "0 0 0 4px color-mix(in srgb, var(--studio-bg-main) 100%, transparent), 0 0 32px color-mix(in srgb, var(--studio-accent) 30%, transparent)",
};

export const doneTitleCss = {
  fontSize: "26px",
  fontWeight: 600,
  letterSpacing: "-0.022em",
  lineHeight: 1.2,
  margin: 0,
};

export const doneDescCss = { lineHeight: 1.55, maxWidth: "520px" };

export const doneSummaryListCss = {
  listStyle: "none",
  padding: 0,
  margin: "4px 0 0",
};

export const doneSummaryRowCss = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 12px",
  borderRadius: "10px",
  background: "color-mix(in srgb, var(--studio-bg-main) 85%, transparent)",
  border: "1px solid var(--studio-border)",
  color: "var(--studio-text-secondary)",
  fontSize: "12.5px",
};

/* ── Picker step shell (nodejs + python) ───────────────────── */

export const emptyHintCss = {
  padding: "18px 20px",
  border: "1px dashed var(--studio-border)",
  borderRadius: "12px",
  background: "var(--studio-bg-surface)",
};

export const selectedPillCss = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  border: "1px solid var(--studio-border)",
  borderRadius: "10px",
  background: "var(--studio-bg-surface)",
  fontSize: "12.5px",
  color: "var(--studio-text-secondary)",
};

/* ── Status row (claude-cli, python-env, claude-auth) ──────── */

type RowTone = "idle" | "ok" | "err" | "working";

export function statusRowCss(tone: RowTone) {
  return {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: `1px solid ${
      tone === "err" ? "var(--studio-error)" : "var(--studio-border)"
    }`,
    background: "var(--studio-bg-surface)",
  };
}

export const errorBlockCss = {
  margin: 0,
  padding: "10px 12px",
  borderRadius: "8px",
  background: "var(--studio-bg-inset, var(--studio-bg-main))",
  border: "1px solid var(--studio-border)",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  fontSize: "11.5px",
  color: "var(--studio-error)",
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-word" as const,
  maxHeight: "200px",
  overflow: "auto",
};

/* ── Claude auth step ──────────────────────────────────────── */

export const cmdCardCss = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 14px",
  borderRadius: "10px",
  background: "var(--studio-bg-inset, var(--studio-bg-main))",
  border: "1px solid var(--studio-border)",
};

export const cmdTextCss = {
  flex: 1,
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  fontSize: "13px",
  color: "var(--studio-text-primary)",
  userSelect: "all" as const,
};
