import { ipcMain } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import type { SettingsManager } from '../../server/services/settings.js'
import type { McpManager, McpServerConfig } from '../../server/services/mcp.js'
import {
  MCP_LIST, MCP_ADD, MCP_UPDATE, MCP_REMOVE, MCP_TOGGLE, MCP_TEST,
} from './channels.js'

function requireActiveProject(projectManager: ProjectManager): { id: string; path: string } {
  const project = projectManager.getActive()
  if (!project) throw new Error('No active project')
  return { id: project.id, path: project.path }
}

function getDisabledList(settingsManager: SettingsManager, projectId: string): string[] {
  const val = settingsManager.get(projectId, 'mcp.disabledServers')
  return Array.isArray(val) ? val : []
}

export function setupMcpIPC(
  mcpManager: McpManager,
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
) {
  ipcMain.handle(MCP_LIST, () => {
    const { id, path: root } = requireActiveProject(projectManager)
    const disabled = getDisabledList(settingsManager, id)
    return mcpManager.list(root, disabled)
  })

  ipcMain.handle(MCP_ADD, (_e, data: { name: string; config: McpServerConfig }) => {
    const { path: root } = requireActiveProject(projectManager)
    mcpManager.add(root, data.name, data.config)
  })

  ipcMain.handle(MCP_UPDATE, (_e, data: { name: string; config: McpServerConfig }) => {
    const { path: root } = requireActiveProject(projectManager)
    mcpManager.update(root, data.name, data.config)
  })

  ipcMain.handle(MCP_REMOVE, (_e, data: { name: string }) => {
    const { path: root } = requireActiveProject(projectManager)
    mcpManager.remove(root, data.name)
  })

  ipcMain.handle(MCP_TOGGLE, (_e, data: { name: string; enabled: boolean }) => {
    const { id } = requireActiveProject(projectManager)
    const disabled = getDisabledList(settingsManager, id)
    const set = new Set(disabled)

    if (data.enabled) {
      set.delete(data.name)
    } else {
      set.add(data.name)
    }

    settingsManager.set(id, 'mcp.disabledServers', [...set])
  })

  ipcMain.handle(MCP_TEST, async (_e, data: { name: string }) => {
    const { path: root } = requireActiveProject(projectManager)
    return mcpManager.testConnection(root, data.name)
  })
}
