import styled from "@emotion/styled";
import { Menu as ChakraMenu } from "@chakra-ui/react";

/* ── Trigger (sidebar avatar button) ────────────────────────── */

export const AvatarBtn = styled.button<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ expanded }) => (expanded ? "10px" : "0")};
  width: 100%;
  height: 36px;
  padding: ${({ expanded }) => (expanded ? "0 10px" : "0")};
  justify-content: ${({ expanded }) => (expanded ? "flex-start" : "center")};
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--studio-text-tertiary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-surface);
    color: var(--studio-text-secondary);
  }
`;

export const Avatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--studio-bg-hover);
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--studio-text-muted);
`;

export const AvatarLabel = styled.span<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  width: ${({ visible }) => (visible ? "auto" : "0")};
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.15s ease;
`;

/* ── Popover surface ────────────────────────────────────────── */

export const PopoverContent = styled(ChakraMenu.Content)`
  width: 280px;
  padding: 0;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border-hover);
  border-radius: 14px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 12px 36px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  z-index: 1000;
  outline: none;
  animation: userMenuFadeIn 0.14s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes userMenuFadeIn {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

/* ── Header ─────────────────────────────────────────────────── */

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 12px;
  border-bottom: 1px solid var(--studio-border);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--studio-accent) 5%, transparent) 0%,
    transparent 100%
  );
`;

export const HeaderLogoSlot = styled.div`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0
    color-mix(in srgb, var(--studio-text-primary) 8%, transparent);
`;

export const HeaderText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const HeaderTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.005em;
`;

export const HeaderCaption = styled.div`
  font-size: 10.5px;
  color: var(--studio-text-muted);
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

/* ── Sections (flat list, one row per settings group) ───────── */

export const Sections = styled.div`
  padding: 6px;
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--studio-scrollbar, var(--studio-border));
    border-radius: 3px;
  }
`;

/* ── Items ──────────────────────────────────────────────────── */

export const Item = styled(ChakraMenu.Item)<{ "data-danger"?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: ${(p) =>
    p["data-danger"]
      ? "var(--studio-error)"
      : "var(--studio-text-secondary)"};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;
  text-align: left;
  outline: none;

  &:hover,
  &[data-highlighted] {
    background: ${(p) =>
      p["data-danger"]
        ? "var(--studio-error-subtle, rgba(255,0,0,0.08))"
        : "var(--studio-bg-hover)"};
    color: ${(p) =>
      p["data-danger"]
        ? "var(--studio-error)"
        : "var(--studio-text-primary)"};
  }

  & svg {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }
`;

export const ItemLabel = styled.span`
  flex: 1;
  min-width: 0;
  font-weight: 500;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* ── Brand-link row (subtle chips at the bottom) ────────────── */

export const BrandRow = styled.div`
  display: flex;
  gap: 6px;
  padding: 8px;
  border-top: 1px solid var(--studio-border);
  background: color-mix(in srgb, var(--studio-bg-inset, var(--studio-bg-main)) 60%, transparent);
`;

export const BrandChip = styled.a`
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-tertiary);
  text-decoration: none;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: -0.002em;
  cursor: pointer;
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    color 0.12s ease,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
    transform: translateY(-1px);
  }

  & svg {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    color: var(--studio-text-muted);
  }

  &:hover svg {
    color: var(--studio-text-secondary);
  }

  &:hover .brand-chip-arrow {
    opacity: 0.9;
    transform: translate(2px, -2px);
  }
`;

export const BrandChipLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BrandChipArrow = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  opacity: 0.5;
  transition:
    opacity 0.15s ease,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

