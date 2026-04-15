import styled from "@emotion/styled";

export const NavButton = styled.button<{ active: boolean; expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ expanded }) => (expanded ? "10px" : "0")};
  width: ${({ expanded }) => (expanded ? "100%" : "36px")};
  height: 36px;
  padding: ${({ expanded }) => (expanded ? "0 10px" : "0")};
  justify-content: ${({ expanded }) => (expanded ? "flex-start" : "center")};
  border-radius: 8px;
  border: none;
  background: ${({ active }) =>
    active ? "var(--studio-bg-hover)" : "transparent"};
  color: ${({ active }) =>
    active ? "var(--studio-text-primary)" : "var(--studio-text-tertiary)"};
  font-size: 14px;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  white-space: nowrap;
  margin: ${({ expanded }) => (expanded ? "0" : "0 auto")};

  &:hover {
    background: ${({ active }) =>
      active ? "var(--studio-bg-hover)" : "var(--studio-bg-surface)"};
    color: ${({ active }) =>
      active ? "var(--studio-text-primary)" : "var(--studio-text-secondary)"};
  }
`;

export const NavLabel = styled.span<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  width: ${({ visible }) => (visible ? "auto" : "0")};
  transition: opacity 0.15s ease;
  overflow: hidden;
  text-overflow: ellipsis;
`;
