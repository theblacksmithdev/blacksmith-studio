import fs from "node:fs";
import path from "node:path";
import { ipcMain, shell } from "electron";
import type { ProjectManager } from "../../server/services/projects.js";
import {
  buildFileTree,
  listChildren,
  readFileContent,
  writeFileContent,
  searchFileContents,
} from "../../server/services/files.js";
import { detectEditors, openInEditor } from "../../server/services/editors.js";
import {
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
} from "./channels.js";

function resolveProjectPath(
  projectManager: ProjectManager,
  projectId: string,
): string {
  const project = projectManager.get(projectId);
  if (!project) throw new Error("Project not found");
  return project.path;
}

export function setupFilesIPC(projectManager: ProjectManager) {
  ipcMain.handle(FILES_TREE, (_e, data: { projectId: string }) => {
    const projectPath = resolveProjectPath(projectManager, data.projectId);
    return buildFileTree(projectPath);
  });

  ipcMain.handle(
    FILES_CHILDREN,
    (_e, data: { projectId: string; path: string }) => {
      const projectPath = resolveProjectPath(projectManager, data.projectId);
      return listChildren(projectPath, data.path);
    },
  );

  ipcMain.handle(
    FILES_CONTENT,
    (_e, data: { projectId: string; path: string }) => {
      const projectPath = resolveProjectPath(projectManager, data.projectId);
      if (!data.path) throw new Error("path is required");
      return readFileContent(projectPath, data.path);
    },
  );

  ipcMain.handle(
    FILES_SEARCH,
    (_e, data: { projectId: string; query: string; maxResults?: number }) => {
      const projectPath = resolveProjectPath(projectManager, data.projectId);
      if (!data.query) return [];
      return searchFileContents(projectPath, data.query, data.maxResults);
    },
  );

  ipcMain.handle(
    FILES_REVEAL,
    (_e, data: { projectId: string; path: string }) => {
      const projectPath = resolveProjectPath(projectManager, data.projectId);
      const fullPath = path.resolve(projectPath, data.path);
      shell.showItemInFolder(fullPath);
    },
  );

  ipcMain.handle(FILES_DETECT_EDITORS, () => {
    return detectEditors();
  });

  ipcMain.handle(
    FILES_OPEN_IN_EDITOR,
    (_e, data: { projectId: string; path: string; command?: string }) => {
      const projectPath = resolveProjectPath(projectManager, data.projectId);
      const fullPath = path.resolve(projectPath, data.path);
      openInEditor(data.command || "code", fullPath);
    },
  );

  ipcMain.handle(
    FILES_SAVE,
    (_e, data: { projectId: string; path: string; content: string }) => {
      const projectPath = resolveProjectPath(projectManager, data.projectId);
      if (!data.path) throw new Error("path is required");
      writeFileContent(projectPath, data.path, data.content);
    },
  );

  ipcMain.handle(
    FILES_RENAME,
    (_e, data: { projectId: string; path: string; newName: string }) => {
      const projectPath = resolveProjectPath(projectManager, data.projectId);
      const oldFull = path.resolve(projectPath, data.path);
      if (!oldFull.startsWith(projectPath))
        throw new Error(
          "This path is outside the project directory and can't be accessed.",
        );
      const newFull = path.resolve(path.dirname(oldFull), data.newName);
      if (!newFull.startsWith(projectPath))
        throw new Error(
          "This path is outside the project directory and can't be accessed.",
        );
      fs.renameSync(oldFull, newFull);
      return { newPath: path.relative(projectPath, newFull) };
    },
  );

  ipcMain.handle(
    FILES_DELETE,
    (_e, data: { projectId: string; path: string }) => {
      const projectPath = resolveProjectPath(projectManager, data.projectId);
      const fullPath = path.resolve(projectPath, data.path);
      if (!fullPath.startsWith(projectPath))
        throw new Error(
          "This path is outside the project directory and can't be accessed.",
        );
      fs.rmSync(fullPath, { recursive: true });
    },
  );
}
