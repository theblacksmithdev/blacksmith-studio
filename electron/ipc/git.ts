import { ipcMain, type BrowserWindow } from "electron";
import type { GitManager } from "../../server/services/git.js";
import type { ProjectManager } from "../../server/services/projects.js";
import type { Ai } from "../../server/services/ai/ai.js";
import {
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
  GIT_ON_STATUS_CHANGE,
} from "./channels.js";

function resolveProjectPath(
  projectManager: ProjectManager,
  projectId: string,
): string {
  const project = projectManager.get(projectId);
  if (!project) throw new Error("Project not found");
  return project.path;
}

export function setupGitIPC(
  getWindow: () => BrowserWindow | null,
  gitManager: GitManager,
  projectManager: ProjectManager,
  ai?: Ai,
) {
  /** Guard: check repo is initialized before running git commands. */
  async function requireRepo(projectId: string): Promise<string> {
    const p = resolveProjectPath(projectManager, projectId);
    const status = await gitManager.getStatus(p);
    if (!status.initialized)
      throw new Error(
        "This project is not a git repository. Initialize one from Source Control.",
      );
    return p;
  }

  // Debounced status change push — one timer per project path
  const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  gitManager.onStatusChange(async (projectPath) => {
    const existing = debounceTimers.get(projectPath);
    if (existing) clearTimeout(existing);

    debounceTimers.set(
      projectPath,
      setTimeout(async () => {
        debounceTimers.delete(projectPath);
        try {
          const project = projectManager.getByPath(projectPath);
          if (!project) return;
          const status = await gitManager.getStatus(projectPath);
          getWindow()?.webContents.send(GIT_ON_STATUS_CHANGE, {
            projectId: project.id,
            ...status,
          });
        } catch {
          /* ignore */
        }
      }, 500),
    );
  });

  // ── Status ──

  ipcMain.handle(GIT_STATUS, async (_e, data: { projectId: string }) => {
    const p = resolveProjectPath(projectManager, data.projectId);
    return gitManager.getStatus(p);
  });

  ipcMain.handle(
    GIT_CHANGED_FILES,
    async (
      _e,
      data: { projectId: string; limit?: number; offset?: number },
    ) => {
      const p = await requireRepo(data.projectId);
      return gitManager.getChangedFiles(p, data);
    },
  );

  ipcMain.handle(
    GIT_DIFF,
    async (_e, data: { projectId: string; path: string }) => {
      const p = await requireRepo(data.projectId);
      return gitManager.getDiff(p, data.path);
    },
  );

  // ── Commits ──

  ipcMain.handle(
    GIT_CREATE_CHECKPOINT,
    async (
      _e,
      data: { projectId: string; message: string; files?: string[] },
    ) => {
      const p = await requireRepo(data.projectId);
      return gitManager.commit(p, data.message, data.files);
    },
  );

  ipcMain.handle(
    GIT_GENERATE_MESSAGE,
    async (_e, data: { projectId: string }) => {
      const p = await requireRepo(data.projectId);
      return gitManager.generateMessage(p, ai);
    },
  );

  ipcMain.handle(
    GIT_HISTORY,
    async (_e, data: { projectId: string; limit?: number }) => {
      const p = await requireRepo(data.projectId);
      return gitManager.getHistory(p, data.limit);
    },
  );

  // ── Branches ──

  ipcMain.handle(GIT_LIST_VERSIONS, async (_e, data: { projectId: string }) => {
    const p = await requireRepo(data.projectId);
    return gitManager.listBranches(p);
  });

  ipcMain.handle(
    GIT_CREATE_VERSION,
    async (_e, data: { projectId: string; name: string }) => {
      const p = await requireRepo(data.projectId);
      return gitManager.createBranch(p, data.name);
    },
  );

  ipcMain.handle(
    GIT_SWITCH_VERSION,
    async (_e, data: { projectId: string; name: string }) => {
      const p = await requireRepo(data.projectId);
      return gitManager.switchBranch(p, data.name);
    },
  );

  ipcMain.handle(
    GIT_APPLY_VERSION,
    async (_e, data: { projectId: string; source: string; target: string }) => {
      const p = await requireRepo(data.projectId);
      return gitManager.merge(p, data.source, data.target);
    },
  );

  // ── Push / Pull ──

  ipcMain.handle(GIT_SYNC, async (_e, data: { projectId: string }) => {
    const p = await requireRepo(data.projectId);
    return gitManager.sync(p);
  });

  ipcMain.handle(GIT_SYNC_STATUS, async (_e, data: { projectId: string }) => {
    const p = await requireRepo(data.projectId);
    return gitManager.getSyncStatus(p);
  });

  // ── Conflicts ──

  ipcMain.handle(GIT_CONFLICTS, async (_e, data: { projectId: string }) => {
    const p = await requireRepo(data.projectId);
    return gitManager.getConflicts(p);
  });

  ipcMain.handle(
    GIT_RESOLVE_CONFLICT,
    async (
      _e,
      data: { projectId: string; path: string; resolution: "ours" | "theirs" },
    ) => {
      const p = await requireRepo(data.projectId);
      return gitManager.resolveConflict(p, data.path, data.resolution);
    },
  );

  // ── Commit Detail ──

  ipcMain.handle(
    GIT_COMMIT_DETAIL,
    async (_e, data: { projectId: string; hash: string }) => {
      const p = await requireRepo(data.projectId);
      return gitManager.getCommitDetail(p, data.hash);
    },
  );

  // ── Init ──

  ipcMain.handle(GIT_INIT, async (_e, data: { projectId: string }) => {
    const p = resolveProjectPath(projectManager, data.projectId);
    return gitManager.init(p);
  });
}
