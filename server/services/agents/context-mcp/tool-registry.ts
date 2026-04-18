import type { ContextQueryService } from "./context-query-service.js";
import type { ContextWriteService } from "./context-write-service.js";
import type { ArtifactService } from "../../artifacts/index.js";
import type { CommandService, CommandSpec } from "../../commands/index.js";
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
  artifacts: ArtifactService,
  commands: CommandService,
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

    /* ── Artifact tools ── */

    list_artifacts: {
      definition: {
        name: "list_artifacts",
        description:
          "List markdown artifacts saved by agents under .blacksmith/artifacts/. Filter by conversation, role, tag, or title search.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            conversationId: { type: "string" },
            role: { type: "string" },
            tag: { type: "string" },
            search: { type: "string" },
            limit: { type: "number", default: 50 },
          },
          required: ["projectId"],
        },
      },
      execute: (args) => ({
        artifacts: artifacts.list(args as never),
      }),
    },

    read_artifact: {
      definition: {
        name: "read_artifact",
        description:
          "Read an artifact's full markdown body (without frontmatter) by its id.",
        inputSchema: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
      },
      execute: (args) => {
        const { id } = args as { id: string };
        const result = artifacts.readContent(id);
        if (!result) return { found: false };
        return { found: true, ...result };
      },
    },

    write_artifact: {
      definition: {
        name: "write_artifact",
        description:
          "Create a new artifact — writes markdown to .blacksmith/artifacts/{role}/ and indexes it. Use this to pin a discovery or reference document outside the normal task auto-save.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            role: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            conversationId: { type: "string" },
            dispatchId: { type: "string" },
            taskId: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
          },
          required: ["projectId", "role", "title", "content"],
        },
      },
      execute: (args) => artifacts.create(args as never),
    },

    update_artifact: {
      definition: {
        name: "update_artifact",
        description:
          "Overwrite an existing artifact's markdown body in place. Use this to refine a previous agent's output rather than creating a new artifact.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
            content: { type: "string" },
          },
          required: ["id", "content"],
        },
      },
      execute: (args) => {
        const { id, content } = args as { id: string; content: string };
        return artifacts.writeContent(id, content);
      },
    },

    tag_artifact: {
      definition: {
        name: "tag_artifact",
        description:
          "Set (replace) the tags on an artifact. Tags are free-form strings per project.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
          },
          required: ["id", "tags"],
        },
      },
      execute: (args) => {
        const { id, tags } = args as { id: string; tags: string[] };
        return artifacts.setTags(id, tags);
      },
    },

    rename_artifact: {
      definition: {
        name: "rename_artifact",
        description: "Rename an artifact (updates title + file on disk).",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
          },
          required: ["id", "title"],
        },
      },
      execute: (args) => {
        const { id, title } = args as { id: string; title: string };
        return artifacts.rename(id, title);
      },
    },

    delete_artifact: {
      definition: {
        name: "delete_artifact",
        description:
          "Hard delete an artifact — removes the DB row AND the file on disk. Cannot be undone.",
        inputSchema: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
      },
      execute: (args) => {
        const { id } = args as { id: string };
        artifacts.delete(id);
        return { ok: true, id };
      },
    },

    /* ── Command tools ── */

    list_toolchains: {
      definition: {
        name: "list_toolchains",
        description:
          "List every toolchain registered in the CommandService (Python, Node, Raw, …). Use this to discover which presets (pip, npm, …) are available before calling run_command.",
        inputSchema: { type: "object", properties: {} },
      },
      execute: () => ({ toolchains: commands.listToolchains() }),
    },

    check_command_available: {
      definition: {
        name: "check_command_available",
        description:
          "Check whether a toolchain's runtime is resolvable in this project (e.g. does `python` exist in a .venv?). Returns { ok, version?, error? }.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            toolchainId: {
              type: "string",
              description: "Toolchain id such as 'python' or 'node'.",
            },
          },
          required: ["projectId", "toolchainId"],
        },
      },
      execute: async (args) => {
        const { projectId, toolchainId } = args as {
          projectId: string;
          toolchainId: string;
        };
        return commands.checkAvailable({
          projectId,
          toolchainId,
          scope: "project",
        });
      },
    },

    resolve_command_env: {
      definition: {
        name: "resolve_command_env",
        description:
          "Inspect the environment a toolchain resolves to for a project — useful for 'which python is going to run?' debugging before calling run_command.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            toolchainId: { type: "string" },
          },
          required: ["projectId", "toolchainId"],
        },
      },
      execute: (args) => {
        const { projectId, toolchainId } = args as {
          projectId: string;
          toolchainId: string;
        };
        return (
          commands.resolveEnv({
            projectId,
            toolchainId,
            scope: "project",
          }) ?? { env: null }
        );
      },
    },

    run_command: {
      definition: {
        name: "run_command",
        description:
          "Run a subprocess through the unified CommandService — auto-resolves the correct interpreter from the project's venv / .nvmrc / poetry / etc., streams output, and records an audit row. Prefer this over raw Bash for python, pip, pytest, node, npm, npx, pnpm, yarn. Use `command` for non-preset invocations (make, pytest plugins, custom binaries). Always set `projectId`. Scope is fixed to the project — studio-scoped runs are not available to agents. Pass `description` to explain what you're running for the audit trail.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            preset: {
              type: "string",
              description:
                "One of the presets returned by list_toolchains (e.g. 'pip', 'npm', 'pytest'). Preferred over raw command.",
            },
            command: {
              type: "string",
              description: "Raw command when no preset fits. Ignored if preset is set.",
            },
            args: {
              type: "array",
              items: { type: "string" },
              description: "Command arguments, already tokenised.",
            },
            cwd: {
              type: "string",
              description: "Override working directory. Defaults to the project root.",
            },
            timeoutMs: { type: "number", default: 600000 },
            description: {
              type: "string",
              description: "Short rationale for the audit trail.",
            },
            conversationId: { type: "string" },
            taskId: { type: "string" },
            agentRole: { type: "string" },
          },
          required: ["projectId"],
        },
      },
      execute: async (args) => {
        const spec: CommandSpec = {
          scope: "project",
          projectId: String((args as { projectId: string }).projectId),
          preset:
            typeof (args as { preset?: string }).preset === "string"
              ? (args as { preset?: string }).preset
              : undefined,
          command:
            typeof (args as { command?: string }).command === "string"
              ? (args as { command?: string }).command
              : undefined,
          args: Array.isArray((args as { args?: unknown[] }).args)
            ? ((args as { args?: string[] }).args ?? []).map(String)
            : undefined,
          cwd:
            typeof (args as { cwd?: string }).cwd === "string"
              ? (args as { cwd?: string }).cwd
              : undefined,
          timeoutMs:
            typeof (args as { timeoutMs?: number }).timeoutMs === "number"
              ? (args as { timeoutMs?: number }).timeoutMs
              : 600_000,
          description:
            typeof (args as { description?: string }).description === "string"
              ? (args as { description?: string }).description
              : undefined,
          conversationId:
            typeof (args as { conversationId?: string }).conversationId ===
            "string"
              ? (args as { conversationId?: string }).conversationId
              : undefined,
          taskId:
            typeof (args as { taskId?: string }).taskId === "string"
              ? (args as { taskId?: string }).taskId
              : undefined,
          agentRole:
            typeof (args as { agentRole?: string }).agentRole === "string"
              ? (args as { agentRole?: string }).agentRole
              : undefined,
        };
        try {
          const result = await commands.run(spec);
          return {
            runId: result.runId,
            status: result.status,
            exitCode: result.exitCode,
            stdout: truncateOutput(result.stdout),
            stderr: truncateOutput(result.stderr),
            durationMs: result.durationMs,
            toolchainId: result.toolchainId,
            resolvedEnvDisplay: result.resolvedEnvDisplay,
          };
        } catch (err) {
          const error = err as { code?: string; message?: string; hint?: string };
          return {
            error: {
              code: error.code ?? "UNKNOWN",
              message: error.message ?? String(err),
              hint: error.hint,
            },
          };
        }
      },
    },
  };
}

// Per-call cap for tool-return payload so Claude's context isn't
// flooded by a chatty command. The backend keeps the full output in
// `command_runs` for later inspection.
const TOOL_OUTPUT_LIMIT = 8_000;

function truncateOutput(s: string): string {
  if (s.length <= TOOL_OUTPUT_LIMIT) return s;
  return (
    s.slice(0, TOOL_OUTPUT_LIMIT) +
    `\n…[truncated, full output in command run record]`
  );
}
