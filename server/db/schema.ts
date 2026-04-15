import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Projects — registered project directories.
 */
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull().unique(),
  createdAt: text("created_at").notNull(),
  lastOpenedAt: text("last_opened_at").notNull(),
});

/**
 * Sessions — a conversation thread, scoped to a project.
 */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * Messages — individual messages within a session.
 */
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

/**
 * Tool calls — tool invocations within a message.
 */
export const toolCalls = sqliteTable("tool_calls", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  toolId: text("tool_id").notNull(),
  toolName: text("tool_name").notNull(),
  input: text("input").notNull(),
  output: text("output"),
});

/**
 * Settings — key-value store, scoped to a project.
 */
export const settings = sqliteTable("settings", {
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

/**
 * Global settings — app-level key-value store, not scoped to any project.
 * Project-level settings always override these when both exist.
 */
export const globalSettings = sqliteTable("global_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/**
 * Agent conversations — a conversation thread in the agents panel.
 */
export const agentConversations = sqliteTable("agent_conversations", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * Agent dispatches — a PM dispatch session (prompt → plan → task executions).
 */
export const agentDispatches = sqliteTable("agent_dispatches", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id").references(
    () => agentConversations.id,
    { onDelete: "cascade" },
  ),
  prompt: text("prompt").notNull(),
  planMode: text("plan_mode").notNull(), // 'single' | 'multi' | 'clarification'
  planSummary: text("plan_summary").notNull(),
  status: text("status").notNull(), // 'planning' | 'executing' | 'completed' | 'failed' | 'cancelled'
  totalCostUsd: text("total_cost_usd").notNull(),
  totalDurationMs: integer("total_duration_ms").notNull(),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

/**
 * Agent tasks — individual tasks within a dispatch.
 */
export const agentTasks = sqliteTable("agent_tasks", {
  id: text("id").primaryKey(),
  dispatchId: text("dispatch_id")
    .notNull()
    .references(() => agentDispatches.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  role: text("role").notNull(),
  prompt: text("prompt").notNull(),
  status: text("status").notNull(), // 'pending' | 'running' | 'done' | 'error' | 'skipped'
  /** 'main' = PM-assigned task, 'subtask' = agent decomposed, 'bugfix' = QA escalation */
  taskType: text("task_type"),
  /** Parent task ID if this is a decomposed sub-task */
  parentTaskId: text("parent_task_id"),
  orderIndex: integer("order_index").notNull(),
  executionId: text("execution_id"),
  sessionId: text("session_id"), // Claude CLI session ID for resumption
  responseText: text("response_text"),
  error: text("error"),
  costUsd: text("cost_usd"),
  durationMs: integer("duration_ms"),
});

/**
 * Runner configs — per-project dev server configurations.
 * Each row defines one runnable service (frontend, backend, worker, etc.)
 */
export const runnerConfigs = sqliteTable("runner_configs", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  command: text("command").notNull(),
  setupCommand: text("setup_command"),
  cwd: text("cwd").default("."),
  port: integer("port"),
  portArg: text("port_arg"),
  env: text("env").default("{}"),
  readyPattern: text("ready_pattern"),
  previewUrl: text("preview_url"),
  icon: text("icon").default("terminal"),
  sortOrder: integer("sort_order").default(0),
  autoDetected: integer("auto_detected", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull(),
});

/**
 * Agent chat messages — conversation history in the agents panel.
 */
export const agentChatMessages = sqliteTable("agent_chat_messages", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'agent' | 'system'
  agentRole: text("agent_role"), // which agent sent it (null for user/system)
  content: text("content").notNull(),
  conversationId: text("conversation_id").references(
    () => agentConversations.id,
    { onDelete: "cascade" },
  ),
  dispatchId: text("dispatch_id"), // links to the dispatch this message relates to
  timestamp: text("timestamp").notNull(),
});
