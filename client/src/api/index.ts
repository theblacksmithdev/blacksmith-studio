import { projects } from "./modules/projects";
import { sessions } from "./modules/sessions";
import { files } from "./modules/files";
import { settings } from "./modules/settings";
import { runner } from "./modules/runner";
import { singleAgent } from "./modules/single-agent";
import { templates } from "./modules/templates";
import { health } from "./modules/health";
import { windowApi } from "./modules/window";
import { browse } from "./modules/browse";
import { mcp } from "./modules/mcp";
import { setup } from "./modules/setup";
import { skills } from "./modules/skills";
import { knowledge } from "./modules/knowledge";
import { git } from "./modules/git";
import { terminal } from "./modules/terminal";
import { multiAgents } from "./modules/multi-agents";
import { conversationEvents } from "./modules/conversation-events";
import { agentTasks } from "./modules/agent-tasks";
import { artifacts } from "./modules/artifacts";
import { commands } from "./modules/commands";
import { python } from "./modules/python";
import { graphify } from "./modules/graphify";
import { attachments } from "./modules/attachments";
import { usage } from "./modules/usage";
import { ai } from "./modules/ai";

export const api = {
  projects,
  sessions,
  files,
  settings,
  runner,
  singleAgent,
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
  multiAgents,
  conversationEvents,
  agentTasks,
  artifacts,
  commands,
  python,
  graphify,
  attachments,
  usage,
  ai,
} as const;
