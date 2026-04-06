import { ipcMain, type BrowserWindow } from 'electron'
import crypto from 'node:crypto'
import type { ClaudeManager } from '../../server/services/claude/index.js'
import type { SessionManager } from '../../server/services/sessions.js'
import type { ProjectManager } from '../../server/services/projects.js'
import type { SettingsManager } from '../../server/services/settings.js'
import {
  CLAUDE_SEND_PROMPT, CLAUDE_CANCEL,
  CLAUDE_ON_MESSAGE, CLAUDE_ON_TOOL_USE, CLAUDE_ON_DONE, CLAUDE_ON_ERROR,
  FILES_ON_CHANGED,
} from './channels.js'

export function setupClaudeIPC(
  getWindow: () => BrowserWindow | null,
  claudeManager: ClaudeManager,
  sessionManager: SessionManager,
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
) {
  ipcMain.handle(CLAUDE_SEND_PROMPT, async (_e, data: { sessionId: string; prompt: string }) => {
    const { sessionId, prompt } = data
    const projectId = projectManager.getActiveId()
    const projectPath = projectManager.getActivePath()
    const win = getWindow()

    if (!projectId || !projectPath) {
      win?.webContents.send(CLAUDE_ON_ERROR, { sessionId, error: 'No active project', code: 'NO_PROJECT' })
      return
    }

    sessionManager.addMessage(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    })

    const allSettings = settingsManager.getAll(projectId)

    let lastContent = ''
    const toolCalls: any[] = []

    try {
      await claudeManager.sendPrompt({
        sessionId,
        prompt,
        projectRoot: projectPath,
        model: allSettings['ai.model'] || undefined,
        maxBudget: allSettings['ai.maxBudget'] || undefined,
        permissionMode: allSettings['ai.permissionMode'] || 'bypassPermissions',
        customInstructions: allSettings['ai.customInstructions'] || undefined,
      }, (chunk) => {
        if (chunk.type === 'assistant') {
          const textBlocks = (chunk.message?.content || []).filter((b: any) => b.type === 'text')
          const toolBlocks = (chunk.message?.content || []).filter((b: any) => b.type === 'tool_use')

          if (textBlocks.length > 0) {
            lastContent = textBlocks.map((b: any) => b.text).join('')
            win?.webContents.send(CLAUDE_ON_MESSAGE, { sessionId, content: lastContent, isPartial: !chunk.stop_reason })
          }

          for (const tool of toolBlocks) {
            toolCalls.push({ toolId: tool.id, toolName: tool.name, input: tool.input })
            win?.webContents.send(CLAUDE_ON_TOOL_USE, { sessionId, toolId: tool.id, toolName: tool.name, input: tool.input })
          }
        } else if (chunk.type === 'result') {
          if (lastContent) {
            sessionManager.addMessage(sessionId, {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: lastContent,
              toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
              timestamp: new Date().toISOString(),
            })
          }
          win?.webContents.send(CLAUDE_ON_DONE, { sessionId, costUsd: chunk.cost_usd || 0, durationMs: chunk.duration_ms || 0 })
        }
      })
    } catch (error: any) {
      console.error(`[ipc] Claude error:`, error.message)
      sessionManager.addMessage(sessionId, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      })
      win?.webContents.send(CLAUDE_ON_ERROR, { sessionId, error: error.message || 'Unknown error', code: 'PROCESS_ERROR' })
    }
  })

  ipcMain.handle(CLAUDE_CANCEL, (_e, data: { sessionId: string }) => {
    claudeManager.cancelPrompt(data.sessionId)
  })
}
