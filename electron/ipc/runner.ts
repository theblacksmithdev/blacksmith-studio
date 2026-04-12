import { ipcMain, type BrowserWindow } from 'electron'
import type { RunnerManager } from '../../server/services/runner/index.js'
import type { ProjectManager } from '../../server/services/projects.js'
import type { SettingsManager } from '../../server/services/settings.js'
import { detectNodeInstallations } from '../../server/services/runner/detect-node.js'
import {
  RUNNER_GET_STATUS, RUNNER_START, RUNNER_STOP, RUNNER_DETECT_NODE,
  RUNNER_ON_STATUS, RUNNER_ON_OUTPUT,
  RUNNER_GET_CONFIGS, RUNNER_ADD_CONFIG, RUNNER_UPDATE_CONFIG, RUNNER_REMOVE_CONFIG,
  RUNNER_DETECT_RUNNERS,
} from './channels.js'

export function setupRunnerIPC(
  getWindow: () => BrowserWindow | null,
  runnerManager: RunnerManager,
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
) {
  function requireProject() {
    const id = projectManager.getActiveId()
    const path = projectManager.getActivePath()
    if (!id || !path) throw new Error('No active project. Open a project first.')
    return { id, path }
  }

  // Push callbacks
  runnerManager.onOutput((configId, name, line) => {
    getWindow()?.webContents.send(RUNNER_ON_OUTPUT, { configId, name, line })
  })

  runnerManager.onStatusChange((services) => {
    getWindow()?.webContents.send(RUNNER_ON_STATUS, services)
  })

  // ── Status ──

  ipcMain.handle(RUNNER_GET_STATUS, () => {
    const { id } = requireProject()
    return runnerManager.getStatus(id)
  })

  // ── Runner config CRUD ──

  ipcMain.handle(RUNNER_GET_CONFIGS, () => {
    const { id } = requireProject()
    return runnerManager.getStatus(id) // returns configs with live status
  })

  ipcMain.handle(RUNNER_ADD_CONFIG, (_e, data: any) => {
    const { id } = requireProject()
    const { RunnerConfigService } = require('../../server/services/runner/runner-config.js')
    // Access config service via the manager's internal reference isn't ideal,
    // but we can instantiate a fresh one since it reads from the same DB
    const svc = new RunnerConfigService()
    return svc.addConfig(id, data)
  })

  ipcMain.handle(RUNNER_UPDATE_CONFIG, (_e, data: { id: string; updates: any }) => {
    const { RunnerConfigService } = require('../../server/services/runner/runner-config.js')
    const svc = new RunnerConfigService()
    return svc.updateConfig(data.id, data.updates)
  })

  ipcMain.handle(RUNNER_REMOVE_CONFIG, (_e, data: { id: string }) => {
    const { RunnerConfigService } = require('../../server/services/runner/runner-config.js')
    const svc = new RunnerConfigService()
    svc.removeConfig(data.id)
  })

  ipcMain.handle(RUNNER_DETECT_RUNNERS, () => {
    const { id, path } = requireProject()
    runnerManager.detectAndSeed(id, path)
    return runnerManager.getStatus(id)
  })

  // ── Start / Stop ──

  ipcMain.handle(RUNNER_START, async (_e, data: { configId?: string }) => {
    const { id, path } = requireProject()
    const nodePath = settingsManager.resolve(id, 'runner.nodePath') || ''

    // Auto-detect if no configs yet
    runnerManager.detectAndSeed(id, path)

    if (data.configId) {
      await runnerManager.start(data.configId, path, nodePath)
    } else {
      await runnerManager.startAll(id, path, nodePath)
    }
  })

  ipcMain.handle(RUNNER_STOP, (_e, data: { configId?: string }) => {
    const { id } = requireProject()
    if (data.configId) {
      runnerManager.stop(data.configId)
    } else {
      runnerManager.stopAll(id)
    }
  })

  ipcMain.handle(RUNNER_DETECT_NODE, () => {
    return detectNodeInstallations()
  })
}
