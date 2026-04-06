import { ipcMain, type BrowserWindow } from 'electron'
import type { RunnerManager, RunnerTarget } from '../../server/services/runner/index.js'
import type { ProjectManager } from '../../server/services/projects.js'
import {
  RUNNER_GET_STATUS, RUNNER_START, RUNNER_STOP,
  RUNNER_ON_STATUS, RUNNER_ON_OUTPUT,
} from './channels.js'

export function setupRunnerIPC(
  getWindow: () => BrowserWindow | null,
  runnerManager: RunnerManager,
  projectManager: ProjectManager,
) {
  // Register push callbacks for streaming output/status
  runnerManager.onOutput((source, line) => {
    getWindow()?.webContents.send(RUNNER_ON_OUTPUT, { source, line })
  })

  runnerManager.onStatusChange(() => {
    getWindow()?.webContents.send(RUNNER_ON_STATUS, runnerManager.getStatus())
  })

  ipcMain.handle(RUNNER_GET_STATUS, () => {
    return runnerManager.getStatus()
  })

  ipcMain.handle(RUNNER_START, async (_e, data: { target: RunnerTarget | 'all' }) => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project')

    if (data.target === 'all') await runnerManager.startAll(projectPath)
    else if (data.target === 'backend') await runnerManager.startBackend(projectPath)
    else if (data.target === 'frontend') await runnerManager.startFrontend(projectPath)
  })

  ipcMain.handle(RUNNER_STOP, (_e, data: { target: RunnerTarget | 'all' }) => {
    if (data.target === 'all') runnerManager.stopAll()
    else if (data.target === 'backend') runnerManager.stopBackend()
    else if (data.target === 'frontend') runnerManager.stopFrontend()
  })
}
