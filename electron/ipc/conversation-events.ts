import { ipcMain, type BrowserWindow } from "electron";
import type {
  ConversationEventService,
  EventScope,
} from "../../server/services/events/index.js";
import {
  CONVERSATION_EVENTS_LIST,
  CONVERSATION_EVENTS_LIST_BY_DISPATCH,
  CONVERSATION_EVENTS_LIST_BY_TASK,
  CONVERSATION_EVENTS_ON_APPEND,
} from "./channels.js";

/**
 * IPC handlers for the unified conversation event log.
 *
 * Reads route to the injected service; push is achieved by subscribing
 * once to `eventService.onAppend` and forwarding each appended event to
 * the renderer — so every emission point in the backend (single-agent
 * streaming, multi-agent dispatch, agent events) reaches the UI
 * without wiring per call site.
 */
export function setupConversationEventsIPC(
  getWindow: () => BrowserWindow | null,
  eventService: ConversationEventService,
): void {
  ipcMain.handle(
    CONVERSATION_EVENTS_LIST,
    (
      _e,
      data: {
        scope: EventScope;
        conversationId: string;
        afterSequence?: number;
        limit?: number;
      },
    ) =>
      eventService.listByConversation(
        data.scope,
        data.conversationId,
        data.afterSequence,
        data.limit,
      ),
  );

  ipcMain.handle(
    CONVERSATION_EVENTS_LIST_BY_DISPATCH,
    (_e, data: { dispatchId: string }) =>
      eventService.listByDispatch(data.dispatchId),
  );

  ipcMain.handle(
    CONVERSATION_EVENTS_LIST_BY_TASK,
    (_e, data: { taskId: string }) => eventService.listByTask(data.taskId),
  );

  eventService.onAppend((event) => {
    getWindow()?.webContents.send(CONVERSATION_EVENTS_ON_APPEND, event);
  });
}
