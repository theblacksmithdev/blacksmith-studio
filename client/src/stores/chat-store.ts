import { create } from "zustand";
import type { Message, ToolCall } from "@/types";

interface ChatState {
  isStreaming: boolean;
  partialMessage: string | null;
  currentToolCalls: ToolCall[];
  /**
   * Optimistic in-flight messages: the user prompt and finalized assistant
   * response that haven't yet been confirmed by a React Query refetch.
   * Cleared automatically once `useSessionQuery` returns updated data.
   */
  pendingMessages: Message[];

  addPendingUserMessage: (text: string) => void;
  appendPendingAssistantMessage: (text: string, toolCalls?: ToolCall[]) => void;
  clearPendingMessages: () => void;
  updateStreamingMessage: (text: string) => void;
  addToolCall: (toolCall: ToolCall) => void;
  setStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isStreaming: false,
  partialMessage: null,
  currentToolCalls: [],
  pendingMessages: [],

  addPendingUserMessage: (text) =>
    set((s) => ({
      pendingMessages: [
        ...s.pendingMessages,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  appendPendingAssistantMessage: (text, toolCalls) =>
    set((s) => ({
      pendingMessages: [
        ...s.pendingMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: text,
          toolCalls:
            toolCalls ??
            (s.currentToolCalls.length > 0
              ? [...s.currentToolCalls]
              : undefined),
          timestamp: new Date().toISOString(),
        },
      ],
      partialMessage: null,
      currentToolCalls: [],
      isStreaming: false,
    })),

  clearPendingMessages: () => set({ pendingMessages: [] }),

  updateStreamingMessage: (text) => set({ partialMessage: text }),

  addToolCall: (toolCall) =>
    set((s) => ({ currentToolCalls: [...s.currentToolCalls, toolCall] })),

  setStreaming: (isStreaming) => set({ isStreaming }),
}));
