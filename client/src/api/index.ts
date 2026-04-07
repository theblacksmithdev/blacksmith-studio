import { projects } from './modules/projects'
import { sessions } from './modules/sessions'
import { files } from './modules/files'
import { settings } from './modules/settings'
import { runner } from './modules/runner'
import { claude } from './modules/claude'
import { templates } from './modules/templates'
import { health } from './modules/health'
import { windowApi } from './modules/window'
import { browse } from './modules/browse'

export const api = {
  projects,
  sessions,
  files,
  settings,
  runner,
  claude,
  templates,
  health,
  window: windowApi,
  browse,
} as const
