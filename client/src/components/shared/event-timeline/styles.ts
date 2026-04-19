import styled from "@emotion/styled";

/**
 * Visual primitives for the event timeline. A vertical rail runs the
 * length of the list, each event sits on it as a circular icon node +
 * an expandable card. Default state is a single compact row; clicking
 * reveals meta + code content underneath.
 */

export const TimelineRoot = styled.div`
  position: relative;
  padding: 14px 16px 20px;
  overflow-y: auto;
`;

export const TimelineRail = styled.div`
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 13px;
    top: 16px;
    bottom: 16px;
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      var(--studio-border) 8%,
      var(--studio-border) 92%,
      transparent 100%
    );
    pointer-events: none;
  }
`;

export const EventItem = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 3px 0;

  &:hover .event-icon {
    border-color: var(--studio-border-hover);
  }
  &:hover .event-card {
    background: var(--studio-bg-hover);
  }
  &:hover .event-chevron {
    opacity: 1;
    color: var(--studio-text-secondary);
  }
`;

export const IconNode = styled.div<{ tone?: "neutral" | "accent" | "error" }>`
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5px;
  background: ${(p) =>
    p.tone === "accent"
      ? "var(--studio-accent)"
      : "var(--studio-bg-surface)"};
  color: ${(p) =>
    p.tone === "accent"
      ? "var(--studio-accent-fg)"
      : p.tone === "error"
        ? "var(--studio-error)"
        : "var(--studio-text-secondary)"};
  border: 1px solid
    ${(p) =>
      p.tone === "error"
        ? "var(--studio-error)"
        : "var(--studio-border)"};
  box-shadow: 0 0 0 3px var(--studio-bg-main);
  transition: border-color 0.15s ease;
`;

export const EventCard = styled.button<{ tone?: "neutral" | "accent" | "error" }>`
  flex: 1;
  min-width: 0;
  padding: 6px 10px 7px;
  border-radius: 8px;
  background: ${(p) =>
    p.tone === "error" ? "var(--studio-bg-surface)" : "transparent"};
  border: 1px solid
    ${(p) =>
      p.tone === "error" ? "var(--studio-error)" : "transparent"};
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  transition:
    background 0.12s ease,
    border-color 0.12s ease;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--studio-accent);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const TypeLabel = styled.span`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`;

export const TitleText = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--studio-text-primary);
  letter-spacing: -0.005em;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Timestamp = styled.span`
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
`;

export const Chevron = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--studio-text-muted);
  opacity: 0.6;
  transition:
    transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.15s ease,
    color 0.15s ease;

  &[data-expanded="true"] {
    transform: rotate(90deg);
    opacity: 1;
    color: var(--studio-text-secondary);
  }
`;

export const ExpandBody = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--studio-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const BodyText = styled.div`
  font-size: 12px;
  color: var(--studio-text-secondary);
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const BodyMeta = styled.div`
  font-size: 11.5px;
  color: var(--studio-text-tertiary);
  line-height: 1.5;
  word-break: break-word;
`;

export const EmptyState = styled.div`
  padding: 56px 24px;
  text-align: center;
  color: var(--studio-text-muted);
  font-size: 13px;
`;
