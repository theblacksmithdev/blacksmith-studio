import { getDatabase } from "../../db/index.js";
import { formatDispatchHistory } from "./dispatch-history-formatter.js";
import {
  ChatMessageRepository,
  ConversationRepository,
  DispatchRepository,
  TaskRepository,
} from "./repositories/index.js";
import {
  ChatService,
  ConversationService,
  DispatchService,
} from "./services/index.js";
import type {
  AgentChatRecord,
  AgentDispatchRecord,
  ConversationRecord,
  ConversationSummary,
  Database,
  SubTaskInput,
  TaskInput,
  TaskStatusUpdate,
} from "./types.js";

/**
 * Facade over the agent-sessions subsystem.
 *
 * Single Responsibility: composition + delegation. Every public method
 * routes to exactly one collaborator. The facade itself holds zero SQL
 * and zero domain logic.
 *
 * Dependency Inversion: accepts a Database handle (defaulting to the
 * shared Drizzle singleton). Tests can inject an in-memory instance.
 *
 * Public API is preserved byte-for-byte with the pre-refactor
 * AgentSessionManager so IPC handlers don't change.
 */
export class AgentSessionManager {
  private readonly conversations: ConversationService;
  private readonly dispatches: DispatchService;
  private readonly chat: ChatService;

  constructor(db: Database = getDatabase()) {
    const conversationRepo = new ConversationRepository(db);
    const dispatchRepo = new DispatchRepository(db);
    const taskRepo = new TaskRepository(db);
    const chatRepo = new ChatMessageRepository(db);

    this.conversations = new ConversationService(conversationRepo, chatRepo);
    this.dispatches = new DispatchService(dispatchRepo, taskRepo);
    this.chat = new ChatService(chatRepo, this.conversations);
  }

  /* ── Conversations ── */

  createConversation(projectId: string, title?: string): ConversationRecord {
    return this.conversations.create(projectId, title);
  }

  listConversations(projectId: string, limit = 50): ConversationSummary[] {
    return this.conversations.list(projectId, limit);
  }

  getConversation(conversationId: string): ConversationRecord | null {
    return this.conversations.getById(conversationId);
  }

  updateConversationTitle(conversationId: string, title: string): void {
    this.conversations.rename(conversationId, title);
  }

  touchConversation(conversationId: string): void {
    this.conversations.touch(conversationId);
  }

  deleteConversation(conversationId: string): void {
    this.conversations.remove(conversationId);
  }

  /* ── Dispatches ── */

  createDispatch(
    projectId: string,
    prompt: string,
    planMode: string,
    planSummary: string,
    tasks: TaskInput[],
    conversationId?: string,
  ): string {
    return this.dispatches.create(
      projectId,
      prompt,
      planMode,
      planSummary,
      tasks,
      conversationId,
    );
  }

  addSubTasks(
    dispatchId: string,
    parentTaskId: string,
    subtasks: SubTaskInput[],
  ): void {
    this.dispatches.addSubTasks(dispatchId, parentTaskId, subtasks);
  }

  updateDispatchStatus(
    dispatchId: string,
    status: string,
    totalCostUsd?: number,
    totalDurationMs?: number,
  ): void {
    this.dispatches.updateDispatchStatus(
      dispatchId,
      status,
      totalCostUsd,
      totalDurationMs,
    );
  }

  updateTaskStatus(
    taskId: string,
    status: string,
    data?: TaskStatusUpdate,
  ): void {
    this.dispatches.updateTaskStatus(taskId, status, data);
  }

  getDispatch(dispatchId: string): AgentDispatchRecord | null {
    return this.dispatches.getById(dispatchId);
  }

  listDispatches(projectId: string, limit = 50): AgentDispatchRecord[] {
    return this.dispatches.list(projectId, limit);
  }

  getLatestSessionForRole(projectId: string, role: string): string | null {
    return this.dispatches.latestSessionForRole(projectId, role);
  }

  getRecentDispatchContext(projectId: string, limit = 5): string {
    return formatDispatchHistory(this.dispatches.list(projectId, limit));
  }

  /* ── Chat Messages ── */

  addChatMessage(
    projectId: string,
    role: string,
    content: string,
    agentRole?: string,
    dispatchId?: string,
    conversationId?: string,
  ): AgentChatRecord {
    return this.chat.add(
      projectId,
      role,
      content,
      agentRole,
      dispatchId,
      conversationId,
    );
  }

  listChatMessages(
    projectId: string,
    conversationId?: string,
    limit = 200,
  ): AgentChatRecord[] {
    return this.chat.list(projectId, conversationId, limit);
  }

  clearChatMessages(projectId: string): void {
    this.chat.clear(projectId);
  }
}
