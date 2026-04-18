import crypto from "node:crypto";
import {
  EventRepository,
  type EventInsert,
} from "./event-repository.js";
import type {
  AppendConversationEventInput,
  ConversationEvent,
  EventScope,
} from "./types.js";

/**
 * Business logic for the unified conversation event log.
 *
 * Single Responsibility: allocate a per-conversation monotonic sequence
 * number, serialize the payload, and persist one event row. Listing is
 * delegated straight to the repository — there's no additional domain
 * logic beyond (de)serialization (which the repo already handles on
 * read via JSON.parse).
 *
 * Both reload-fidelity (the UI replays these events to reconstruct a
 * conversation exactly as it streamed live) and the forever-kept
 * diagnostic trail share this one write path.
 */
export type ConversationEventListener = (event: ConversationEvent) => void;

export class ConversationEventService {
  private listeners: ConversationEventListener[] = [];

  constructor(private readonly repo: EventRepository) {}

  onAppend(listener: ConversationEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  append(input: AppendConversationEventInput): ConversationEvent {
    const sequence = this.repo.nextSequence(input.scope, input.conversationId);
    const timestamp = new Date().toISOString();
    const id = crypto.randomUUID();

    const row: EventInsert = {
      id,
      projectId: input.projectId,
      scope: input.scope,
      conversationId: input.conversationId,
      dispatchId: input.dispatchId ?? null,
      taskId: input.taskId ?? null,
      messageId: input.messageId ?? null,
      agentRole: input.agentRole ?? null,
      eventType: input.eventType,
      payload: JSON.stringify(input.payload ?? null),
      sequence,
      timestamp,
    };
    this.repo.insert(row);

    const event: ConversationEvent = {
      id,
      projectId: input.projectId,
      scope: input.scope,
      conversationId: input.conversationId,
      dispatchId: row.dispatchId,
      taskId: row.taskId,
      messageId: row.messageId,
      agentRole: row.agentRole,
      eventType: input.eventType,
      payload: input.payload ?? null,
      sequence,
      timestamp,
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("[conversation-events] listener error:", err);
      }
    }
    return event;
  }

  listByConversation(
    scope: EventScope,
    conversationId: string,
    afterSequence?: number,
    limit?: number,
  ): ConversationEvent[] {
    return this.repo.listByConversation(
      scope,
      conversationId,
      afterSequence,
      limit,
    );
  }

  listByDispatch(dispatchId: string): ConversationEvent[] {
    return this.repo.listByDispatch(dispatchId);
  }

  listByTask(taskId: string): ConversationEvent[] {
    return this.repo.listByTask(taskId);
  }
}
