import { ipcMain } from "electron";
import type { SettingsManager } from "../../server/services/settings.js";
import type { ProjectManager } from "../../server/services/projects.js";
import {
  SETTINGS_GET_ALL,
  SETTINGS_UPDATE,
  SETTINGS_GET_ALL_GLOBAL,
  SETTINGS_UPDATE_GLOBAL,
} from "./channels.js";

function resolveProject(
  projectManager: ProjectManager,
  projectId: string,
): string {
  const project = projectManager.get(projectId);
  if (!project) throw new Error("Project not found");
  return project.id;
}

export function setupSettingsIPC(
  settingsManager: SettingsManager,
  projectManager: ProjectManager,
) {
  /* ── Project-scoped settings ── */

  ipcMain.handle(SETTINGS_GET_ALL, (_e, data: { projectId: string }) => {
    const id = resolveProject(projectManager, data.projectId);
    return settingsManager.getAll(id);
  });

  ipcMain.handle(
    SETTINGS_UPDATE,
    (_e, data: { projectId: string; settings: Record<string, any> }) => {
      const id = resolveProject(projectManager, data.projectId);
      if (!data.settings || typeof data.settings !== "object")
        throw new Error("settings must be a JSON object");
      settingsManager.setMany(id, data.settings);
      return settingsManager.getAll(id);
    },
  );

  /* ── Global settings (no project required) ── */

  ipcMain.handle(SETTINGS_GET_ALL_GLOBAL, () => {
    return settingsManager.getAllGlobal();
  });

  ipcMain.handle(SETTINGS_UPDATE_GLOBAL, (_e, data: Record<string, any>) => {
    if (!data || typeof data !== "object")
      throw new Error("Body must be a JSON object");
    settingsManager.setManyGlobal(data);
    return settingsManager.getAllGlobal();
  });
}
