import type { BrowserWindow } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import type { SessionManager } from '../../server/services/sessions.js'
import type { ClaudeManager } from '../../server/services/claude/index.js'
import type { SettingsManager } from '../../server/services/settings.js'
import type { RunnerManager } from '../../server/services/runner/index.js'
import type { McpManager } from '../../server/services/mcp.js'
import type { SkillsManager } from '../../server/services/skills.js'
import type { KnowledgeManager } from '../../server/services/knowledge.js'
import type { GitManager } from '../../server/services/git.js'
import type { TerminalManager } from '../../server/services/terminal.js'

import { setupProjectsIPC } from './projects.js'
import { setupSessionsIPC } from './sessions.js'
import { setupFilesIPC } from './files.js'
import { setupTemplatesIPC } from './templates.js'
import { setupSettingsIPC } from './settings.js'
import { setupClaudeIPC } from './claude.js'
import { setupRunnerIPC } from './runner.js'
import { setupHealthIPC } from './health.js'
import { setupMcpIPC } from './mcp.js'
import { setupKnowledgeIPC } from './knowledge.js'
import { setupSkillsIPC } from './skills.js'
import { setupSetupIPC } from './setup.js'
import { setupFolderDialogIPC } from './folder-dialog.js'
import { setupGitIPC } from './git.js'
import { setupTerminalIPC } from './terminal.js'

export function setupAllIPC(
  getWindow: () => BrowserWindow | null,
  projectManager: ProjectManager,
  sessionManager: SessionManager,
  claudeManager: ClaudeManager,
  settingsManager: SettingsManager,
  runnerManager: RunnerManager,
  mcpManager: McpManager,
  skillsManager: SkillsManager,
  knowledgeManager: KnowledgeManager,
  gitManager: GitManager,
  terminalManager: TerminalManager,
) {
  setupFolderDialogIPC()
  setupProjectsIPC(getWindow, projectManager)
  setupSessionsIPC(sessionManager, projectManager)
  setupFilesIPC(projectManager)
  setupTemplatesIPC()
  setupSettingsIPC(settingsManager, projectManager)
  setupClaudeIPC(getWindow, claudeManager, sessionManager, projectManager, settingsManager, mcpManager)
  setupRunnerIPC(getWindow, runnerManager, projectManager, settingsManager)
  setupMcpIPC(mcpManager, projectManager, settingsManager)
  setupHealthIPC(claudeManager, projectManager)
  setupKnowledgeIPC(knowledgeManager, projectManager)
  setupSkillsIPC(skillsManager, projectManager)
  setupSetupIPC()
  setupGitIPC(getWindow, gitManager, projectManager)
  setupTerminalIPC(getWindow, terminalManager, projectManager)
}
