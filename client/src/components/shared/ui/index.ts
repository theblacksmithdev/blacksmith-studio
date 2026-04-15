// Blacksmith Studio — Design System
// UI primitives built on Chakra UI with locked design tokens.

// ── Tokens ──
export { spacing, radii, sizes, shadows } from "./tokens";
export type { Spacing, Radii } from "./tokens";

// ── Typography ──
export { Text } from "./typography";
export type { TextVariant, TextColor } from "./typography";

// ── Actions ──
export { Button } from "./button";
export type { ButtonVariant, ButtonSize } from "./button";

export { IconButton } from "./icon-button";
export type { IconButtonVariant, IconButtonSize } from "./icon-button";

export { Chip } from "./chip";
export type { ChipVariant } from "./chip";

// ── Data display ──
export { Badge } from "./badge";
export type { BadgeVariant, BadgeSize } from "./badge";

export { StatusDot } from "./status-dot";
export type { DotStatus, DotSize } from "./status-dot";

export { Avatar } from "./avatar";
export type { AvatarSize, AvatarVariant } from "./avatar";

// ── Surfaces ──
export { Card } from "./card";
export type { CardVariant } from "./card";

export {
  Modal,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalDangerButton,
  ModalFooterSpacer,
} from "./modal";

export { Drawer } from "./drawer";
export type { DrawerPlacement } from "./drawer";

export { ConfirmDialog } from "./confirm-dialog";
export type { ConfirmDialogVariant } from "./confirm-dialog";

// ── Forms ──
export { Input } from "./input";
export type { InputSize } from "./input";

export { Textarea } from "./textarea";
export type { TextareaSize } from "./textarea";

// ── Layout ──
export { Stack, HStack, VStack } from "./stack";

export { Toolbar, ToolbarDivider, ToolbarSpacer } from "./toolbar";
export type { ToolbarVariant } from "./toolbar";

export { Divider } from "./divider";
export type { DividerVariant } from "./divider";

// ── Feedback ──
export { Alert } from "./alert";
export type { AlertVariant } from "./alert";

export { Skeleton, SkeletonRow, SkeletonList } from "./skeleton";
export type { SkeletonVariant } from "./skeleton";

// ── Data ──
export { InfiniteScrollList } from "./infinite-scroll-list";
export type { InfiniteScrollListProps } from "./infinite-scroll-list";

// ── Menus ──
export { Menu } from "./menu";
export type { MenuProps, MenuOption } from "./menu";

// ── Composite ──
export { EmptyState } from "./empty-state";

export { ListItem } from "./list-item";

export { Tooltip } from "./tooltip";

export { KeyboardHint } from "./keyboard-hint";

// ── Brand ──
export { Logo } from "./logo";
export type { LogoVariant } from "./logo";

// ── Illustrations ──
export { ForgeBg } from "./forge-bg";
export type { ForgeBgVariant } from "./forge-bg";
