import styled from "@emotion/styled";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
`;

export const Menu = styled.div`
  position: fixed;
  min-width: 210px;
  padding: 4px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border-hover);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  z-index: 1000;
  animation: ctxFadeIn 0.1s ease;

  @keyframes ctxFadeIn {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;
  text-align: left;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`;

export const DangerMenuItem = styled(MenuItem)`
  color: var(--studio-error);

  &:hover {
    background: var(--studio-error-subtle);
    color: var(--studio-error);
  }
`;

export const MenuDivider = styled.div`
  height: 1px;
  background: var(--studio-border);
  margin: 4px 6px;
`;

export const RenameInput = styled.input`
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--studio-border-hover);
  background: var(--studio-bg-main);
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: inherit;
  outline: none;

  &:focus {
    border-color: var(--studio-accent);
  }
`;
