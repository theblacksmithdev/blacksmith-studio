import { api as raw } from "../client";
import type {
  ClaudeCancelInput,
  ClaudeMessageEvent,
  ClaudeToolUseEvent,
  ClaudeDoneEvent,
  ClaudeErrorEvent,
} from "../types";

export const claude = {
  sendPrompt: (input: {
    projectId: string;
    sessionId: string;
    prompt: string;
  }) => raw.invoke<void>("claude:sendPrompt", input),
  cancel: (input: ClaudeCancelInput) =>
    raw.invoke<void>("claude:cancel", input),

  onMessage: (cb: (data: ClaudeMessageEvent) => void) =>
    raw.subscribe("claude:onMessage", cb),
  onToolUse: (cb: (data: ClaudeToolUseEvent) => void) =>
    raw.subscribe("claude:onToolUse", cb),
  onDone: (cb: (data: ClaudeDoneEvent) => void) =>
    raw.subscribe("claude:onDone", cb),
  onError: (cb: (data: ClaudeErrorEvent) => void) =>
    raw.subscribe("claude:onError", cb),
} as const;
