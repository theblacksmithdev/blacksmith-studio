import type { BrowserWindow } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import type { SessionManager } from '../../server/services/sessions.js'
import type { ClaudeManager } from '../../server/services/claude/index.js'
import type { SettingsManager } from '../../server/services/settings.js'
import type { RunnerManager } from '../../server/services/runner/index.js'
import type { McpManager } from '../../server/services/mcp.js'

import { setupProjectsIPC } from './projects.js'
import { setupSessionsIPC } from './sessions.js'
import { setupFilesIPC } from './files.js'
import { setupTemplatesIPC } from './templates.js'
import { setupSettingsIPC } from './settings.js'
import { setupClaudeIPC } from './claude.js'
import { setupRunnerIPC } from './runner.js'
import { setupHealthIPC } from './health.js'
import { setupMcpIPC } from './mcp.js'
import { setupSetupIPC } from './setup.js'
import { setupFolderDialogIPC } from './folder-dialog.js'

export function setupAllIPC(
  getWindow: () => BrowserWindow | null,
  projectManager: ProjectManager,
  sessionManager: SessionManager,
  claudeManager: ClaudeManager,
  settingsManager: SettingsManager,
  runnerManager: RunnerManager,
  mcpManager: McpManager,
) {
  setupFolderDialogIPC()
  setupProjectsIPC(getWindow, projectManager)
  setupSessionsIPC(sessionManager, projectManager)
  setupFilesIPC(projectManager)
  setupTemplatesIPC()
  setupSettingsIPC(settingsManager, projectManager)
  setupClaudeIPC(getWindow, claudeManager, sessionManager, projectManager, settingsManager, mcpManager)
  setupRunnerIPC(getWindow, runnerManager, projectManager)
  setupMcpIPC(mcpManager, projectManager, settingsManager)
  setupHealthIPC(claudeManager, projectManager)
  setupSetupIPC()
}
