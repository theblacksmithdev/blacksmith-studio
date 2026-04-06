import { ipcMain } from 'electron'
import { getTemplates, interpolateTemplate } from '../../server/services/templates.js'
import { TEMPLATES_LIST, TEMPLATES_INTERPOLATE } from './channels.js'

export function setupTemplatesIPC() {
  ipcMain.handle(TEMPLATES_LIST, () => {
    return getTemplates()
  })

  ipcMain.handle(TEMPLATES_INTERPOLATE, (_e, data: { templateId: string; values: Record<string, string> }) => {
    const templates = getTemplates()
    const template = templates.find((t) => t.id === data.templateId)
    if (!template) throw new Error('Template not found')
    return { prompt: interpolateTemplate(template, data.values) }
  })
}
