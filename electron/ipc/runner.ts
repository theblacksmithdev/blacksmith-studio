import { ipcMain, type BrowserWindow } from 'electron'
import type { RunnerManager } from '../../server/services/runner/index.js'
import type { RunnerConfigService } from '../../server/services/runner/runner-config.js'
import type { ProjectManager } from '../../server/services/projects.js'
import type { SettingsManager } from '../../server/services/settings.js'
import { detectNodeInstallations } from '../../server/services/runner/detect-node.js'
import {
  RUNNER_GET_STATUS, RUNNER_START, RUNNER_STOP, RUNNER_DETECT_NODE,
  RUNNER_ON_STATUS, RUNNER_ON_OUTPUT,
  RUNNER_GET_CONFIGS, RUNNER_ADD_CONFIG, RUNNER_UPDATE_CONFIG, RUNNER_REMOVE_CONFIG,
  RUNNER_DETECT_RUNNERS, RUNNER_GET_LOGS, RUNNER_SETUP,
} from './channels.js'

function resolveProject(projectManager: ProjectManager, projectId: string): { id: string; path: string } {
  const project = projectManager.get(projectId)
  if (!project) throw new Error('Project not found')
  return { id: project.id, path: project.path }
}

export function setupRunnerIPC(
  getWindow: () => BrowserWindow | null,
  runnerManager: RunnerManager,
  configService: RunnerConfigService,
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
) {
  // Push callbacks
  runnerManager.onOutput((configId, name, line) => {
    getWindow()?.webContents.send(RUNNER_ON_OUTPUT, { configId, name, line })
  })

  runnerManager.onStatusChange((services) => {
    getWindow()?.webContents.send(RUNNER_ON_STATUS, services)
  })

  // ── Status ──

  ipcMain.handle(RUNNER_GET_STATUS, (_e, data: { projectId: string }) => {
    const { id } = resolveProject(projectManager, data.projectId)
    return runnerManager.getStatus(id)
  })

  // ── Runner config CRUD (returns full DB config data) ──

  ipcMain.handle(RUNNER_GET_CONFIGS, (_e, data: { projectId: string }) => {
    const { id } = resolveProject(projectManager, data.projectId)
    return configService.getConfigs(id)
  })

  ipcMain.handle(RUNNER_ADD_CONFIG, (_e, data: { projectId: string } & any) => {
    const { id } = resolveProject(projectManager, data.projectId)
    return configService.addConfig(id, data)
  })

  ipcMain.handle(RUNNER_UPDATE_CONFIG, (_e, data: { id: string; updates: any }) => {
    return configService.updateConfig(data.id, data.updates)
  })

  ipcMain.handle(RUNNER_REMOVE_CONFIG, (_e, data: { id: string }) => {
    configService.removeConfig(data.id)
  })

  ipcMain.handle(RUNNER_DETECT_RUNNERS, (_e, data: { projectId: string }) => {
    const { id, path } = resolveProject(projectManager, data.projectId)
    runnerManager.detectAndSeed(id, path)
    return configService.getConfigs(id)
  })

  // ── Start / Stop ──

  ipcMain.handle(RUNNER_START, async (_e, data: { projectId: string; configId?: string }) => {
    const { id, path } = resolveProject(projectManager, data.projectId)
    const nodePath = settingsManager.resolve(id, 'runner.nodePath') || ''

    runnerManager.detectAndSeed(id, path)

    if (data.configId) {
      await runnerManager.start(data.configId, path, nodePath)
    } else {
      await runnerManager.startAll(id, path, nodePath)
    }
  })

  ipcMain.handle(RUNNER_STOP, (_e, data: { projectId: string; configId?: string }) => {
    const { id } = resolveProject(projectManager, data.projectId)
    if (data.configId) {
      runnerManager.stop(data.configId)
    } else {
      runnerManager.stopAll(id)
    }
  })

  ipcMain.handle(RUNNER_GET_LOGS, (_e, data: { configId?: string }) => {
    return runnerManager.getLogs(data?.configId)
  })

  ipcMain.handle(RUNNER_SETUP, async (_e, data: { projectId: string; configId: string }) => {
    const { id, path } = resolveProject(projectManager, data.projectId)
    const nodePath = settingsManager.resolve(id, 'runner.nodePath') || ''
    await runnerManager.setup(data.configId, path, nodePath)
  })

  ipcMain.handle(RUNNER_DETECT_NODE, () => {
    return detectNodeInstallations()
  })
}
