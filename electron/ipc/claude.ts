import { ipcMain, type BrowserWindow } from "electron";
import crypto from "node:crypto";
import type { Ai } from "../../server/services/ai/ai.js";
import type { SessionManager } from "../../server/services/sessions.js";
import type { ProjectManager } from "../../server/services/projects.js";
import type { SettingsManager } from "../../server/services/settings.js";
import type { McpManager } from "../../server/services/mcp.js";
import { STUDIO_SYSTEM_PROMPT } from "../../server/services/claude/system-prompt.js";
import { getProjectContext } from "../../server/services/claude/project-context.js";
import {
  CLAUDE_SEND_PROMPT,
  CLAUDE_CANCEL,
  CLAUDE_ON_MESSAGE,
  CLAUDE_ON_TOOL_USE,
  CLAUDE_ON_DONE,
  CLAUDE_ON_ERROR,
} from "./channels.js";

export function setupClaudeIPC(
  getWindow: () => BrowserWindow | null,
  ai: Ai,
  sessionManager: SessionManager,
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
  mcpManager: McpManager,
) {
  ipcMain.handle(
    CLAUDE_SEND_PROMPT,
    async (
      _e,
      data: { projectId: string; sessionId: string; prompt: string },
    ) => {
      const { sessionId, prompt } = data;
      const project = projectManager.get(data.projectId);
      const win = getWindow();

      if (!project) {
        win?.webContents.send(CLAUDE_ON_ERROR, {
          sessionId,
          error: "Project not found.",
          code: "NO_PROJECT",
        });
        return;
      }

      const { id: projectId, path: projectPath } = project;

      const existingSession = sessionManager.getSession(sessionId);
      const isResume = !!(
        existingSession && existingSession.messages.length > 0
      );

      sessionManager.addMessage(sessionId, {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
        timestamp: new Date().toISOString(),
      });

      const allSettings = settingsManager.getAll(projectId);

      let lastContent = "";
      const toolCalls: any[] = [];

      try {
        const handle = ai.stream({
          prompt,
          systemPrompt: STUDIO_SYSTEM_PROMPT,
          resume: isResume,
          sessionId,
          projectContext: !isResume
            ? getProjectContext(projectPath)
            : undefined,
          cwd: projectPath,
          model: allSettings["ai.model"] || undefined,
          maxBudget: allSettings["ai.maxBudget"] || undefined,
          permissionMode:
            allSettings["ai.permissionMode"] || "bypassPermissions",
          customInstructions: allSettings["ai.customInstructions"] || undefined,
          mcpConfigPath: mcpManager.getEnabledConfigPath(
            projectPath,
            Array.isArray(allSettings["mcp.disabledServers"])
              ? allSettings["mcp.disabledServers"]
              : [],
          ),
          nodePath:
            settingsManager.resolve(projectId, "runner.nodePath") || undefined,
          onChunk: (chunk) => {
            if (chunk.type === "assistant") {
              const textBlocks = (chunk.message?.content || []).filter(
                (b: any) => b.type === "text",
              );
              const toolBlocks = (chunk.message?.content || []).filter(
                (b: any) => b.type === "tool_use",
              );

              if (textBlocks.length > 0) {
                lastContent = textBlocks.map((b: any) => b.text).join("");
                win?.webContents.send(CLAUDE_ON_MESSAGE, {
                  sessionId,
                  content: lastContent,
                  isPartial: !chunk.stop_reason,
                });
              }

              for (const tool of toolBlocks) {
                toolCalls.push({
                  toolId: tool.id,
                  toolName: tool.name,
                  input: tool.input,
                });
                win?.webContents.send(CLAUDE_ON_TOOL_USE, {
                  sessionId,
                  toolId: tool.id,
                  toolName: tool.name,
                  input: tool.input,
                });
              }
            } else if (chunk.type === "result") {
              if (lastContent) {
                sessionManager.addMessage(sessionId, {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: lastContent,
                  toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                  timestamp: new Date().toISOString(),
                });
              }
              win?.webContents.send(CLAUDE_ON_DONE, {
                sessionId,
                costUsd: chunk.cost_usd || 0,
                durationMs: chunk.duration_ms || 0,
              });
            }
          },
        });

        await handle.promise;
      } catch (error: any) {
        console.error(`[ipc] Claude error:`, error.message);
        sessionManager.addMessage(sessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
        });
        win?.webContents.send(CLAUDE_ON_ERROR, {
          sessionId,
          error: error.message || "Unknown error",
          code: "PROCESS_ERROR",
        });
      }
    },
  );

  ipcMain.handle(CLAUDE_CANCEL, (_e, data: { sessionId: string }) => {
    ai.cancel(data.sessionId);
  });
}
