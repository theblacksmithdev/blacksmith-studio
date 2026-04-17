import { api as raw } from "../client";
import type {
  ClaudeCancelInput,
  ClaudeMessageEvent,
  ClaudeToolUseEvent,
  ClaudeDoneEvent,
  ClaudeErrorEvent,
} from "../types";

export const singleAgent = {
  sendPrompt: (input: {
    projectId: string;
    sessionId: string;
    prompt: string;
  }) => raw.invoke<void>("singleAgent:sendPrompt", input),
  cancel: (input: ClaudeCancelInput) =>
    raw.invoke<void>("singleAgent:cancel", input),

  onMessage: (cb: (data: ClaudeMessageEvent) => void) =>
    raw.subscribe("singleAgent:onMessage", cb),
  onToolUse: (cb: (data: ClaudeToolUseEvent) => void) =>
    raw.subscribe("singleAgent:onToolUse", cb),
  onDone: (cb: (data: ClaudeDoneEvent) => void) =>
    raw.subscribe("singleAgent:onDone", cb),
  onError: (cb: (data: ClaudeErrorEvent) => void) =>
    raw.subscribe("singleAgent:onError", cb),
} as const;
