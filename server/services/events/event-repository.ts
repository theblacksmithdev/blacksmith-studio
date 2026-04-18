import { and, asc, eq, gt, max } from "drizzle-orm";
import { conversationEvents } from "../../db/schema.js";
import type { Database } from "../../db/index.js";
import type { ConversationEvent, EventScope, EventType } from "./types.js";

type EventRow = typeof conversationEvents.$inferSelect;

export interface EventInsert {
  id: string;
  projectId: string;
  scope: EventScope;
  conversationId: string;
  dispatchId: string | null;
  taskId: string | null;
  messageId: string | null;
  agentRole: string | null;
  eventType: EventType;
  payload: string;
  sequence: number;
  timestamp: string;
}

/**
 * DB access for the `conversation_events` table.
 *
 * Single Responsibility: row-level CRUD + the per-conversation
 * sequence-number read that the service layer needs to allocate the
 * next monotonic sequence. All (de)serialization of payload lives in
 * the service — the repository deals in JSON strings so it stays a
 * thin DB adapter.
 */
export class EventRepository {
  constructor(private readonly db: Database) {}

  insert(row: EventInsert): void {
    this.db.insert(conversationEvents).values(row).run();
  }

  nextSequence(scope: EventScope, conversationId: string): number {
    const row = this.db
      .select({ maxSeq: max(conversationEvents.sequence) })
      .from(conversationEvents)
      .where(
        and(
          eq(conversationEvents.scope, scope),
          eq(conversationEvents.conversationId, conversationId),
        ),
      )
      .get();

    return (row?.maxSeq ?? 0) + 1;
  }

  listByConversation(
    scope: EventScope,
    conversationId: string,
    afterSequence?: number,
    limit?: number,
  ): ConversationEvent[] {
    const conditions = [
      eq(conversationEvents.scope, scope),
      eq(conversationEvents.conversationId, conversationId),
    ];
    if (afterSequence != null) {
      conditions.push(gt(conversationEvents.sequence, afterSequence));
    }

    let query = this.db
      .select()
      .from(conversationEvents)
      .where(and(...conditions))
      .orderBy(asc(conversationEvents.sequence));

    if (limit != null) query = query.limit(limit) as typeof query;

    return query.all().map(mapEvent);
  }

  listByDispatch(dispatchId: string): ConversationEvent[] {
    return this.db
      .select()
      .from(conversationEvents)
      .where(eq(conversationEvents.dispatchId, dispatchId))
      .orderBy(asc(conversationEvents.sequence))
      .all()
      .map(mapEvent);
  }

  listByTask(taskId: string): ConversationEvent[] {
    return this.db
      .select()
      .from(conversationEvents)
      .where(eq(conversationEvents.taskId, taskId))
      .orderBy(asc(conversationEvents.sequence))
      .all()
      .map(mapEvent);
  }
}

function mapEvent(row: EventRow): ConversationEvent {
  let payload: unknown = null;
  try {
    payload = JSON.parse(row.payload);
  } catch {
    payload = row.payload;
  }
  return {
    id: row.id,
    projectId: row.projectId,
    scope: row.scope as EventScope,
    conversationId: row.conversationId,
    dispatchId: row.dispatchId,
    taskId: row.taskId,
    messageId: row.messageId,
    agentRole: row.agentRole,
    eventType: row.eventType as EventType,
    payload,
    sequence: row.sequence,
    timestamp: row.timestamp,
  };
}
