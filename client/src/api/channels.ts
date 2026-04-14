import { claude } from './modules/claude'
import { projects } from './modules/projects'
import { files } from './modules/files'
import { runner } from './modules/runner'
import { git } from './modules/git'
import { terminal } from './modules/terminal'
import { agents } from './modules/agents'
import { windowApi } from './modules/window'

/**
 * Registry of all subscription (push) channels.
 * Use with `useChannel` by passing the key:
 *
 * ```ts
 * const { last } = useChannel('git:statusChange', { replace: true })
 * ```
 */
export const channels = {
  // Claude
  'claude:message': claude.onMessage,
  'claude:toolUse': claude.onToolUse,
  'claude:done': claude.onDone,
  'claude:error': claude.onError,

  // Projects
  'projects:createOutput': projects.onCreateOutput,
  'projects:createDone': projects.onCreateDone,
  'projects:createError': projects.onCreateError,

  // Files
  'files:changed': files.onChanged,

  // Runner
  'runner:status': runner.onStatus,
  'runner:output': runner.onOutput,

  // Git
  'git:statusChange': git.onStatusChange,

  // Terminal
  'terminal:output': terminal.onOutput,
  'terminal:exit': terminal.onExit,

  // Agents
  'agents:event': agents.onEvent,
  'agents:workflowEvent': agents.onWorkflowEvent,
  'agents:buildEvent': agents.onBuildEvent,
  'agents:inputRequest': agents.onInputRequest,

  // Window
  'window:fullscreen': windowApi.onFullscreen,
} as const

/** Channel key — one of the registered subscription channels */
export type ChannelKey = keyof typeof channels

/** Infer the data type for a given channel key */
export type ChannelData<K extends ChannelKey> =
  (typeof channels)[K] extends (cb: (data: infer D) => void) => () => void ? D : never
