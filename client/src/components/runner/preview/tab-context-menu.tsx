import { Menu as ChakraMenu, Portal } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Copy, ExternalLink, RotateCw } from "lucide-react";

interface TabContextMenuProps {
  /** Cursor coords where the right-click fired. Virtual-anchor positioning. */
  x: number;
  y: number;
  /** Preview url of the tab. If null, reload is available but the URL-specific actions aren't. */
  url: string | null;
  /** Service name used for the copy feedback. */
  onReload: () => void;
  onClose: () => void;
}

/**
 * Right-click context menu for a preview tab. Renders at the cursor's
 * position via a virtual anchor rect so it feels like a native
 * platform context menu rather than a dropdown anchored to the tab.
 */
export function TabContextMenu({
  x,
  y,
  url,
  onReload,
  onClose,
}: TabContextMenuProps) {
  const handleOpen = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard blocked — silently ignore, user can try again */
    }
    onClose();
  };

  return (
    <ChakraMenu.Root
      open
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      positioning={{
        placement: "bottom-start",
        getAnchorRect: () => ({ x, y, width: 0, height: 0 }),
      }}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <ChakraMenu.Positioner>
          <StyledContent>
            <StyledItem
              value="reload"
              onClick={() => {
                onReload();
                onClose();
              }}
            >
              <RotateCw size={14} />
              Reload
            </StyledItem>
            <StyledItem
              value="open"
              onClick={handleOpen}
              disabled={!url}
            >
              <ExternalLink size={14} />
              Open in new window
            </StyledItem>
            <StyledItem
              value="copy"
              onClick={handleCopy}
              disabled={!url}
            >
              <Copy size={14} />
              Copy URL
            </StyledItem>
          </StyledContent>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>
  );
}

const StyledContent = styled(ChakraMenu.Content)`
  min-width: 180px;
  padding: 4px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border-hover);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  z-index: 1000;
  outline: none;
  animation: ctxMenuIn 0.1s ease;

  @keyframes ctxMenuIn {
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

const StyledItem = styled(ChakraMenu.Item)`
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
  outline: none;

  &:hover,
  &[data-highlighted] {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }

  &[data-disabled] {
    opacity: 0.4;
    cursor: default;
  }

  & svg {
    flex-shrink: 0;
    color: var(--studio-text-muted);
  }

  &:hover svg,
  &[data-highlighted] svg {
    color: var(--studio-text-secondary);
  }
`;
