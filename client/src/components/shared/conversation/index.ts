export { ConversationView } from "./conversation-view";
export {
  ChatComposer,
  ComposerShell,
  ComposerTextarea,
  ComposerToolbar,
  SendButton,
  useComposerState,
  useTextareaAutoResize,
  VARIANT_DEFAULTS,
  type ChatComposerProps,
  type ChatComposerVariant,
  type SendShortcut,
} from "./chat-composer";
export { MessageList } from "./message-list";
export {
  MessageBubble,
  BubbleShell,
  BubbleHeader,
  BubbleBody,
  BubbleActions,
  BubbleAttachments,
  SystemPill,
  ThinkingBubble,
  formatTime,
  useCopy,
  bubbleTokens,
  resolveVariant,
} from "./message";
export type {
  ShellTone,
  BubbleVariant,
  BubbleAttachment,
  ConversationMessage,
} from "./message";
export { useAutoScroll } from "./hooks/use-auto-scroll";
export {
  ToolCard,
  ToolHeader,
  ToolBody,
  ToolStatusDot,
  describeTool,
} from "./tool-call";
export type { ToolCallData, ToolStatus, ToolDescriptor } from "./tool-call";
export {
  AttachmentPickerButton,
  AttachmentChip,
  PendingAttachmentList,
  AttachmentPreviewModal,
  useComposerAttachments,
  useDropZone,
  kindFromName,
  toBubbleAttachments,
  formatAttachmentPromptBlock,
} from "./attachments";
export type {
  AttachmentRecord,
  AttachmentKind,
  PendingAttachment,
  PendingStatus,
} from "./attachments";
