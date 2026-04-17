import { ipcMain } from "electron";
import type { Ai } from "../../server/services/ai/ai.js";
import type { ProjectManager } from "../../server/services/projects.js";
import { HEALTH_CHECK } from "./channels.js";

export function setupHealthIPC(ai: Ai, projectManager: ProjectManager) {
  ipcMain.handle(HEALTH_CHECK, async (_e, data?: { projectId?: string }) => {
    const providerStatus = await ai.checkStatus();
    const project = data?.projectId ? projectManager.get(data.projectId) : null;
    return {
      projectName: project?.name || null,
      projectPath: project?.path || null,
      // Retained IPC field names for backward compatibility with the renderer
      // (the field is still "claude*" because that's what the client renders).
      claudeInstalled: providerStatus.available,
      claudeVersion: providerStatus.version,
    };
  });
}
