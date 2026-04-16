import { ipcMain, shell } from "electron";
import type { BrowserWindow } from "electron";
import type { ProjectManager } from "../../server/services/projects.js";
import type { SettingsManager } from "../../server/services/settings.js";
import type { GraphifyManager } from "../../server/services/graphify.js";
import type { GitManager } from "../../server/services/git.js";
import {
  GRAPHIFY_CHECK,
  GRAPHIFY_SETUP,
  GRAPHIFY_STATUS,
  GRAPHIFY_BUILD,
  GRAPHIFY_QUERY,
  GRAPHIFY_CLEAN,
  GRAPHIFY_OPEN_VIZ,
  GRAPHIFY_ON_BUILD_PROGRESS,
} from "./channels.js";

const REBUILD_DEBOUNCE_MS = 30_000; // 30 seconds after last file change

function resolveProjectPath(pm: ProjectManager, projectId: string): string {
  const project = pm.get(projectId);
  if (!project) throw new Error("Project not found");
  return project.path;
}

export function setupGraphifyIPC(
  getWindow: () => BrowserWindow | null,
  graphifyManager: GraphifyManager,
  projectManager: ProjectManager,
  settingsManager: SettingsManager,
  gitManager?: GitManager,
) {
  ipcMain.handle(GRAPHIFY_CHECK, () => {
    return graphifyManager.checkInstalled();
  });

  ipcMain.handle(GRAPHIFY_SETUP, async () => {
    const win = getWindow();
    return graphifyManager.setup((line) => {
      win?.webContents.send(GRAPHIFY_ON_BUILD_PROGRESS, { line });
    });
  });

  ipcMain.handle(GRAPHIFY_STATUS, (_e, data: { projectId: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId);
    const maxAgeMinutes =
      settingsManager.resolve(data.projectId, "graphify.maxAgeMinutes") ?? 60;
    return graphifyManager.getStatus(root, maxAgeMinutes * 60_000);
  });

  ipcMain.handle(GRAPHIFY_BUILD, async (_e, data: { projectId: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId);
    const win = getWindow();

    return graphifyManager.build(root, (line) => {
      win?.webContents.send(GRAPHIFY_ON_BUILD_PROGRESS, { line });
    });
  });

  ipcMain.handle(
    GRAPHIFY_QUERY,
    async (_e, data: { projectId: string; question: string }) => {
      const root = resolveProjectPath(projectManager, data.projectId);
      return graphifyManager.query(root, data.question);
    },
  );

  ipcMain.handle(GRAPHIFY_CLEAN, (_e, data: { projectId: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId);
    graphifyManager.clean(root);
  });

  ipcMain.handle(GRAPHIFY_OPEN_VIZ, (_e, data: { projectId: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId);
    const vizPath = graphifyManager.getVisualizationPath(root);
    if (vizPath) {
      shell.openExternal(`file://${vizPath}`);
    }
  });

  // ── Auto-rebuild: listen for git file changes ──
  if (gitManager) {
    const rebuildTimers = new Map<string, ReturnType<typeof setTimeout>>();

    gitManager.onStatusChange((projectPath) => {
      // Find project by path to read its settings
      const project = projectManager.getByPath(projectPath);
      if (!project) return;

      const allSettings = settingsManager.getAll(project.id);
      if (!allSettings["graphify.enabled"]) return;
      if (!allSettings["graphify.autoRebuild"]) return;

      const maxAgeMs =
        ((allSettings["graphify.maxAgeMinutes"] as number) ?? 60) * 60_000;
      if (!graphifyManager.isStale(projectPath, maxAgeMs)) return;

      // Debounce: wait 30s after the last change before rebuilding
      const existing = rebuildTimers.get(projectPath);
      if (existing) clearTimeout(existing);

      rebuildTimers.set(
        projectPath,
        setTimeout(async () => {
          rebuildTimers.delete(projectPath);
          try {
            console.log(
              `[graphify] Auto-rebuilding graph for ${project.name}...`,
            );
            const win = getWindow();
            const result = await graphifyManager.build(projectPath, (line) => {
              win?.webContents.send(GRAPHIFY_ON_BUILD_PROGRESS, { line });
            });
            if (result.success) {
              console.log(
                `[graphify] Auto-rebuild complete (${(result.durationMs / 1000).toFixed(1)}s)`,
              );
            } else {
              console.warn(
                `[graphify] Auto-rebuild failed: ${result.error}`,
              );
            }
          } catch (err: any) {
            console.warn(
              `[graphify] Auto-rebuild error: ${err.message}`,
            );
          }
        }, REBUILD_DEBOUNCE_MS),
      );
    });
  }
}
