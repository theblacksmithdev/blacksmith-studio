import styled from "@emotion/styled";

export const CanvasWrap = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--studio-bg-main);

  .react-flow__background {
    background: var(--studio-bg-main) !important;
  }

  .react-flow__controls {
    bottom: 16px;
    right: 16px;
    left: auto;
    box-shadow: none;
    border: 1px solid var(--studio-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--studio-bg-surface);
  }

  .react-flow__controls-button {
    background: var(--studio-bg-surface);
    border-bottom: 1px solid var(--studio-border);
    color: var(--studio-text-muted);
    width: 28px;
    height: 28px;

    &:hover {
      background: var(--studio-bg-hover);
      color: var(--studio-text-primary);
    }

    svg {
      fill: currentColor;
      max-width: 12px;
      max-height: 12px;
    }
  }

  .react-flow__edge-path {
    stroke: var(--studio-border);
    stroke-width: 1.5;
  }

  .react-flow__handle {
    opacity: 0;
    transition: opacity 0.12s ease;
  }

  .react-flow__node:hover .react-flow__handle {
    opacity: 0.6;
  }

  .react-flow__minimap,
  .react-flow__attribution {
    display: none;
  }

  .react-flow__pane {
    cursor: default;
  }
`;
