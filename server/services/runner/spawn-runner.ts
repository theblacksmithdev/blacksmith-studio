import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { extractPortFromLine } from "./port-utils.js";
import { nodeEnv } from "../node-env.js";
import type { RunnerConfig } from "./runner-config.js";

export interface SpawnResult {
  process: ChildProcess;
  port: number | null;
}

export type OutputCallback = (configId: string, line: string) => void;
export type StatusCallback = (
  configId: string,
  status: "starting" | "running" | "stopped",
  port: number | null,
) => void;

/**
 * Generic runner spawner — works with any RunnerConfig.
 * Substitutes {port} in the command and spawns the process. Detects the
 * actual port from process output so the preview URL always points to
 * the right place. Port-availability is the caller's concern.
 */
export async function spawnRunner(
  config: RunnerConfig,
  projectRoot: string,
  onOutput: OutputCallback,
  onStatus: StatusCallback,
  nodePath?: string,
): Promise<SpawnResult> {
  const configuredPort = config.port ?? null;

  // Substitute {port} in command
  const sub = (str: string) =>
    configuredPort != null
      ? str.replace(/\{port\}/g, String(configuredPort))
      : str;

  const fullCommand = sub(config.command);
  const cwd = path.resolve(projectRoot, config.cwd ?? ".");

  // Build env
  const envOverrides: Record<string, string> = { ...config.env };
  const env = nodeEnv(nodePath, envOverrides);

  // Parse command into executable + args (shell mode)
  const proc = spawn(fullCommand, {
    cwd,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    env,
  });

  // Ready pattern detection
  const readyRegex = config.readyPattern
    ? new RegExp(config.readyPattern, "i")
    : null;
  let isReady = false;

  // Track the actual port detected from output
  let detectedPort: number | null = configuredPort;

  // Timeout: auto-promote to "running" if readyPattern never matches
  const READY_TIMEOUT_MS = 30_000;
  let readyTimer: ReturnType<typeof setTimeout> | null = null;

  if (readyRegex) {
    readyTimer = setTimeout(() => {
      if (!isReady) {
        isReady = true;
        onOutput(
          config.id,
          `[studio] Ready pattern not matched after ${READY_TIMEOUT_MS / 1000}s — assuming running`,
        );
        onStatus(config.id, "running", detectedPort);
      }
    }, READY_TIMEOUT_MS);
  }

  const handleLine = (line: string) => {
    if (!line.trim()) return;
    onOutput(config.id, line);

    // Try to detect actual port from output (covers port reassignment by tools)
    if (configuredPort) {
      const linePort = extractPortFromLine(line);
      if (linePort && linePort !== detectedPort) {
        detectedPort = linePort;
      }
    }

    if (!isReady) {
      if (readyRegex ? readyRegex.test(line) : true) {
        isReady = true;
        if (readyTimer) clearTimeout(readyTimer);
        onStatus(config.id, "running", detectedPort);
      }
    }
  };

  // Stream stdout/stderr
  let stdoutBuf = "";
  proc.stdout?.on("data", (chunk: Buffer) => {
    stdoutBuf += chunk.toString();
    const lines = stdoutBuf.split("\n");
    stdoutBuf = lines.pop() ?? "";
    lines.forEach(handleLine);
  });

  let stderrBuf = "";
  proc.stderr?.on("data", (chunk: Buffer) => {
    stderrBuf += chunk.toString();
    const lines = stderrBuf.split("\n");
    stderrBuf = lines.pop() ?? "";
    lines.forEach(handleLine);
  });

  proc.on("close", (code) => {
    if (readyTimer) clearTimeout(readyTimer);
    // Flush remaining buffers
    if (stdoutBuf.trim()) handleLine(stdoutBuf);
    if (stderrBuf.trim()) handleLine(stderrBuf);
    onOutput(config.id, `[studio] Process exited (code ${code ?? "null"})`);
    onStatus(config.id, "stopped", null);
  });

  proc.on("error", (err) => {
    if (readyTimer) clearTimeout(readyTimer);
    onOutput(config.id, `[studio] Failed to start: ${err.message}`);
    onStatus(config.id, "stopped", null);
  });

  // Emit starting status
  onStatus(config.id, "starting", configuredPort);
  onOutput(
    config.id,
    `[studio] Starting ${config.name}${configuredPort ? ` on port ${configuredPort}` : ""}...`,
  );

  return { process: proc, port: configuredPort };
}
