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
import { mcp } from './modules/mcp'
import { setup } from './modules/setup'
import { skills } from './modules/skills'
import { knowledge } from './modules/knowledge'
import { git } from './modules/git'
import { terminal } from './modules/terminal'

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
  mcp,
  setup,
  skills,
  knowledge,
  git,
  terminal,
} as const
