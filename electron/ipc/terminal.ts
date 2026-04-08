import { ipcMain, type BrowserWindow } from 'electron'
import type { TerminalManager } from '../../server/services/terminal.js'
import type { ProjectManager } from '../../server/services/projects.js'
import {
  TERMINAL_SPAWN, TERMINAL_WRITE, TERMINAL_RESIZE, TERMINAL_KILL,
  TERMINAL_ON_OUTPUT, TERMINAL_ON_EXIT,
} from './channels.js'

export function setupTerminalIPC(
  getWindow: () => BrowserWindow | null,
  terminalManager: TerminalManager,
  projectManager: ProjectManager,
) {
  terminalManager.onOutput((id, data) => {
    getWindow()?.webContents.send(TERMINAL_ON_OUTPUT, { id, data })
  })

  terminalManager.onExit((id, code) => {
    getWindow()?.webContents.send(TERMINAL_ON_EXIT, { id, code })
  })

  ipcMain.handle(TERMINAL_SPAWN, async (_e, data?: { cwd?: string; cols?: number; rows?: number }) => {
    const cwd = data?.cwd || projectManager.getActivePath() || process.env.HOME || '/'
    console.log('[terminal] spawning shell in', cwd)
    try {
      const id = await terminalManager.spawn(cwd, data?.cols, data?.rows)
      console.log('[terminal] spawned', id)
      return id
    } catch (err: any) {
      console.error('[terminal] spawn failed:', err)
      throw err
    }
  })

  ipcMain.handle(TERMINAL_WRITE, (_e, data: { id: string; data: string }) => {
    terminalManager.write(data.id, data.data)
  })

  ipcMain.handle(TERMINAL_RESIZE, (_e, data: { id: string; cols: number; rows: number }) => {
    terminalManager.resize(data.id, data.cols, data.rows)
  })

  ipcMain.handle(TERMINAL_KILL, (_e, data: { id: string }) => {
    terminalManager.kill(data.id)
  })
}
