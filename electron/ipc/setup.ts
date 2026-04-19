import { ipcMain } from "electron";
import { spawn, execSync } from "node:child_process";
import {
  SETUP_CHECK,
  SETUP_INSTALL_CLAUDE,
  SETUP_VALIDATE_BIN,
} from "./channels.js";
import type { SettingsManager } from "../../server/services/settings.js";
import type { ProjectManager } from "../../server/services/projects.js";
import { nodeEnv, nodeCmd } from "../../server/services/node-env.js";

export interface NodeStatus {
  installed: boolean;
  version?: string;
  outdated?: boolean;
}

export interface SetupStatus {
  node: NodeStatus;
  claude: { installed: boolean; version?: string };
  auth: { authenticated: boolean };
}

function getNodePath(
  settingsManager: SettingsManager,
  projectId?: string,
): string | undefined {
  return (
    settingsManager.resolve(projectId ?? null, "runner.nodePath") || undefined
  );
}

function checkNode(nodePath?: string): NodeStatus {
  try {
    const bin = nodeCmd("node", nodePath);
    const version = execSync(`"${bin}" --version`, {
      timeout: 5000,
      env: nodeEnv(nodePath),
    })
      .toString()
      .trim();
    const major = parseInt(version.replace("v", "").split(".")[0], 10);
    if (major >= 18) return { installed: true, version };
    return { installed: false, version, outdated: true };
  } catch {
    return { installed: false };
  }
}

function checkClaude(): Promise<{ installed: boolean; version?: string }> {
  return new Promise((resolve) => {
    try {
      const version = execSync("claude --version", { timeout: 10000 })
        .toString()
        .trim();
      resolve({ installed: true, version });
    } catch {
      resolve({ installed: false });
    }
  });
}

function checkAuth(): Promise<{ authenticated: boolean }> {
  return new Promise((resolve) => {
    const proc = spawn(
      "claude",
      ["-p", "ping", "--max-turns", "0", "--output-format", "json"],
      {
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 15000,
      },
    );

    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      const hasAuthError =
        stderr.toLowerCase().includes("not authenticated") ||
        stderr.toLowerCase().includes("api key") ||
        stderr.toLowerCase().includes("login") ||
        stderr.toLowerCase().includes("unauthorized");
      resolve({ authenticated: code === 0 || !hasAuthError });
    });

    proc.on("error", () => resolve({ authenticated: false }));
  });
}

function installClaude(
  nodePath?: string,
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const proc = spawn(
      nodeCmd("npm", nodePath),
      ["install", "-g", "@anthropic-ai/claude-code"],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: nodeEnv(nodePath),
        timeout: 120000,
        shell: true,
      },
    );

    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      resolve(
        code === 0
          ? { success: true }
          : { success: false, error: stderr.trim() || "Installation failed" },
      );
    });

    proc.on("error", (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Validate that a user-picked binary is runnable and report its --version
 * string. Used by the onboarding binary picker so the user sees a valid /
 * invalid state before the path is saved to settings. All other detection
 * reuses existing IPC (`runner:detectNode`, `commands:listInstalledVersions`).
 */
function validateBin(binPath: string): {
  valid: boolean;
  version?: string;
  error?: string;
} {
  try {
    const out = execSync(`"${binPath}" --version`, {
      timeout: 5000,
      encoding: "utf-8",
    }).trim();
    return { valid: true, version: out };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function setupSetupIPC(
  settingsManager: SettingsManager,
  _projectManager: ProjectManager,
) {
  ipcMain.handle(
    SETUP_CHECK,
    async (_e, data?: { projectId?: string }): Promise<SetupStatus> => {
      const nodePath = getNodePath(settingsManager, data?.projectId);
      const node = checkNode(nodePath);
      const claude = await checkClaude();

      // If Claude is installed, Node is guaranteed available (Claude requires Node 18+)
      // Even if the default `node` in PATH is old, Claude's runtime works
      if (!node.installed && claude.installed) {
        node.installed = true;
        node.version = node.version
          ? `${node.version} (upgrade recommended)`
          : "Available via Claude";
      }

      const auth = claude.installed
        ? await checkAuth()
        : { authenticated: false };
      return { node, claude, auth };
    },
  );

  ipcMain.handle(
    SETUP_INSTALL_CLAUDE,
    async (_e, data?: { projectId?: string }) => {
      const nodePath = getNodePath(settingsManager, data?.projectId);
      return installClaude(nodePath);
    },
  );

  ipcMain.handle(SETUP_VALIDATE_BIN, (_e, data: { path: string }) =>
    validateBin(data.path),
  );
}
