import { ipcMain, type BrowserWindow } from "electron";
import crypto from "node:crypto";
import type { Ai } from "../../server/services/ai/ai.js";
import type { SessionManager } from "../../server/services/chat/single-agent/index.js";
import type { ProjectManager } from "../../server/services/projects.js";
import type { SettingsManager } from "../../server/services/settings.js";
import type { McpManager } from "../../server/services/mcp.js";
import {
  STUDIO_SYSTEM_PROMPT,
  getProjectContext,
  resolveAiInvocationSettings,
} from "../../server/services/studio-context/index.js";
import { appendAttachmentInstruction } from "../../server/services/attachments/index.js";
import {
  SINGLE_AGENT_SEND_PROMPT,
  SINGLE_AGENT_CANCEL,
  SINGLE_AGENT_ON_MESSAGE,
  SINGLE_AGENT_ON_TOOL_USE,
  SINGLE_AGENT_ON_DONE,
  SINGLE_AGENT_ON_ERROR,
} from "./channels.js";

export function setupSingleAgentIPC(
  getWindow: () => BrowserWindow | null,
  ai: Ai,
  sessionManager: SessionManager,
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
  mcpManager: McpManager,
) {
  ipcMain.handle(
    SINGLE_AGENT_SEND_PROMPT,
    async (
      _e,
      data: {
        projectId: string;
        sessionId: string;
        prompt: string;
        attachments?: Array<{
          id: string;
          name: string;
          kind: "image" | "text" | "code" | "pdf" | "file";
          mime: string;
          size: number;
          absPath: string;
          relPath: string;
        }>;
      },
    ) => {
      const { sessionId, prompt, attachments } = data;
      const project = projectManager.get(data.projectId);
      const win = getWindow();

      if (!project) {
        win?.webContents.send(SINGLE_AGENT_ON_ERROR, {
          sessionId,
          error: "Project not found.",
          code: "NO_PROJECT",
        });
        return;
      }

      const { path: projectPath } = project;

      const existingSession = sessionManager.getSession(sessionId);
      const isResume = !!(
        existingSession && existingSession.messages.length > 0
      );

      sessionManager.addMessage(sessionId, {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
        attachments:
          attachments && attachments.length > 0 ? attachments : undefined,
        timestamp: new Date().toISOString(),
      });

      const settings = resolveAiInvocationSettings(
        project,
        settingsManager,
        mcpManager,
      );

      let lastContent = "";
      const toolCalls: any[] = [];

      const aiPrompt = appendAttachmentInstruction(prompt, attachments);

      try {
        const handle = ai.stream({
          prompt: aiPrompt,
          systemPrompt: STUDIO_SYSTEM_PROMPT,
          resume: isResume,
          sessionId,
          projectContext: !isResume
            ? getProjectContext(projectPath)
            : undefined,
          cwd: projectPath,
          model: settings.model,
          maxBudget: settings.maxBudget,
          permissionMode: settings.permissionMode ?? "bypassPermissions",
          customInstructions: settings.customInstructions,
          mcpConfigPath: settings.mcpConfigPath,
          nodePath: settings.nodePath,
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
                win?.webContents.send(SINGLE_AGENT_ON_MESSAGE, {
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
                win?.webContents.send(SINGLE_AGENT_ON_TOOL_USE, {
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
              win?.webContents.send(SINGLE_AGENT_ON_DONE, {
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
        win?.webContents.send(SINGLE_AGENT_ON_ERROR, {
          sessionId,
          error: error.message || "Unknown error",
          code: "PROCESS_ERROR",
        });
      }
    },
  );

  ipcMain.handle(SINGLE_AGENT_CANCEL, (_e, data: { sessionId: string }) => {
    ai.cancel(data.sessionId);
  });
}
