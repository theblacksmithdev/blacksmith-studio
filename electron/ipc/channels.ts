// ─── Request/Response Channels (replacing HTTP REST) ───

// Projects
export const PROJECTS_LIST = 'projects:list'
export const PROJECTS_GET = 'projects:get'
export const PROJECTS_REGISTER = 'projects:register'
export const PROJECTS_CREATE = 'projects:create'
export const PROJECTS_RENAME = 'projects:rename'
export const PROJECTS_REMOVE = 'projects:remove'
export const PROJECTS_VALIDATE = 'projects:validate'
export const PROJECTS_CLONE = 'projects:clone'

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
export const FILES_SEARCH = 'files:search'
export const FILES_REVEAL = 'files:reveal'
export const FILES_OPEN_IN_EDITOR = 'files:openInEditor'
export const FILES_DETECT_EDITORS = 'files:detectEditors'
export const FILES_SAVE = 'files:save'
export const FILES_RENAME = 'files:rename'
export const FILES_DELETE = 'files:delete'

// Templates
export const TEMPLATES_LIST = 'templates:list'
export const TEMPLATES_INTERPOLATE = 'templates:interpolate'

// Settings
export const SETTINGS_GET_ALL = 'settings:getAll'
export const SETTINGS_UPDATE = 'settings:update'
export const SETTINGS_GET_ALL_GLOBAL = 'settings:getAllGlobal'
export const SETTINGS_UPDATE_GLOBAL = 'settings:updateGlobal'

// Runner
export const RUNNER_GET_STATUS = 'runner:getStatus'
export const RUNNER_START = 'runner:start'
export const RUNNER_STOP = 'runner:stop'
export const RUNNER_DETECT_NODE = 'runner:detectNode'
export const RUNNER_GET_CONFIGS = 'runner:getConfigs'
export const RUNNER_ADD_CONFIG = 'runner:addConfig'
export const RUNNER_UPDATE_CONFIG = 'runner:updateConfig'
export const RUNNER_REMOVE_CONFIG = 'runner:removeConfig'
export const RUNNER_DETECT_RUNNERS = 'runner:detectRunners'
export const RUNNER_GET_LOGS = 'runner:getLogs'
export const RUNNER_SETUP = 'runner:setup'

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

// Terminal
export const TERMINAL_SPAWN = 'terminal:spawn'
export const TERMINAL_WRITE = 'terminal:write'
export const TERMINAL_RESIZE = 'terminal:resize'
export const TERMINAL_KILL = 'terminal:kill'

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

// Agents
export const AGENTS_LIST = 'agents:list'
export const AGENTS_ROUTE = 'agents:route'
export const AGENTS_DISPATCH = 'agents:dispatch'
export const AGENTS_EXECUTE = 'agents:execute'
export const AGENTS_CANCEL = 'agents:cancel'
export const AGENTS_CANCEL_ALL = 'agents:cancelAll'
export const AGENTS_HISTORY = 'agents:history'
export const AGENTS_LIST_PIPELINES = 'agents:listPipelines'
export const AGENTS_RUN_PIPELINE = 'agents:runPipeline'
export const AGENTS_RUN_WORKFLOW = 'agents:runWorkflow'
export const AGENTS_BUILD = 'agents:build'
export const AGENTS_BUILD_RESUME = 'agents:buildResume'
export const AGENTS_BUILD_CANCEL = 'agents:buildCancel'
export const AGENTS_BUILD_PROGRESS = 'agents:buildProgress'
export const AGENTS_RESPOND = 'agents:respond'
export const AGENTS_SET_AUTO_APPROVE = 'agents:setAutoApprove'
export const AGENTS_LIST_DISPATCHES = 'agents:listDispatches'
export const AGENTS_GET_DISPATCH = 'agents:getDispatch'
export const AGENTS_LIST_CHAT = 'agents:listChat'
export const AGENTS_CLEAR_CHAT = 'agents:clearChat'
export const AGENTS_CREATE_CONVERSATION = 'agents:createConversation'
export const AGENTS_LIST_CONVERSATIONS = 'agents:listConversations'
export const AGENTS_DELETE_CONVERSATION = 'agents:deleteConversation'
export const AGENTS_GET_ARTIFACTS = 'agents:getArtifacts'

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
export const TERMINAL_ON_OUTPUT = 'terminal:onOutput'
export const TERMINAL_ON_EXIT = 'terminal:onExit'
export const GIT_ON_STATUS_CHANGE = 'git:onStatusChange'
export const AGENTS_ON_EVENT = 'agents:onEvent'
export const AGENTS_ON_WORKFLOW_EVENT = 'agents:onWorkflowEvent'
export const AGENTS_ON_BUILD_EVENT = 'agents:onBuildEvent'
export const AGENTS_ON_INPUT_REQUEST = 'agents:onInputRequest'

// Channel allowlists for preload security
export const INVOKE_CHANNELS = [
  PROJECTS_LIST, PROJECTS_GET, PROJECTS_REGISTER, PROJECTS_CREATE, PROJECTS_CLONE,
  PROJECTS_RENAME, PROJECTS_REMOVE, PROJECTS_VALIDATE,
  BROWSE_LIST,
  SESSIONS_LIST, SESSIONS_GET, SESSIONS_CREATE, SESSIONS_RENAME, SESSIONS_DELETE,
  FILES_TREE, FILES_CONTENT, FILES_SEARCH, FILES_REVEAL, FILES_OPEN_IN_EDITOR, FILES_DETECT_EDITORS, FILES_SAVE, FILES_RENAME, FILES_DELETE,
  TEMPLATES_LIST, TEMPLATES_INTERPOLATE,
  SETTINGS_GET_ALL, SETTINGS_UPDATE, SETTINGS_GET_ALL_GLOBAL, SETTINGS_UPDATE_GLOBAL,
  RUNNER_GET_STATUS, RUNNER_START, RUNNER_STOP, RUNNER_DETECT_NODE,
  RUNNER_GET_CONFIGS, RUNNER_ADD_CONFIG, RUNNER_UPDATE_CONFIG, RUNNER_REMOVE_CONFIG, RUNNER_DETECT_RUNNERS, RUNNER_GET_LOGS, RUNNER_SETUP,
  CLAUDE_SEND_PROMPT, CLAUDE_CANCEL,
  MCP_LIST, MCP_ADD, MCP_UPDATE, MCP_REMOVE, MCP_TOGGLE, MCP_TEST,
  HEALTH_CHECK,
  SETUP_CHECK, SETUP_INSTALL_CLAUDE,
  KNOWLEDGE_LIST, KNOWLEDGE_GET, KNOWLEDGE_SAVE, KNOWLEDGE_CREATE, KNOWLEDGE_REMOVE,
  SKILLS_LIST, SKILLS_GET, SKILLS_ADD, SKILLS_UPDATE, SKILLS_REMOVE,
  TERMINAL_SPAWN, TERMINAL_WRITE, TERMINAL_RESIZE, TERMINAL_KILL,
  GIT_STATUS, GIT_CHANGED_FILES, GIT_DIFF,
  GIT_CREATE_CHECKPOINT, GIT_GENERATE_MESSAGE, GIT_HISTORY,
  GIT_LIST_VERSIONS, GIT_CREATE_VERSION, GIT_SWITCH_VERSION, GIT_APPLY_VERSION,
  GIT_SYNC, GIT_SYNC_STATUS,
  GIT_CONFLICTS, GIT_RESOLVE_CONFLICT,
  GIT_COMMIT_DETAIL,
  GIT_INIT,
  AGENTS_LIST, AGENTS_ROUTE, AGENTS_DISPATCH, AGENTS_EXECUTE, AGENTS_CANCEL, AGENTS_CANCEL_ALL,
  AGENTS_HISTORY, AGENTS_LIST_PIPELINES, AGENTS_RUN_PIPELINE, AGENTS_RUN_WORKFLOW,
  AGENTS_BUILD, AGENTS_BUILD_RESUME, AGENTS_BUILD_CANCEL, AGENTS_BUILD_PROGRESS,
  AGENTS_RESPOND, AGENTS_SET_AUTO_APPROVE,
  AGENTS_LIST_DISPATCHES, AGENTS_GET_DISPATCH, AGENTS_LIST_CHAT, AGENTS_CLEAR_CHAT,
  AGENTS_CREATE_CONVERSATION, AGENTS_LIST_CONVERSATIONS, AGENTS_DELETE_CONVERSATION,
  AGENTS_GET_ARTIFACTS,
] as const

export const SUBSCRIBE_CHANNELS = [
  PROJECTS_ON_CREATE_OUTPUT, PROJECTS_ON_CREATE_DONE, PROJECTS_ON_CREATE_ERROR,
  CLAUDE_ON_MESSAGE, CLAUDE_ON_TOOL_USE, CLAUDE_ON_DONE, CLAUDE_ON_ERROR,
  FILES_ON_CHANGED,
  RUNNER_ON_STATUS, RUNNER_ON_OUTPUT,
  WINDOW_ON_FULLSCREEN,
  TERMINAL_ON_OUTPUT, TERMINAL_ON_EXIT,
  GIT_ON_STATUS_CHANGE,
  AGENTS_ON_EVENT, AGENTS_ON_WORKFLOW_EVENT, AGENTS_ON_BUILD_EVENT, AGENTS_ON_INPUT_REQUEST,
] as const
