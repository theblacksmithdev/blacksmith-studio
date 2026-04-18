import type { ContextQueryService } from "./context-query-service.js";
import type { ContextWriteService } from "./context-write-service.js";
import type { ContextToolDefinition } from "./types.js";

export interface ToolHandler {
  definition: ContextToolDefinition;
  execute: (args: Record<string, unknown>) => unknown;
}

/**
 * Declarative registry of every tool the Context MCP server exposes.
 * Centralising the JSON Schemas here (rather than scattering them near
 * handlers) keeps the server.ts transport layer free of business logic
 * and makes adding a new tool a one-entry edit.
 */
export function buildToolRegistry(
  query: ContextQueryService,
  write: ContextWriteService,
): Record<string, ToolHandler> {
  return {
    query_conversation_history: {
      definition: {
        name: "query_conversation_history",
        description:
          "Return the most recent messages from a conversation. Use this to understand what the user and other agents have said before your task began.",
        inputSchema: {
          type: "object",
          properties: {
            conversationId: { type: "string" },
            scope: {
              type: "string",
              enum: ["single_chat", "agent_chat"],
              description:
                "single_chat for standalone sessions, agent_chat for multi-agent team conversations",
            },
            limit: { type: "number", default: 50 },
          },
          required: ["conversationId", "scope"],
        },
      },
      execute: (args) =>
        query.queryConversationHistory(args as never),
    },

    query_dispatch_tasks: {
      definition: {
        name: "query_dispatch_tasks",
        description:
          "List every task in a dispatch, with status, role, and response text where available. Use this to see what other agents in the team were asked to do.",
        inputSchema: {
          type: "object",
          properties: { dispatchId: { type: "string" } },
          required: ["dispatchId"],
        },
      },
      execute: (args) => query.queryDispatchTasks(args as never),
    },

    query_task_output: {
      definition: {
        name: "query_task_output",
        description:
          "Fetch the prompt, response text, error, cost/duration, and author notes for a specific task. Use this to inspect what an upstream agent produced before you build on it.",
        inputSchema: {
          type: "object",
          properties: { taskId: { type: "string" } },
          required: ["taskId"],
        },
      },
      execute: (args) => query.queryTaskOutput(args as never),
    },

    search_messages: {
      definition: {
        name: "search_messages",
        description:
          "Full-text LIKE search across persisted messages. Optionally scope to a single conversation or to single_chat / agent_chat only.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            conversationId: { type: "string" },
            scope: {
              type: "string",
              enum: ["single_chat", "agent_chat"],
            },
            limit: { type: "number", default: 20 },
          },
          required: ["query"],
        },
      },
      execute: (args) => query.searchMessages(args as never),
    },

    list_sessions: {
      definition: {
        name: "list_sessions",
        description: "List single-agent chat sessions in a project.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            limit: { type: "number", default: 20 },
          },
          required: ["projectId"],
        },
      },
      execute: (args) => query.listSessions(args as never),
    },

    list_conversations: {
      definition: {
        name: "list_conversations",
        description: "List multi-agent team conversations in a project.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            limit: { type: "number", default: 20 },
          },
          required: ["projectId"],
        },
      },
      execute: (args) => query.listConversations(args as never),
    },

    save_note: {
      definition: {
        name: "save_note",
        description:
          "Leave a breadcrumb note attached to a task so other agents (and humans) can pick up context later. Keep notes short and actionable.",
        inputSchema: {
          type: "object",
          properties: {
            taskId: { type: "string" },
            authorRole: {
              type: "string",
              description: "Your agent role (e.g. 'backend-engineer').",
            },
            content: { type: "string" },
          },
          required: ["taskId", "authorRole", "content"],
        },
      },
      execute: (args) => write.saveNote(args as never),
    },
  };
}
