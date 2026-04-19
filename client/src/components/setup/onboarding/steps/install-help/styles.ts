import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

/**
 * All install-help chrome. Chakra primitives + `Text` handle the
 * layout inside the drawer; everything here is either animated
 * (keyframes, collapsible body), stateful (hover/open variants), or a
 * html tag Chakra's `Box as=…` types reject (`button`, `a`, `code`).
 */

const fadeInDown = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

/* ── Card + header (click target) ─────────────────────────────── */

export const MethodCard = styled.div<{ $open: boolean }>`
  border: 1px solid var(--studio-border);
  border-radius: 14px;
  background: ${(p) =>
    p.$open
      ? "var(--studio-bg-main)"
      : "color-mix(in srgb, var(--studio-bg-main) 70%, transparent)"};
  overflow: hidden;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: var(--studio-border-hover);
  }
`;

export const MethodTrigger = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  text-align: left;
  transition: background 0.12s ease;

  &:hover {
    background: color-mix(in srgb, var(--studio-bg-hover) 60%, transparent);
  }

  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--studio-accent);
  }
`;

export const MethodIconSlot = styled.div`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-inset, var(--studio-bg-main));
  color: var(--studio-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Chevron = styled.span<{ $open: boolean }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--studio-text-muted);
  transform: rotate(${(p) => (p.$open ? "90deg" : "0deg")});
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const MethodBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 16px 16px;
  animation: ${fadeInDown} 0.22s cubic-bezier(0.16, 1, 0.3, 1);
`;

/* ── Command row (premium terminal snippet) ───────────────────── */

export const CommandRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 10px 14px;
  border-radius: 10px;
  background: linear-gradient(
    180deg,
    var(--studio-bg-inset, var(--studio-bg-main)) 0%,
    color-mix(in srgb, var(--studio-bg-inset, var(--studio-bg-main)) 88%, #000) 100%
  );
  border: 1px solid var(--studio-border);
  transition: border-color 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
  }
`;

export const PromptGlyph = styled.span`
  flex-shrink: 0;
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 12px;
  color: var(--studio-text-muted);
  user-select: none;
`;

export const CommandText = styled.code`
  flex: 1;
  min-width: 0;
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--studio-text-primary);
  user-select: all;
  word-break: break-all;
  white-space: pre-wrap;
`;

export const CopyIconBtn = styled.button<{ $copied: boolean }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: ${(p) =>
    p.$copied ? "var(--studio-accent)" : "var(--studio-bg-surface)"};
  color: ${(p) =>
    p.$copied
      ? "var(--studio-accent-fg)"
      : "var(--studio-text-secondary)"};
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: ${(p) =>
      p.$copied ? "var(--studio-accent-fg)" : "var(--studio-text-primary)"};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--studio-accent);
  }
`;

/* ── Link row (external download / docs) ──────────────────────── */

export const LinkRow = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--studio-bg-inset, var(--studio-bg-main));
  border: 1px solid var(--studio-border);
  color: var(--studio-text-primary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    transform: translateX(2px);
  }

  & .link-arrow {
    margin-left: auto;
    color: var(--studio-text-muted);
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover .link-arrow {
    color: var(--studio-text-secondary);
    transform: translateX(3px);
  }
`;

/* ── Tiny inline css helpers (used via Chakra `css` prop) ─────── */

export const introCss = {
  padding: "0 4px",
  color: "var(--studio-text-tertiary)",
  fontSize: "13px",
  lineHeight: 1.55,
};

export const sectionLabelCss = {
  fontSize: "10.5px",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--studio-text-muted)",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  paddingTop: "4px",
};

export const stepLabelCss = {
  fontSize: "10.5px",
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "var(--studio-text-muted)",
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
  paddingLeft: "2px",
};

export const methodTitleCss = {
  fontSize: "13.5px",
  fontWeight: 600,
  letterSpacing: "-0.005em",
  color: "var(--studio-text-primary)",
};

export const methodSubtitleCss = {
  fontSize: "12px",
  color: "var(--studio-text-tertiary)",
  lineHeight: 1.5,
};

export const recommendedPillCss = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "2px 8px",
  borderRadius: "999px",
  background: "var(--studio-accent)",
  color: "var(--studio-accent-fg)",
  fontSize: "9.5px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  fontFamily: "var(--studio-font-mono, \"SF Mono\", monospace)",
};

export const footerHintCss = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "color-mix(in srgb, var(--studio-bg-inset, var(--studio-bg-main)) 80%, transparent)",
  border: "1px dashed var(--studio-border)",
  color: "var(--studio-text-tertiary)",
  fontSize: "12.5px",
  lineHeight: 1.55,
};
