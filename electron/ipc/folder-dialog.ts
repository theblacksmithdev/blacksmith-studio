import { ipcMain, dialog, app, BrowserWindow } from 'electron'

export function setupFolderDialogIPC() {
  ipcMain.handle('dialog:selectFolder', async () => {
    const win = BrowserWindow.getFocusedWindow()
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select a folder',
      buttonLabel: 'Select',
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })
}
