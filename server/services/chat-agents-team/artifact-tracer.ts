import type {
  MessageRepository,
  ToolCallRepository,
} from "../chat-single-agent/index.js";
import { extractFilePath, isFileTool } from "./file-tool-parser.js";
import type {
  DispatchRepository,
  TaskRepository,
} from "./repositories/index.js";

export interface ConversationArtifact {
  path: string;
  tool: string;
  role: string;
  timestamp: string;
}

/**
 * Trace every file the team's agents touched while working on a
 * conversation.
 *
 * The pipeline:
 *   conversationId → dispatches → tasks (with session IDs) → messages →
 *   tool_calls → file paths (deduplicated, sorted).
 *
 * Single Responsibility: produce the artifact list for a conversation.
 * Dependency Inversion: composes four repositories — two from the agent
 * domain (dispatches, tasks) and two from the single-chat domain
 * (messages, tool_calls). All tool-name classification and input-shape
 * decoding delegates to the file-tool-parser functions.
 *
 * This lives in agent-sessions/ because its input is an agent
 * conversation ID and its output scopes to what agents did —
 * even though the final edges reach into single-chat tables.
 */
export class ArtifactTracer {
  constructor(
    private readonly dispatches: DispatchRepository,
    private readonly tasks: TaskRepository,
    private readonly messages: MessageRepository,
    private readonly toolCalls: ToolCallRepository,
  ) {}

  getArtifacts(conversationId: string): ConversationArtifact[] {
    const dispatchIds = this.dispatches.findIdsByConversation(conversationId);
    if (dispatchIds.length === 0) return [];

    const sessionLinks = this.tasks.findSessionLinksByDispatches(dispatchIds);
    if (sessionLinks.length === 0) return [];

    const sessionIds = sessionLinks.map((t) => t.sessionId);
    const messageRows = this.messages.listBySessions(sessionIds);
    if (messageRows.length === 0) return [];

    const toolCallRows = this.toolCalls.listByMessages(
      messageRows.map((m) => m.id),
    );

    const roleBySession = new Map(
      sessionLinks.map((t) => [t.sessionId, t.role]),
    );
    const messageIndex = new Map(messageRows.map((m) => [m.id, m]));
    const sessionIdByMessage = new Map(
      messageRows.map((m) => [m.id, m.sessionId]),
    );

    const seen = new Set<string>();
    const artifacts: ConversationArtifact[] = [];

    for (const tc of toolCallRows) {
      if (!isFileTool(tc.toolName)) continue;

      const filePath = extractFilePath(tc.input);
      if (!filePath || seen.has(filePath)) continue;
      seen.add(filePath);

      const sessionId = sessionIdByMessage.get(tc.messageId);
      const role = (sessionId && roleBySession.get(sessionId)) || "unknown";
      const timestamp = messageIndex.get(tc.messageId)?.timestamp ?? "";

      artifacts.push({ path: filePath, tool: tc.toolName, role, timestamp });
    }

    return artifacts.sort((a, b) => a.path.localeCompare(b.path));
  }
}
