import { api as raw } from "../client";
import type {
  ConversationEvent,
  ConversationEventsListInput,
} from "../types";

export const conversationEvents = {
  list: (input: ConversationEventsListInput) =>
    raw.invoke<ConversationEvent[]>("conversationEvents:list", input),

  listByDispatch: (dispatchId: string) =>
    raw.invoke<ConversationEvent[]>("conversationEvents:listByDispatch", {
      dispatchId,
    }),

  listByTask: (taskId: string) =>
    raw.invoke<ConversationEvent[]>("conversationEvents:listByTask", {
      taskId,
    }),

  onAppend: (cb: (event: ConversationEvent) => void) =>
    raw.subscribe("conversationEvents:onAppend", cb),
} as const;
