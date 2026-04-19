import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Loader2 } from "lucide-react";

/**
 * Only the components with complex variant state or positioned backdrops
 * live here as Emotion `styled`:
 *   - Shell / Rail / Content — positioned layers with ::before gradients
 *   - StepItem / StepIndicator / StepConnector — 4-way tonal variants
 *     + pulseRing keyframe + active-glow halo
 *   - PickerCard / PickerScroll / PickerRow / PickerRadio — stateful
 *     selected + hover
 *   - FooterBar / FooterBarFill — animated gradient progress
 *
 * Simple layout + typography in the wizard are written with Chakra
 * `Box`/`Flex`/`VStack` + shared `Text` (see `wizard.tsx`).
 */

/* ── Animations ──────────────────────────────────────────────── */

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const pulseRing = keyframes`
  0%   { box-shadow: 0 0 0 0 var(--studio-accent); opacity: 0.6; }
  70%  { box-shadow: 0 0 0 8px transparent;         opacity: 0; }
  100% { box-shadow: 0 0 0 0 transparent;           opacity: 0; }
`;

/* ── Full-screen shell (positioned backdrops) ─────────────────── */

export const Shell = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  grid-template-columns: 320px 1fr;
  background: var(--studio-bg-main);
  color: var(--studio-text-primary);
  font-family: inherit;
  overflow: hidden;
`;

export const Rail = styled.aside`
  position: relative;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  padding: 28px 20px 16px;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        80% 40% at 10% 0%,
        color-mix(in srgb, var(--studio-accent) 6%, transparent) 0%,
        transparent 60%
      ),
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--studio-bg-surface) 40%, transparent) 0%,
        transparent 45%
      );
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

export const Content = styled.main`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: -1px 0 0 0;
    pointer-events: none;
    background: radial-gradient(
      120% 55% at 50% -10%,
      color-mix(in srgb, var(--studio-accent) 6%, transparent) 0%,
      transparent 50%
    );
  }
`;

export const ContentBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
`;

/* ── Step list items (variant state + pulseRing) ─────────────── */

export const StepItem = styled.li<{
  $status: "pending" | "active" | "done" | "error";
}>`
  position: relative;
  display: flex;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 12px;
  background: ${(p) =>
    p.$status === "active"
      ? "color-mix(in srgb, var(--studio-bg-surface) 95%, var(--studio-accent) 5%)"
      : "transparent"};
  transition: background 0.15s ease;
  cursor: default;

  &:hover {
    background: ${(p) =>
      p.$status === "active"
        ? "color-mix(in srgb, var(--studio-bg-surface) 95%, var(--studio-accent) 5%)"
        : "var(--studio-bg-hover)"};
  }
`;

export const StepIndicator = styled.div<{
  $status: "pending" | "active" | "done" | "error";
}>`
  position: relative;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  background: ${(p) =>
    p.$status === "done"
      ? "var(--studio-accent)"
      : p.$status === "active"
        ? "var(--studio-bg-main)"
        : p.$status === "error"
          ? "transparent"
          : "transparent"};
  color: ${(p) =>
    p.$status === "done"
      ? "var(--studio-accent-fg)"
      : p.$status === "active"
        ? "var(--studio-text-primary)"
        : p.$status === "error"
          ? "var(--studio-error)"
          : "var(--studio-text-muted)"};
  border: 1px solid
    ${(p) =>
      p.$status === "done"
        ? "var(--studio-accent)"
        : p.$status === "error"
          ? "var(--studio-error)"
          : p.$status === "active"
            ? "var(--studio-text-primary)"
            : "var(--studio-border)"};
  box-shadow: ${(p) =>
    p.$status === "active"
      ? "0 0 0 4px color-mix(in srgb, var(--studio-bg-surface) 100%, transparent), 0 0 12px color-mix(in srgb, var(--studio-accent) 18%, transparent)"
      : "none"};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  margin-top: 1px;

  &::before {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    pointer-events: none;
    ${(p) =>
      p.$status === "active"
        ? `animation: ${pulseRing} 2.4s ease-out infinite;`
        : ""}
  }
`;

export const StepConnector = styled.div<{ $status: "done" | "other" }>`
  position: absolute;
  left: 22px;
  top: 36px;
  bottom: -2px;
  width: 1px;
  background: ${(p) =>
    p.$status === "done"
      ? "var(--studio-accent)"
      : "var(--studio-border)"};
  opacity: ${(p) => (p.$status === "done" ? 0.5 : 1)};
  transition: background 0.25s ease;
`;

/* ── Footer progress bar (animated gradient) ────────────────── */

export const FooterBar = styled.div`
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: var(--studio-border);
  overflow: hidden;
  max-width: 220px;
  box-shadow: inset 0 1px 2px color-mix(in srgb, #000 6%, transparent);
`;

export const FooterBarFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${(p) => `${p.$pct}%`};
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--studio-accent) 80%, transparent) 0%,
    var(--studio-accent) 100%
  );
  border-radius: 999px;
  transition: width 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 12px color-mix(in srgb, var(--studio-accent) 30%, transparent);
`;

/* ── Theme toggle (complex hover state) ─────────────────────── */

/* ── Top-right close button (optional, shown when onClose is set) ─── */

export const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--studio-bg-surface) 85%, transparent);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
    border-color: var(--studio-border-hover);
    transform: scale(1.04);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--studio-accent) 25%, transparent);
  }
`;

export const ThemeToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
    border-color: var(--studio-border-hover);
    transform: rotate(-18deg);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--studio-accent) 25%, transparent);
  }
`;

/* ── Binary picker (variant state + scroll) ─────────────────── */

export const PickerCard = styled.div`
  border: 1px solid var(--studio-border);
  border-radius: 14px;
  background: var(--studio-bg-surface);
  overflow: hidden;
  box-shadow: 0 1px 2px color-mix(in srgb, #000 4%, transparent);
`;

export const PickerScroll = styled.div`
  max-height: 260px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--studio-scrollbar, var(--studio-border));
    border-radius: 4px;
    border: 2px solid var(--studio-bg-surface);
  }
`;

export const PickerRow = styled.button<{ $selected?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  background: ${(p) =>
    p.$selected
      ? "color-mix(in srgb, var(--studio-bg-hover) 100%, var(--studio-accent) 3%)"
      : "transparent"};
  border: none;
  border-bottom: 1px solid var(--studio-border);
  cursor: pointer;
  text-align: left;
  color: inherit;
  font-family: inherit;
  transition: background 0.12s ease;

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background: var(--studio-bg-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--studio-accent);
  }
`;

export const PickerRadio = styled.div<{ $selected?: boolean }>`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid
    ${(p) =>
      p.$selected ? "var(--studio-accent)" : "var(--studio-border-hover)"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease;

  &::after {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(p) =>
      p.$selected ? "var(--studio-accent)" : "transparent"};
    transform: ${(p) => (p.$selected ? "scale(1)" : "scale(0)")};
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

export const PickerMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const PickerLabel = styled.div`
  font-size: 13.5px;
  font-weight: 500;
  color: var(--studio-text-primary);
  letter-spacing: -0.005em;
`;

export const PickerPath = styled.div`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 11.5px;
  color: var(--studio-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PickerVersion = styled.div`
  flex-shrink: 0;
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 11.5px;
  color: var(--studio-text-tertiary);
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--studio-bg-inset, var(--studio-bg-main));
  border: 1px solid var(--studio-border);
`;

/* ── Binary picker — browse spinner + inline rows ──────────── */

export const SpinIcon = styled(Loader2)`
  animation: ${spin} 0.9s linear infinite;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`;

export const pickerInlineRowCss = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  fontSize: "12.5px",
  color: "var(--studio-text-tertiary)",
  borderTop: "1px solid var(--studio-border)",
};

export const pickerErrorMsgCss = {
  color: "var(--studio-error)",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  fontSize: "12.5px",
};

export const pickerOkMsgCss = {
  color: "var(--studio-text-secondary)",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  fontSize: "12.5px",
};

/* ── Install log ───────────────────────────────────────────── */

export const installLogCardCss = {
  border: "1px solid var(--studio-border)",
  borderRadius: "12px",
  background: "var(--studio-bg-inset, var(--studio-bg-main))",
  overflow: "hidden",
};

export const installLogHeaderCss = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "9px 12px",
  borderBottom: "1px solid var(--studio-border)",
  fontSize: "10.5px",
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "var(--studio-text-tertiary)",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
};

export const installLogBodyCss = {
  padding: "12px 14px",
  maxHeight: "240px",
  overflowY: "auto" as const,
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  fontSize: "11.5px",
  lineHeight: 1.6,
  color: "var(--studio-text-secondary)",
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-word" as const,
  "& > div": { animation: `${fadeIn} 0.15s ease` },
};

/* ── Wizard shell — eyebrow, title, footer bar ─────────────── */

export const eyebrowCss = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  alignSelf: "flex-start",
  padding: "4px 10px",
  borderRadius: "999px",
  background: "var(--studio-bg-surface)",
  border: "1px solid var(--studio-border)",
  fontSize: "10.5px",
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--studio-text-muted)",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
};

export const wizardTitleCss = {
  fontSize: "34px",
  fontWeight: 600,
  letterSpacing: "-0.028em",
  lineHeight: 1.1,
  margin: 0,
  background:
    "linear-gradient(180deg, var(--studio-text-primary) 0%, color-mix(in srgb, var(--studio-text-primary) 78%, transparent) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

export const wizardDescCss = {
  fontSize: "15px",
  color: "var(--studio-text-secondary)",
  lineHeight: 1.6,
  margin: 0,
  maxWidth: "580px",
};

export const wizardFooterCss = {
  position: "relative" as const,
  zIndex: 1,
  flexShrink: 0,
  padding: "16px 48px",
  borderTop: "1px solid var(--studio-border)",
  background: "color-mix(in srgb, var(--studio-bg-sidebar) 92%, transparent)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

export const wizardBrandTitleCss = {
  fontSize: "15px",
  fontWeight: 600,
  color: "var(--studio-text-primary)",
  letterSpacing: "-0.01em",
  lineHeight: 1.2,
};

export const wizardBrandCaptionCss = {
  fontSize: "10.5px",
  color: "var(--studio-text-muted)",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
};

export const wizardRailFooterLabelCss = {
  fontSize: "10.5px",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--studio-text-muted)",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  fontWeight: 500,
};

export const wizardStepListCss = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column" as const,
  gap: "2px",
};

export const wizardStepTitleCss = (active: boolean) => ({
  fontSize: "13px",
  fontWeight: active ? 600 : 500,
  color: active
    ? "var(--studio-text-primary)"
    : "var(--studio-text-secondary)",
  letterSpacing: "-0.005em",
  lineHeight: 1.3,
  transition: "color 0.15s ease",
});

export const wizardStepHintCss = {
  fontSize: "11.5px",
  color: "var(--studio-text-muted)",
  lineHeight: 1.35,
};

export const wizardFooterProgressCss = {
  color: "var(--studio-text-muted)",
  fontSize: "11.5px",
  fontVariantNumeric: "tabular-nums" as const,
  letterSpacing: "0.02em",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
};
