import { ipcMain } from "electron";
import type { ClaudeManager } from "../../server/services/claude/index.js";
import type { ProjectManager } from "../../server/services/projects.js";
import { HEALTH_CHECK } from "./channels.js";

export function setupHealthIPC(
  claudeManager: ClaudeManager,
  projectManager: ProjectManager,
) {
  ipcMain.handle(HEALTH_CHECK, async (_e, data?: { projectId?: string }) => {
    const claude = await claudeManager.checkInstalled();
    const project = data?.projectId ? projectManager.get(data.projectId) : null;
    return {
      projectName: project?.name || null,
      projectPath: project?.path || null,
      claudeInstalled: claude.installed,
      claudeVersion: claude.version,
    };
  });
}
