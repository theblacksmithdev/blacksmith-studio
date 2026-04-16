import { app, BrowserWindow, shell, Menu } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fixPath from "fix-path";
import { setupAllIPC } from "./ipc/index.js";
import { WINDOW_ON_FULLSCREEN } from "./ipc/channels.js";
import { ProjectManager } from "../server/services/projects.js";
import { SessionManager } from "../server/services/sessions.js";
import { ClaudeManager } from "../server/services/claude/index.js";
import { SettingsManager } from "../server/services/settings.js";
import { RunnerManager } from "../server/services/runner/index.js";
import { McpManager } from "../server/services/mcp.js";
import { SkillsManager } from "../server/services/skills.js";
import { KnowledgeManager } from "../server/services/knowledge.js";
import { GitManager } from "../server/services/git.js";
import { TerminalManager } from "../server/services/terminal.js";
import { closeDatabase } from "../server/db/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix PATH for macOS/Linux GUI apps (nvm, Homebrew, etc.)
fixPath();

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Blacksmith Studio",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: "#212121",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3940");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../client/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Forward fullscreen state to renderer
  mainWindow.on("enter-full-screen", () => {
    mainWindow?.webContents.send(WINDOW_ON_FULLSCREEN, true);
  });
  mainWindow.on("leave-full-screen", () => {
    mainWindow?.webContents.send(WINDOW_ON_FULLSCREEN, false);
  });
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(async () => {
  // Instantiate services in main process
  const projectManager = new ProjectManager();
  const claudeManager = new ClaudeManager();
  const sessionManager = new SessionManager();
  const settingsManager = new SettingsManager();
  const { RunnerConfigService } =
    await import("../server/services/runner/runner-config.js");
  const runnerConfigService = new RunnerConfigService();
  const runnerManager = new RunnerManager(runnerConfigService, (projectId) => {
    const project = projectManager.get(projectId);
    if (!project) throw new Error(`Project not found for id: ${projectId}`);
    const nodePath =
      settingsManager.resolve(projectId, "runner.nodePath") || "";
    return { path: project.path, nodePath };
  });
  const mcpManager = new McpManager();
  const skillsManager = new SkillsManager();
  const knowledgeManager = new KnowledgeManager();
  const gitManager = new GitManager();
  const terminalManager = new TerminalManager();
  const { PythonManager } =
    await import("../server/services/python/index.js");
  const pythonManager = new PythonManager();
  const { GraphifyManager } =
    await import("../server/services/graphify.js");
  const graphifyManager = new GraphifyManager(pythonManager);

  // Check Claude availability
  const claudeStatus = await claudeManager.checkInstalled();
  if (claudeStatus.installed) {
    console.log(`[studio] Claude Code ${claudeStatus.version} found`);
  } else {
    console.warn(
      "[studio] WARNING: Claude Code CLI not found. Prompts will fail.",
    );
  }

  // Create window
  createMenu();
  createWindow();

  // Register all IPC handlers
  setupAllIPC(
    () => mainWindow,
    projectManager,
    sessionManager,
    claudeManager,
    settingsManager,
    runnerManager,
    runnerConfigService,
    mcpManager,
    skillsManager,
    knowledgeManager,
    gitManager,
    terminalManager,
    graphifyManager,
    pythonManager,
  );

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Cleanup on quit
  app.on("before-quit", () => {
    runnerManager.stopEverything();
    gitManager.stopAllWatching();
    terminalManager.killAll();
    closeDatabase();
    console.log("[studio] Runner processes stopped, database closed");
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
