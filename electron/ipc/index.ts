import type { BrowserWindow } from "electron";
import type { ProjectManager } from "../../server/services/projects.js";
import type { SessionManager } from "../../server/services/chat/single-agent/index.js";
import type { AgentSessionManager } from "../../server/services/chat/multi-agents/index.js";
import type { ConversationEventService } from "../../server/services/events/index.js";
import type { ArtifactService } from "../../server/services/artifacts/index.js";
import type { CommandService } from "../../server/services/commands/index.js";
import type { SettingsManager } from "../../server/services/settings.js";
import type { RunnerManager } from "../../server/services/runner/index.js";
import type { RunnerConfigService } from "../../server/services/runner/runner-config.js";
import type { McpManager } from "../../server/services/mcp.js";
import type { SkillsManager } from "../../server/services/skills.js";
import type { KnowledgeManager } from "../../server/services/knowledge.js";
import type { GitManager } from "../../server/services/git/index.js";
import type { TerminalManager } from "../../server/services/terminal.js";
import type { GraphifyManager } from "../../server/services/graphify/index.js";
import type { PythonManager } from "../../server/services/python/index.js";
import { AttachmentService } from "../../server/services/attachments/index.js";

import { setupProjectsIPC } from "./projects.js";
import { setupAttachmentsIPC } from "./attachments.js";
import { setupSessionsIPC } from "./sessions.js";
import { setupFilesIPC } from "./files.js";
import { setupTemplatesIPC } from "./templates.js";
import { setupSettingsIPC } from "./settings.js";
import { setupSingleAgentIPC } from "./single-agent.js";
import { setupRunnerIPC } from "./runner.js";
import { setupHealthIPC } from "./health.js";
import { setupMcpIPC } from "./mcp.js";
import { setupKnowledgeIPC } from "./knowledge.js";
import { setupSkillsIPC } from "./skills.js";
import { setupSetupIPC } from "./setup.js";
import { setupFolderDialogIPC } from "./folder-dialog.js";
import { setupGitIPC } from "./git.js";
import { setupTerminalIPC } from "./terminal.js";
import { setupMultiAgentsIPC } from "./multi-agents.js";
import { setupConversationEventsIPC } from "./conversation-events.js";
import { setupAgentTasksIPC } from "./agent-tasks.js";
import { setupArtifactsIPC } from "./artifacts.js";
import { setupCommandsIPC } from "./commands.js";
import { setupGraphifyIPC } from "./graphify.js";
import { setupPythonIPC } from "./python.js";
import { setupWindowIPC } from "./window.js";
import type { Ai } from "../../server/services/ai/ai.js";

export function setupAllIPC(
  getWindow: () => BrowserWindow | null,
  projectManager: ProjectManager,
  sessionManager: SessionManager,
  agentSessionManager: AgentSessionManager,
  eventService: ConversationEventService,
  artifactService: ArtifactService,
  commandService: CommandService,
  ai: Ai,
  settingsManager: SettingsManager,
  runnerManager: RunnerManager,
  runnerConfigService: RunnerConfigService,
  mcpManager: McpManager,
  skillsManager: SkillsManager,
  knowledgeManager: KnowledgeManager,
  gitManager: GitManager,
  terminalManager: TerminalManager,
  graphifyManager: GraphifyManager,
  pythonManager: PythonManager,
) {
  setupFolderDialogIPC();
  setupWindowIPC(getWindow);
  setupProjectsIPC(getWindow, projectManager, settingsManager);
  setupSessionsIPC(sessionManager, projectManager);
  setupFilesIPC(projectManager);
  setupTemplatesIPC();
  setupSettingsIPC(settingsManager, projectManager);
  setupSingleAgentIPC(
    getWindow,
    ai,
    sessionManager,
    projectManager,
    settingsManager,
    mcpManager,
    eventService,
  );
  setupRunnerIPC(
    getWindow,
    runnerManager,
    runnerConfigService,
    projectManager,
    settingsManager,
  );
  setupMcpIPC(mcpManager, projectManager, settingsManager);
  setupHealthIPC(ai, projectManager);
  setupKnowledgeIPC(knowledgeManager, projectManager);
  setupSkillsIPC(skillsManager, projectManager);
  setupSetupIPC(settingsManager, projectManager);
  setupGitIPC(getWindow, gitManager, projectManager, ai);
  setupTerminalIPC(getWindow, terminalManager, projectManager, settingsManager);
  setupPythonIPC(getWindow, pythonManager, settingsManager);
  setupGraphifyIPC(
    getWindow,
    graphifyManager,
    projectManager,
    settingsManager,
    gitManager,
  );
  setupMultiAgentsIPC(
    getWindow,
    projectManager,
    settingsManager,
    mcpManager,
    ai,
    agentSessionManager,
    eventService,
    artifactService,
  );
  setupConversationEventsIPC(getWindow, eventService);
  setupAgentTasksIPC(agentSessionManager);
  setupArtifactsIPC(getWindow, artifactService);
  setupCommandsIPC(getWindow, commandService);
  setupAttachmentsIPC(new AttachmentService(projectManager));
}
