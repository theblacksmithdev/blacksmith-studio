import { eq, inArray } from "drizzle-orm";
import { agentDispatches, agentTasks } from "../../db/schema.js";
import type { Database, ConversationArtifact } from "./types.js";
import type { MessageRepository } from "./repositories/index.js";
import type { ToolCallRepository } from "./repositories/index.js";
import { extractFilePath, isFileTool } from "./file-tool-parser.js";

/**
 * Traces every file a set of agents touched while working on a conversation.
 *
 * The pipeline: conversationId → dispatches → tasks (with sessionIds) →
 * messages → tool_calls → file paths. Kept in its own class because the
 * traversal spans multiple domains (agent dispatches + sessions) and has
 * its own deduplication concern.
 *
 * Single Responsibility: produce the ordered list of artifacts for a
 * conversation. Does not know or care how the tool-call input is shaped
 * — delegates to FileToolParser for that.
 */
export class ArtifactTracer {
  constructor(
    private readonly db: Database,
    private readonly messages: MessageRepository,
    private readonly toolCalls: ToolCallRepository,
  ) {}

  getArtifacts(conversationId: string): ConversationArtifact[] {
    const taskMeta = this.fetchTaskMeta(conversationId);
    if (taskMeta.length === 0) return [];

    const sessionIds = taskMeta.map((t) => t.sessionId);
    const messageRows = this.messages.listBySessions(sessionIds);
    if (messageRows.length === 0) return [];

    const toolCallRows = this.toolCalls.listByMessages(
      messageRows.map((m) => m.id),
    );

    const messageIndex = new Map(messageRows.map((m) => [m.id, m]));
    const roleBySession = new Map(
      taskMeta.map((t) => [t.sessionId, t.role]),
    );
    const messageSessionId = new Map(
      messageRows.map((m) => [m.id, m.sessionId]),
    );

    const seen = new Set<string>();
    const artifacts: ConversationArtifact[] = [];

    for (const tc of toolCallRows) {
      if (!isFileTool(tc.toolName)) continue;

      const filePath = extractFilePath(tc.input);
      if (!filePath || seen.has(filePath)) continue;
      seen.add(filePath);

      const sessionId = messageSessionId.get(tc.messageId);
      const role = (sessionId && roleBySession.get(sessionId)) || "unknown";
      const timestamp = messageIndex.get(tc.messageId)?.timestamp ?? "";

      artifacts.push({ path: filePath, tool: tc.toolName, role, timestamp });
    }

    return artifacts.sort((a, b) => a.path.localeCompare(b.path));
  }

  /**
   * Fetch every task in the conversation that produced a Claude session.
   * Tasks without a session (i.e. never executed, or run locally) are
   * filtered out up front — no point carrying them through the pipeline.
   */
  private fetchTaskMeta(
    conversationId: string,
  ): { sessionId: string; role: string }[] {
    const dispatches = this.db
      .select({ id: agentDispatches.id })
      .from(agentDispatches)
      .where(eq(agentDispatches.conversationId, conversationId))
      .all();

    if (dispatches.length === 0) return [];

    return this.db
      .select({
        sessionId: agentTasks.sessionId,
        role: agentTasks.role,
      })
      .from(agentTasks)
      .where(
        inArray(
          agentTasks.dispatchId,
          dispatches.map((d) => d.id),
        ),
      )
      .all()
      .filter(
        (t): t is { sessionId: string; role: string } =>
          typeof t.sessionId === "string" && t.sessionId.length > 0,
      );
  }
}
