import styled from "@emotion/styled";

/**
 * Pill-style action button shared by every environment row.
 *
 * Matches the ActionBtn pattern used elsewhere in settings (e.g.
 * workspace-settings had a local copy). `data-variant="primary"` flips
 * it to the high-contrast filled state for the single positive action
 * per row (e.g. "Set up .venv", "Create").
 */
export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }

  &[data-variant="primary"] {
    background: var(--studio-text-primary);
    border-color: var(--studio-text-primary);
    color: var(--studio-bg-main);
    &:hover {
      opacity: 0.88;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
