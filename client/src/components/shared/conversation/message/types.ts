import type { ReactNode } from "react";

export type BubbleVariant =
  | "user"
  | "assistant"
  | "agent"
  | "system"
  | "error"
  | "thinking";

export interface BubbleAttachment {
  id: string;
  name: string;
  kind?: "file" | "image" | "link" | "code";
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  meta?: string;
}

export interface ConversationMessage {
  id: string;
  role: string;
  variant?: BubbleVariant;
  content: string;
  senderName?: string;
  senderIcon?: ReactNode;
  senderAccent?: string;
  timestamp?: string;
  isStreaming?: boolean;
  error?: string;
  attachments?: BubbleAttachment[];
  footer?: ReactNode;
  metadata?: ReactNode;
}

export function resolveVariant(msg: ConversationMessage): BubbleVariant {
  if (msg.variant) return msg.variant;
  if (msg.error) return "error";
  if (msg.isStreaming && !msg.content.trim()) return "thinking";
  if (msg.role === "user") return "user";
  if (msg.role === "system") return "system";
  if (msg.role === "agent") return "agent";
  return "assistant";
}
