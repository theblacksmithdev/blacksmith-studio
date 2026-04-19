import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

export const drift = keyframes`
  from { transform: translateY(8px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
`;

/* ── Shared chrome ─────────────────────────────────────────── */

export const eyebrowCss = {
  display: "inline-flex",
  alignSelf: "flex-start",
  alignItems: "center",
  gap: "6px",
  padding: "4px 10px",
  borderRadius: "999px",
  background: "color-mix(in srgb, var(--studio-bg-main) 85%, transparent)",
  border: "1px solid var(--studio-border)",
  fontSize: "10.5px",
  fontWeight: 500,
  color: "var(--studio-text-tertiary)",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

export const rootCss = {
  animation: `${drift} 0.35s cubic-bezier(0.16, 1, 0.3, 1)`,
};

/* ── Welcome ───────────────────────────────────────────────── */

export const HeroCard = styled.div`
  padding: 20px;
  border: 1px solid var(--studio-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--studio-bg-main) 82%, transparent);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const pathChipCss = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "5px 10px",
  borderRadius: "8px",
  background: "var(--studio-bg-inset, var(--studio-bg-main))",
  border: "1px solid var(--studio-border)",
  color: "var(--studio-text-secondary)",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  fontSize: "11.5px",
  alignSelf: "flex-start",
};

export const highlightsGridCss = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "10px",
};

export const highlightCardCss = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  padding: "14px",
  border: "1px solid var(--studio-border)",
  borderRadius: "12px",
  background: "color-mix(in srgb, var(--studio-bg-main) 70%, transparent)",
};

export const highlightIconCss = {
  flexShrink: 0,
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

/* ── Status row (runner / graphify step) ───────────────────── */

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

/* ── Done ──────────────────────────────────────────────────── */

export const doneEmblemCss = {
  alignSelf: "flex-start",
  width: "64px",
  height: "64px",
  borderRadius: "18px",
  background:
    "linear-gradient(145deg, var(--studio-bg-surface) 0%, color-mix(in srgb, var(--studio-bg-surface) 75%, #000) 100%)",
  border: "1px solid var(--studio-border)",
  color: "var(--studio-text-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow:
    "0 0 0 5px color-mix(in srgb, var(--studio-bg-main) 70%, transparent)," +
    "0 8px 28px color-mix(in srgb, var(--studio-accent) 14%, transparent)," +
    "inset 0 1px 0 color-mix(in srgb, var(--studio-text-primary) 10%, transparent)",
};

export const doneTitleCss = {
  fontSize: "32px",
  fontWeight: 600,
  letterSpacing: "-0.028em",
  lineHeight: 1.15,
  margin: 0,
  background:
    "linear-gradient(180deg, var(--studio-text-primary) 0%, color-mix(in srgb, var(--studio-text-primary) 75%, transparent) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

export const doneSummaryRowCss = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 12px",
  borderRadius: "999px",
  background: "color-mix(in srgb, var(--studio-bg-main) 70%, transparent)",
  border: "1px solid var(--studio-border)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  color: "var(--studio-text-secondary)",
  fontSize: "12px",
  fontWeight: 500,
};
