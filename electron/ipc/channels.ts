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

// MCP
export const MCP_LIST = 'mcp:list'
export const MCP_ADD = 'mcp:add'
export const MCP_UPDATE = 'mcp:update'
export const MCP_REMOVE = 'mcp:remove'
export const MCP_TOGGLE = 'mcp:toggle'
export const MCP_TEST = 'mcp:test'

// Health
export const HEALTH_CHECK = 'health:check'

// Setup
export const SETUP_CHECK = 'setup:check'
export const SETUP_INSTALL_CLAUDE = 'setup:installClaude'

// Knowledge
export const KNOWLEDGE_LIST = 'knowledge:list'
export const KNOWLEDGE_GET = 'knowledge:get'
export const KNOWLEDGE_SAVE = 'knowledge:save'
export const KNOWLEDGE_CREATE = 'knowledge:create'
export const KNOWLEDGE_REMOVE = 'knowledge:remove'

// Skills
export const SKILLS_LIST = 'skills:list'
export const SKILLS_GET = 'skills:get'
export const SKILLS_ADD = 'skills:add'
export const SKILLS_UPDATE = 'skills:update'
export const SKILLS_REMOVE = 'skills:remove'

// Git
export const GIT_STATUS = 'git:status'
export const GIT_CHANGED_FILES = 'git:changedFiles'
export const GIT_DIFF = 'git:diff'
export const GIT_CREATE_CHECKPOINT = 'git:createCheckpoint'
export const GIT_GENERATE_MESSAGE = 'git:generateMessage'
export const GIT_HISTORY = 'git:history'
export const GIT_LIST_VERSIONS = 'git:listVersions'
export const GIT_CREATE_VERSION = 'git:createVersion'
export const GIT_SWITCH_VERSION = 'git:switchVersion'
export const GIT_APPLY_VERSION = 'git:applyVersion'
export const GIT_SYNC = 'git:sync'
export const GIT_SYNC_STATUS = 'git:syncStatus'
export const GIT_CONFLICTS = 'git:conflicts'
export const GIT_RESOLVE_CONFLICT = 'git:resolveConflict'
export const GIT_COMMIT_DETAIL = 'git:commitDetail'
export const GIT_INIT = 'git:init'

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
export const GIT_ON_STATUS_CHANGE = 'git:onStatusChange'

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
  MCP_LIST, MCP_ADD, MCP_UPDATE, MCP_REMOVE, MCP_TOGGLE, MCP_TEST,
  HEALTH_CHECK,
  SETUP_CHECK, SETUP_INSTALL_CLAUDE,
  KNOWLEDGE_LIST, KNOWLEDGE_GET, KNOWLEDGE_SAVE, KNOWLEDGE_CREATE, KNOWLEDGE_REMOVE,
  SKILLS_LIST, SKILLS_GET, SKILLS_ADD, SKILLS_UPDATE, SKILLS_REMOVE,
  GIT_STATUS, GIT_CHANGED_FILES, GIT_DIFF,
  GIT_CREATE_CHECKPOINT, GIT_GENERATE_MESSAGE, GIT_HISTORY,
  GIT_LIST_VERSIONS, GIT_CREATE_VERSION, GIT_SWITCH_VERSION, GIT_APPLY_VERSION,
  GIT_SYNC, GIT_SYNC_STATUS,
  GIT_CONFLICTS, GIT_RESOLVE_CONFLICT,
  GIT_COMMIT_DETAIL,
  GIT_INIT,
] as const

export const SUBSCRIBE_CHANNELS = [
  PROJECTS_ON_CREATE_OUTPUT, PROJECTS_ON_CREATE_DONE, PROJECTS_ON_CREATE_ERROR,
  CLAUDE_ON_MESSAGE, CLAUDE_ON_TOOL_USE, CLAUDE_ON_DONE, CLAUDE_ON_ERROR,
  FILES_ON_CHANGED,
  RUNNER_ON_STATUS, RUNNER_ON_OUTPUT,
  WINDOW_ON_FULLSCREEN,
  GIT_ON_STATUS_CHANGE,
] as const
