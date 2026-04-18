import { getDatabase, type Database } from "../../../db/index.js";
import {
  MessageRepository,
  ToolCallRepository,
} from "../single-agent/index.js";
import {
  ArtifactTracer,
  type ConversationArtifact,
} from "./artifact-tracer.js";
import { formatDispatchHistory } from "./dispatch-history-formatter.js";
import {
  ChatMessageRepository,
  ConversationRepository,
  DispatchRepository,
  TaskDependencyRepository,
  TaskNoteRepository,
  TaskRepository,
  type TaskDependency,
} from "./repositories/index.js";
import {
  ChatService,
  ConversationService,
  DispatchService,
  NoteService,
  type TaskNoteRecord,
} from "./services/index.js";
import type {
  AgentChatRecord,
  AgentDispatchRecord,
  ChatAttachmentInput,
  ConversationRecord,
  ConversationSummary,
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
export interface TaskContext {
  taskId: string;
  dispatchId: string;
  projectId: string;
  conversationId: string | null;
  role: string;
}

export class AgentSessionManager {
  private readonly conversations: ConversationService;
  private readonly dispatches: DispatchService;
  private readonly chat: ChatService;
  private readonly tracer: ArtifactTracer;
  private readonly notes: NoteService;
  // Repositories kept as fields for the narrow read paths (context
  // resolution + dependency graph) exposed to the IPC/MCP layer.
  private readonly taskRepo: TaskRepository;
  private readonly dispatchRepo: DispatchRepository;
  private readonly dependencyRepo: TaskDependencyRepository;

  constructor(db: Database = getDatabase()) {
    const conversationRepo = new ConversationRepository(db);
    const dispatchRepo = new DispatchRepository(db);
    const taskRepo = new TaskRepository(db);
    const chatRepo = new ChatMessageRepository(db);
    const dependencyRepo = new TaskDependencyRepository(db);
    const noteRepo = new TaskNoteRepository(db);
    // Repositories from the single-chat domain — the artifact tracer's
    // final edges read the message + tool_call tables to resolve the
    // files each task's agent actually touched.
    const messageRepo = new MessageRepository(db);
    const toolCallRepo = new ToolCallRepository(db);

    this.taskRepo = taskRepo;
    this.dispatchRepo = dispatchRepo;
    this.dependencyRepo = dependencyRepo;

    this.conversations = new ConversationService(conversationRepo, chatRepo);
    this.dispatches = new DispatchService(dispatchRepo, taskRepo);
    this.chat = new ChatService(chatRepo, this.conversations);
    this.notes = new NoteService(noteRepo);
    this.tracer = new ArtifactTracer(
      dispatchRepo,
      taskRepo,
      messageRepo,
      toolCallRepo,
    );
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

  /**
   * Remember the PM's Claude session id for this conversation so subsequent
   * user messages resume with full history instead of starting fresh.
   */
  setConversationPMSession(conversationId: string, pmSessionId: string): void {
    this.conversations.setPMSession(conversationId, pmSessionId);
  }

  /** Cache the PM's latest plan summary on the conversation row. */
  setConversationPlanSummary(conversationId: string, summary: string): void {
    this.conversations.setLastPlanSummary(conversationId, summary);
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
    attachments?: ChatAttachmentInput[],
  ): AgentChatRecord {
    return this.chat.add(
      projectId,
      role,
      content,
      agentRole,
      dispatchId,
      conversationId,
      attachments,
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

  /* ── Cross-domain: files touched during a conversation ── */

  /**
   * Trace every file the team's agents wrote or edited while working on
   * an agent conversation. Reads across the agent and single-chat schemas
   * — see {@link ArtifactTracer} for the full pipeline.
   */
  getConversationArtifacts(conversationId: string): ConversationArtifact[] {
    return this.tracer.getArtifacts(conversationId);
  }

  /* ── Context resolution (for event-log stamping + MCP tools) ── */

  /**
   * Resolve the dispatch/conversation context for a task. Returns null
   * if the task doesn't exist. The event-log pipeline uses this to
   * stamp `task_status` / streaming events with `dispatchId` +
   * `conversationId` without threading them through the agent runtime.
   */
  resolveTaskContext(taskId: string): TaskContext | null {
    const task = this.taskRepo.findById(taskId);
    if (!task) return null;
    const dispatch = this.dispatchRepo.findById(task.dispatchId);
    if (!dispatch) return null;
    return {
      taskId: task.id,
      dispatchId: task.dispatchId,
      projectId: dispatch.projectId,
      conversationId: dispatch.conversationId ?? null,
      role: task.role,
    };
  }

  resolveDispatchContext(
    dispatchId: string,
  ): { projectId: string; conversationId: string | null } | null {
    const dispatch = this.dispatchRepo.findById(dispatchId);
    if (!dispatch) return null;
    return {
      projectId: dispatch.projectId,
      conversationId: dispatch.conversationId ?? null,
    };
  }

  /* ── Task dependencies ── */

  addTaskDependencies(taskId: string, dependsOnTaskIds: string[]): void {
    this.dependencyRepo.insertMany(
      dependsOnTaskIds.map((dependsOnTaskId) => ({
        taskId,
        dependsOnTaskId,
      })),
    );
  }

  listTaskDependencies(taskId: string): TaskDependency[] {
    return this.dependencyRepo.listDependenciesOf(taskId);
  }

  listDependenciesForDispatch(dispatchId: string): TaskDependency[] {
    const tasks = this.taskRepo.listByDispatch(dispatchId);
    return this.dependencyRepo.listForTasks(tasks.map((t) => t.id));
  }

  /* ── Task notes (agent-authored breadcrumbs) ── */

  addTaskNote(
    taskId: string,
    authorRole: string,
    content: string,
  ): TaskNoteRecord {
    return this.notes.add(taskId, authorRole, content);
  }

  listTaskNotes(taskId: string): TaskNoteRecord[] {
    return this.notes.listForTask(taskId);
  }
}
