import type { ReactNode } from "react";

export type ToolStatus = "pending" | "running" | "done" | "error";

export interface ToolCallData {
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: string;
  status?: ToolStatus;
  error?: string;
}

export interface ToolDescriptor {
  label: string;
  icon: (props: { size?: number }) => ReactNode;
  summarize: (input: Record<string, unknown>) => string;
  hint?: (input: Record<string, unknown>) => string | undefined;
}
