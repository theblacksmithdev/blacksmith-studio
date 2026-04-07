// ─── Request/Response Channels (replacing HTTP REST) ───

// Projects
export const PROJECTS_LIST = 'projects:list'
export const PROJECTS_GET_ACTIVE = 'projects:getActive'
export const PROJECTS_REGISTER = 'projects:register'
export const PROJECTS_CREATE = 'projects:create'
export const PROJECTS_ACTIVATE = 'projects:activate'
export const PROJECTS_RENAME = 'projects:rename'
export const PROJECTS_REMOVE = 'projects:remove'
export const PROJECTS_VALIDATE = 'projects:validate'

// Browse
export const BROWSE_LIST = 'browse:list'

// Sessions
export const SESSIONS_LIST = 'sessions:list'
export const SESSIONS_GET = 'sessions:get'
export const SESSIONS_CREATE = 'sessions:create'
export const SESSIONS_RENAME = 'sessions:rename'
export const SESSIONS_DELETE = 'sessions:delete'

// Files
export const FILES_TREE = 'files:tree'
export const FILES_CONTENT = 'files:content'

// Templates
export const TEMPLATES_LIST = 'templates:list'
export const TEMPLATES_INTERPOLATE = 'templates:interpolate'

// Settings
export const SETTINGS_GET_ALL = 'settings:getAll'
export const SETTINGS_UPDATE = 'settings:update'

// Runner
export const RUNNER_GET_STATUS = 'runner:getStatus'
export const RUNNER_START = 'runner:start'
export const RUNNER_STOP = 'runner:stop'

// Claude
export const CLAUDE_SEND_PROMPT = 'claude:sendPrompt'
export const CLAUDE_CANCEL = 'claude:cancel'

// Health
export const HEALTH_CHECK = 'health:check'

// ─── Push/Stream Channels ───

// Project creation
export const PROJECTS_ON_CREATE_OUTPUT = 'projects:onCreateOutput'
export const PROJECTS_ON_CREATE_DONE = 'projects:onCreateDone'
export const PROJECTS_ON_CREATE_ERROR = 'projects:onCreateError'

export const CLAUDE_ON_MESSAGE = 'claude:onMessage'
export const CLAUDE_ON_TOOL_USE = 'claude:onToolUse'
export const CLAUDE_ON_DONE = 'claude:onDone'
export const CLAUDE_ON_ERROR = 'claude:onError'
export const FILES_ON_CHANGED = 'files:onChanged'
export const RUNNER_ON_STATUS = 'runner:onStatus'
export const RUNNER_ON_OUTPUT = 'runner:onOutput'
export const WINDOW_ON_FULLSCREEN = 'window:onFullscreen'

// Channel allowlists for preload security
export const INVOKE_CHANNELS = [
  PROJECTS_LIST, PROJECTS_GET_ACTIVE, PROJECTS_REGISTER, PROJECTS_CREATE,
  PROJECTS_ACTIVATE, PROJECTS_RENAME, PROJECTS_REMOVE, PROJECTS_VALIDATE,
  BROWSE_LIST,
  SESSIONS_LIST, SESSIONS_GET, SESSIONS_CREATE, SESSIONS_RENAME, SESSIONS_DELETE,
  FILES_TREE, FILES_CONTENT,
  TEMPLATES_LIST, TEMPLATES_INTERPOLATE,
  SETTINGS_GET_ALL, SETTINGS_UPDATE,
  RUNNER_GET_STATUS, RUNNER_START, RUNNER_STOP,
  CLAUDE_SEND_PROMPT, CLAUDE_CANCEL,
  HEALTH_CHECK,
] as const

export const SUBSCRIBE_CHANNELS = [
  PROJECTS_ON_CREATE_OUTPUT, PROJECTS_ON_CREATE_DONE, PROJECTS_ON_CREATE_ERROR,
  CLAUDE_ON_MESSAGE, CLAUDE_ON_TOOL_USE, CLAUDE_ON_DONE, CLAUDE_ON_ERROR,
  FILES_ON_CHANGED,
  RUNNER_ON_STATUS, RUNNER_ON_OUTPUT,
  WINDOW_ON_FULLSCREEN,
] as const
