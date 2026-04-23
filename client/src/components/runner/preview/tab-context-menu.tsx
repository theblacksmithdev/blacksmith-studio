import styled from "@emotion/styled";
import { Copy, ExternalLink, RotateCw } from "lucide-react";
import { PopupMenu, PopupMenuItem } from "@/components/shared/ui";

interface TabContextMenuProps {
  /** Cursor coords where the right-click fired. */
  x: number;
  y: number;
  /** Preview url of the tab. If null, reload is available but the URL-specific actions aren't. */
  url: string | null;
  onReload: () => void;
  onClose: () => void;
}

/**
 * Right-click context menu for a preview tab. Uses PopupMenu's virtual
 * anchor mode so it feels like a native platform context menu rather
 * than a dropdown anchored to the tab.
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
    <PopupMenu
      anchor={{ x, y }}
      onClose={onClose}
      placement="bottom-start"
      minWidth={180}
      padding={4}
    >
      <Item
        value="reload"
        onClick={() => {
          onReload();
          onClose();
        }}
      >
        <RotateCw size={14} />
        Reload
      </Item>
      <Item value="open" onClick={handleOpen} disabled={!url}>
        <ExternalLink size={14} />
        Open in new window
      </Item>
      <Item value="copy" onClick={handleCopy} disabled={!url}>
        <Copy size={14} />
        Copy URL
      </Item>
    </PopupMenu>
  );
}

const Item = styled(PopupMenuItem)`
  padding: 7px 10px;
  border-radius: 6px;
  color: var(--studio-text-secondary);
  font-size: 13px;

  &:hover,
  &[data-highlighted] {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
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
