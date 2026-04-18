// ─── Request/Response Channels (replacing HTTP REST) ───

// Projects
export const PROJECTS_LIST = "projects:list";
export const PROJECTS_GET = "projects:get";
export const PROJECTS_REGISTER = "projects:register";
export const PROJECTS_TOUCH = "projects:touch";
export const PROJECTS_CREATE = "projects:create";
export const PROJECTS_RENAME = "projects:rename";
export const PROJECTS_REMOVE = "projects:remove";
export const PROJECTS_VALIDATE = "projects:validate";
export const PROJECTS_CLONE = "projects:clone";

// Browse
export const BROWSE_LIST = "browse:list";

// Sessions
export const SESSIONS_LIST = "sessions:list";
export const SESSIONS_GET = "sessions:get";
export const SESSIONS_CREATE = "sessions:create";
export const SESSIONS_RENAME = "sessions:rename";
export const SESSIONS_DELETE = "sessions:delete";

// Files
export const FILES_TREE = "files:tree";
export const FILES_CHILDREN = "files:children";
export const FILES_CONTENT = "files:content";
export const FILES_SEARCH = "files:search";
export const FILES_REVEAL = "files:reveal";
export const FILES_OPEN_IN_EDITOR = "files:openInEditor";
export const FILES_DETECT_EDITORS = "files:detectEditors";
export const FILES_SAVE = "files:save";
export const FILES_RENAME = "files:rename";
export const FILES_DELETE = "files:delete";

// Attachments
export const ATTACHMENTS_SAVE = "attachments:save";
export const ATTACHMENTS_SAVE_FROM_PATH = "attachments:saveFromPath";
export const ATTACHMENTS_READ = "attachments:read";
export const ATTACHMENTS_DELETE = "attachments:delete";
export const ATTACHMENTS_OPEN = "attachments:open";

// Templates
export const TEMPLATES_LIST = "templates:list";
export const TEMPLATES_INTERPOLATE = "templates:interpolate";

// Settings
export const SETTINGS_GET_ALL = "settings:getAll";
export const SETTINGS_UPDATE = "settings:update";
export const SETTINGS_GET_ALL_GLOBAL = "settings:getAllGlobal";
export const SETTINGS_UPDATE_GLOBAL = "settings:updateGlobal";

// Runner
export const RUNNER_GET_STATUS = "runner:getStatus";
export const RUNNER_START = "runner:start";
export const RUNNER_STOP = "runner:stop";
export const RUNNER_DETECT_NODE = "runner:detectNode";
export const RUNNER_GET_CONFIGS = "runner:getConfigs";
export const RUNNER_ADD_CONFIG = "runner:addConfig";
export const RUNNER_UPDATE_CONFIG = "runner:updateConfig";
export const RUNNER_REMOVE_CONFIG = "runner:removeConfig";
export const RUNNER_DETECT_RUNNERS = "runner:detectRunners";
export const RUNNER_GET_LOGS = "runner:getLogs";
export const RUNNER_SETUP = "runner:setup";

// Claude
export const SINGLE_AGENT_SEND_PROMPT = "singleAgent:sendPrompt";
export const SINGLE_AGENT_CANCEL = "singleAgent:cancel";

// MCP
export const MCP_LIST = "mcp:list";
export const MCP_ADD = "mcp:add";
export const MCP_UPDATE = "mcp:update";
export const MCP_REMOVE = "mcp:remove";
export const MCP_TOGGLE = "mcp:toggle";
export const MCP_TEST = "mcp:test";

// Window
export const WINDOW_GET_STATE = "window:getState";

// Health
export const HEALTH_CHECK = "health:check";

// Setup
export const SETUP_CHECK = "setup:check";
export const SETUP_INSTALL_CLAUDE = "setup:installClaude";

// Knowledge
export const KNOWLEDGE_LIST = "knowledge:list";
export const KNOWLEDGE_GET = "knowledge:get";
export const KNOWLEDGE_SAVE = "knowledge:save";
export const KNOWLEDGE_CREATE = "knowledge:create";
export const KNOWLEDGE_REMOVE = "knowledge:remove";

// Skills
export const SKILLS_LIST = "skills:list";
export const SKILLS_GET = "skills:get";
export const SKILLS_ADD = "skills:add";
export const SKILLS_UPDATE = "skills:update";
export const SKILLS_REMOVE = "skills:remove";

// Terminal
export const TERMINAL_SPAWN = "terminal:spawn";
export const TERMINAL_WRITE = "terminal:write";
export const TERMINAL_RESIZE = "terminal:resize";
export const TERMINAL_KILL = "terminal:kill";

// Git
export const GIT_STATUS = "git:status";
export const GIT_CHANGED_FILES = "git:changedFiles";
export const GIT_DIFF = "git:diff";
export const GIT_CREATE_CHECKPOINT = "git:createCheckpoint";
export const GIT_GENERATE_MESSAGE = "git:generateMessage";
export const GIT_HISTORY = "git:history";
export const GIT_LIST_VERSIONS = "git:listVersions";
export const GIT_CREATE_VERSION = "git:createVersion";
export const GIT_SWITCH_VERSION = "git:switchVersion";
export const GIT_APPLY_VERSION = "git:applyVersion";
export const GIT_SYNC = "git:sync";
export const GIT_SYNC_STATUS = "git:syncStatus";
export const GIT_CONFLICTS = "git:conflicts";
export const GIT_RESOLVE_CONFLICT = "git:resolveConflict";
export const GIT_COMMIT_DETAIL = "git:commitDetail";
export const GIT_INIT = "git:init";

// Python
export const PYTHON_DETECT = "python:detect";
export const PYTHON_CHECK = "python:check";
export const PYTHON_SETUP_VENV = "python:setupVenv";
export const PYTHON_RESET_VENV = "python:resetVenv";
export const PYTHON_INSTALL_PACKAGE = "python:installPackage";
export const PYTHON_IS_PACKAGE_INSTALLED = "python:isPackageInstalled";

// Graphify
export const GRAPHIFY_CHECK = "graphify:check";
export const GRAPHIFY_SETUP = "graphify:setup";
export const GRAPHIFY_STATUS = "graphify:status";
export const GRAPHIFY_BUILD = "graphify:build";
export const GRAPHIFY_QUERY = "graphify:query";
export const GRAPHIFY_CLEAN = "graphify:clean";
export const GRAPHIFY_OPEN_VIZ = "graphify:openVisualization";

// Agents
export const MULTI_AGENTS_LIST = "multiAgents:list";
export const MULTI_AGENTS_ROUTE = "multiAgents:route";
export const MULTI_AGENTS_DISPATCH = "multiAgents:dispatch";
export const MULTI_AGENTS_EXECUTE = "multiAgents:execute";
export const MULTI_AGENTS_CANCEL = "multiAgents:cancel";
export const MULTI_AGENTS_CANCEL_ALL = "multiAgents:cancelAll";
export const MULTI_AGENTS_HISTORY = "multiAgents:history";
export const MULTI_AGENTS_LIST_PIPELINES = "multiAgents:listPipelines";
export const MULTI_AGENTS_RUN_PIPELINE = "multiAgents:runPipeline";
export const MULTI_AGENTS_RUN_WORKFLOW = "multiAgents:runWorkflow";
export const MULTI_AGENTS_BUILD = "multiAgents:build";
export const MULTI_AGENTS_BUILD_RESUME = "multiAgents:buildResume";
export const MULTI_AGENTS_BUILD_CANCEL = "multiAgents:buildCancel";
export const MULTI_AGENTS_BUILD_PROGRESS = "multiAgents:buildProgress";
export const MULTI_AGENTS_RESPOND = "multiAgents:respond";
export const MULTI_AGENTS_SET_AUTO_APPROVE = "multiAgents:setAutoApprove";
export const MULTI_AGENTS_LIST_DISPATCHES = "multiAgents:listDispatches";
export const MULTI_AGENTS_GET_DISPATCH = "multiAgents:getDispatch";
export const MULTI_AGENTS_LIST_CHAT = "multiAgents:listChat";
export const MULTI_AGENTS_CLEAR_CHAT = "multiAgents:clearChat";
export const MULTI_AGENTS_CREATE_CONVERSATION =
  "multiAgents:createConversation";
export const MULTI_AGENTS_LIST_CONVERSATIONS = "multiAgents:listConversations";
export const MULTI_AGENTS_DELETE_CONVERSATION =
  "multiAgents:deleteConversation";
export const MULTI_AGENTS_GET_ARTIFACTS = "multiAgents:getArtifacts";

// Conversation Events (unified event log for single-agent + multi-agent chats)
export const CONVERSATION_EVENTS_LIST = "conversationEvents:list";
export const CONVERSATION_EVENTS_LIST_BY_DISPATCH =
  "conversationEvents:listByDispatch";
export const CONVERSATION_EVENTS_LIST_BY_TASK = "conversationEvents:listByTask";

// Agent Tasks (DB model for multi-agent team tasks)
export const AGENT_TASKS_LIST = "agentTasks:list";
export const AGENT_TASKS_GET = "agentTasks:get";
export const AGENT_TASK_NOTES_LIST = "agentTasks:listNotes";
export const AGENT_TASK_NOTES_ADD = "agentTasks:addNote";
export const AGENT_TASK_DEPENDENCIES_LIST = "agentTasks:listDependencies";

// ─── Push/Stream Channels ───

// Project creation
export const PROJECTS_ON_CREATE_OUTPUT = "projects:onCreateOutput";
export const PROJECTS_ON_CREATE_DONE = "projects:onCreateDone";
export const PROJECTS_ON_CREATE_ERROR = "projects:onCreateError";

export const SINGLE_AGENT_ON_MESSAGE = "singleAgent:onMessage";
export const SINGLE_AGENT_ON_TOOL_USE = "singleAgent:onToolUse";
export const SINGLE_AGENT_ON_DONE = "singleAgent:onDone";
export const SINGLE_AGENT_ON_ERROR = "singleAgent:onError";
export const FILES_ON_CHANGED = "files:onChanged";
export const RUNNER_ON_STATUS = "runner:onStatus";
export const RUNNER_ON_OUTPUT = "runner:onOutput";
export const WINDOW_ON_FULLSCREEN = "window:onFullscreen";
export const TERMINAL_ON_OUTPUT = "terminal:onOutput";
export const TERMINAL_ON_EXIT = "terminal:onExit";
export const GIT_ON_STATUS_CHANGE = "git:onStatusChange";
export const PYTHON_ON_PROGRESS = "python:onProgress";
export const GRAPHIFY_ON_BUILD_PROGRESS = "graphify:onBuildProgress";
export const MULTI_AGENTS_ON_EVENT = "multiAgents:onEvent";
export const MULTI_AGENTS_ON_WORKFLOW_EVENT = "multiAgents:onWorkflowEvent";
export const MULTI_AGENTS_ON_BUILD_EVENT = "multiAgents:onBuildEvent";
export const MULTI_AGENTS_ON_INPUT_REQUEST = "multiAgents:onInputRequest";
export const CONVERSATION_EVENTS_ON_APPEND = "conversationEvents:onAppend";

// Channel allowlists for preload security
export const INVOKE_CHANNELS = [
  PROJECTS_LIST,
  PROJECTS_GET,
  PROJECTS_REGISTER,
  PROJECTS_TOUCH,
  PROJECTS_CREATE,
  PROJECTS_CLONE,
  PROJECTS_RENAME,
  PROJECTS_REMOVE,
  PROJECTS_VALIDATE,
  BROWSE_LIST,
  SESSIONS_LIST,
  SESSIONS_GET,
  SESSIONS_CREATE,
  SESSIONS_RENAME,
  SESSIONS_DELETE,
  FILES_TREE,
  FILES_CHILDREN,
  FILES_CONTENT,
  FILES_SEARCH,
  FILES_REVEAL,
  FILES_OPEN_IN_EDITOR,
  FILES_DETECT_EDITORS,
  FILES_SAVE,
  FILES_RENAME,
  FILES_DELETE,
  ATTACHMENTS_SAVE,
  ATTACHMENTS_SAVE_FROM_PATH,
  ATTACHMENTS_READ,
  ATTACHMENTS_DELETE,
  ATTACHMENTS_OPEN,
  TEMPLATES_LIST,
  TEMPLATES_INTERPOLATE,
  SETTINGS_GET_ALL,
  SETTINGS_UPDATE,
  SETTINGS_GET_ALL_GLOBAL,
  SETTINGS_UPDATE_GLOBAL,
  RUNNER_GET_STATUS,
  RUNNER_START,
  RUNNER_STOP,
  RUNNER_DETECT_NODE,
  RUNNER_GET_CONFIGS,
  RUNNER_ADD_CONFIG,
  RUNNER_UPDATE_CONFIG,
  RUNNER_REMOVE_CONFIG,
  RUNNER_DETECT_RUNNERS,
  RUNNER_GET_LOGS,
  RUNNER_SETUP,
  SINGLE_AGENT_SEND_PROMPT,
  SINGLE_AGENT_CANCEL,
  MCP_LIST,
  MCP_ADD,
  MCP_UPDATE,
  MCP_REMOVE,
  MCP_TOGGLE,
  MCP_TEST,
  WINDOW_GET_STATE,
  HEALTH_CHECK,
  SETUP_CHECK,
  SETUP_INSTALL_CLAUDE,
  KNOWLEDGE_LIST,
  KNOWLEDGE_GET,
  KNOWLEDGE_SAVE,
  KNOWLEDGE_CREATE,
  KNOWLEDGE_REMOVE,
  SKILLS_LIST,
  SKILLS_GET,
  SKILLS_ADD,
  SKILLS_UPDATE,
  SKILLS_REMOVE,
  TERMINAL_SPAWN,
  TERMINAL_WRITE,
  TERMINAL_RESIZE,
  TERMINAL_KILL,
  GIT_STATUS,
  GIT_CHANGED_FILES,
  GIT_DIFF,
  GIT_CREATE_CHECKPOINT,
  GIT_GENERATE_MESSAGE,
  GIT_HISTORY,
  GIT_LIST_VERSIONS,
  GIT_CREATE_VERSION,
  GIT_SWITCH_VERSION,
  GIT_APPLY_VERSION,
  GIT_SYNC,
  GIT_SYNC_STATUS,
  GIT_CONFLICTS,
  GIT_RESOLVE_CONFLICT,
  GIT_COMMIT_DETAIL,
  GIT_INIT,
  PYTHON_DETECT,
  PYTHON_CHECK,
  PYTHON_SETUP_VENV,
  PYTHON_RESET_VENV,
  PYTHON_INSTALL_PACKAGE,
  PYTHON_IS_PACKAGE_INSTALLED,
  GRAPHIFY_CHECK,
  GRAPHIFY_SETUP,
  GRAPHIFY_STATUS,
  GRAPHIFY_BUILD,
  GRAPHIFY_QUERY,
  GRAPHIFY_CLEAN,
  GRAPHIFY_OPEN_VIZ,
  MULTI_AGENTS_LIST,
  MULTI_AGENTS_ROUTE,
  MULTI_AGENTS_DISPATCH,
  MULTI_AGENTS_EXECUTE,
  MULTI_AGENTS_CANCEL,
  MULTI_AGENTS_CANCEL_ALL,
  MULTI_AGENTS_HISTORY,
  MULTI_AGENTS_LIST_PIPELINES,
  MULTI_AGENTS_RUN_PIPELINE,
  MULTI_AGENTS_RUN_WORKFLOW,
  MULTI_AGENTS_BUILD,
  MULTI_AGENTS_BUILD_RESUME,
  MULTI_AGENTS_BUILD_CANCEL,
  MULTI_AGENTS_BUILD_PROGRESS,
  MULTI_AGENTS_RESPOND,
  MULTI_AGENTS_SET_AUTO_APPROVE,
  MULTI_AGENTS_LIST_DISPATCHES,
  MULTI_AGENTS_GET_DISPATCH,
  MULTI_AGENTS_LIST_CHAT,
  MULTI_AGENTS_CLEAR_CHAT,
  MULTI_AGENTS_CREATE_CONVERSATION,
  MULTI_AGENTS_LIST_CONVERSATIONS,
  MULTI_AGENTS_DELETE_CONVERSATION,
  MULTI_AGENTS_GET_ARTIFACTS,
  CONVERSATION_EVENTS_LIST,
  CONVERSATION_EVENTS_LIST_BY_DISPATCH,
  CONVERSATION_EVENTS_LIST_BY_TASK,
  AGENT_TASKS_LIST,
  AGENT_TASKS_GET,
  AGENT_TASK_NOTES_LIST,
  AGENT_TASK_NOTES_ADD,
  AGENT_TASK_DEPENDENCIES_LIST,
] as const;

export const SUBSCRIBE_CHANNELS = [
  PROJECTS_ON_CREATE_OUTPUT,
  PROJECTS_ON_CREATE_DONE,
  PROJECTS_ON_CREATE_ERROR,
  SINGLE_AGENT_ON_MESSAGE,
  SINGLE_AGENT_ON_TOOL_USE,
  SINGLE_AGENT_ON_DONE,
  SINGLE_AGENT_ON_ERROR,
  FILES_ON_CHANGED,
  RUNNER_ON_STATUS,
  RUNNER_ON_OUTPUT,
  WINDOW_ON_FULLSCREEN,
  TERMINAL_ON_OUTPUT,
  TERMINAL_ON_EXIT,
  GIT_ON_STATUS_CHANGE,
  PYTHON_ON_PROGRESS,
  GRAPHIFY_ON_BUILD_PROGRESS,
  MULTI_AGENTS_ON_EVENT,
  MULTI_AGENTS_ON_WORKFLOW_EVENT,
  MULTI_AGENTS_ON_BUILD_EVENT,
  MULTI_AGENTS_ON_INPUT_REQUEST,
  CONVERSATION_EVENTS_ON_APPEND,
] as const;
