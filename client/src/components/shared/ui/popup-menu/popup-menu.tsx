import { type ReactNode } from "react";
import { Menu as ChakraMenu, Portal } from "@chakra-ui/react";
import styled from "@emotion/styled";

export type PopupMenuPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "right"
  | "right-start"
  | "right-end"
  | "left"
  | "left-start"
  | "left-end";

interface BaseProps {
  /**
   * Menu content — compose with `PopupMenuItem`, `PopupMenuSeparator`,
   * and `PopupMenuLabel` exported from this module, or pass arbitrary
   * Chakra Menu primitives for custom layouts (e.g.
   * `ChakraMenu.RadioItemGroup`).
   */
  children: ReactNode;
  placement?: PopupMenuPlacement;
  /** Content background. Defaults to the sidebar surface token. */
  background?: string;
  /** Minimum content width (default 240). */
  minWidth?: number | string;
  /** Distance in pixels between trigger/anchor and content (default 4). */
  gutter?: number;
  /** Optional max height — enables vertical scrolling when exceeded. */
  maxHeight?: number | string;
  /** Inner padding in pixels (default 6). */
  padding?: number;
  /** Border radius in pixels (default 10). */
  radius?: number;
}

interface TriggerProps extends BaseProps {
  /**
   * The element that opens the menu on click. Must be a ref-forwarding
   * element (a plain `styled.button`, a Chakra primitive, etc.) — it
   * renders as the `ChakraMenu.Trigger asChild` child, so Chakra needs
   * the ref to position the menu.
   */
  trigger: ReactNode;
  anchor?: never;
  onClose?: never;
}

interface AnchorProps extends BaseProps {
  /**
   * Virtual-anchor mode — position the menu at a screen coordinate
   * (e.g. right-click / cursor menus). When set, the menu is open
   * while mounted and calls `onClose` when dismissed.
   */
  anchor: { x: number; y: number };
  onClose: () => void;
  trigger?: never;
}

export type PopupMenuProps = TriggerProps | AnchorProps;

export function PopupMenu(props: PopupMenuProps) {
  const {
    children,
    placement = "bottom-start",
    background,
    minWidth = 240,
    gutter = 4,
    maxHeight,
    padding = 6,
    radius = 10,
  } = props;

  const isAnchor = "anchor" in props && props.anchor !== undefined;

  const contentStyle = {
    minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth,
    padding: `${padding}px`,
    borderRadius: `${radius}px`,
    ...(background ? { background } : {}),
    ...(maxHeight !== undefined
      ? {
          maxHeight:
            typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
          overflowY: "auto" as const,
        }
      : {}),
  };

  const positioning = isAnchor
    ? {
        placement,
        gutter,
        getAnchorRect: () => ({
          x: props.anchor.x,
          y: props.anchor.y,
          width: 0,
          height: 0,
        }),
      }
    : { placement, gutter };

  const rootProps = isAnchor
    ? {
        open: true,
        onOpenChange: (e: { open: boolean }) => {
          if (!e.open) props.onClose();
        },
      }
    : {};

  return (
    <ChakraMenu.Root
      positioning={positioning}
      lazyMount
      unmountOnExit
      {...rootProps}
    >
      {!isAnchor && (
        <ChakraMenu.Trigger asChild>{props.trigger}</ChakraMenu.Trigger>
      )}
      <Portal>
        <ChakraMenu.Positioner>
          <Content style={contentStyle}>{children}</Content>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>
  );
}

const Content = styled(ChakraMenu.Content)`
  background: var(--studio-bg-sidebar);
  border: 1px solid var(--studio-border-hover);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
  z-index: 1000;
  outline: none;
  /* Clip rounded corners. Inline \`overflowY: auto\` from maxHeight
     overrides the y-axis while x stays hidden. */
  overflow: hidden;
  animation: popupMenuIn 140ms cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes popupMenuIn {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const PopupMenuItem = styled(ChakraMenu.Item)`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--studio-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  outline: none;
  transition:
    background 0.12s ease,
    transform 0.12s ease;

  &:hover,
  &[data-highlighted] {
    background: var(--studio-bg-hover);
  }

  &:active {
    transform: translateY(0.5px);
  }

  &[data-disabled] {
    opacity: 0.4;
    cursor: default;
  }
`;

export const PopupMenuSeparator = styled(ChakraMenu.Separator)`
  height: 1px;
  background: var(--studio-border);
  margin: 4px 6px;
  border: none;
  opacity: 0.6;
`;

export const PopupMenuLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
  padding: 8px 10px 6px;
`;
