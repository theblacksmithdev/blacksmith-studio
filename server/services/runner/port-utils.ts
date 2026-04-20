import detect from "detect-port";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Returns true if the given port is free right now.
 * Uses detect-port which works reliably across macOS, Windows, and Linux.
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  const available = await detect(port);
  return available === port;
}

/**
 * Asserts that the given port is free. Throws a user-facing error if it's busy.
 * Kept for callers that prefer the throwing variant; new code should use isPortAvailable.
 */
export async function assertPortAvailable(port: number): Promise<void> {
  if (!(await isPortAvailable(port))) {
    throw new Error(
      `Port ${port} is already in use. Update the port in your runner config and try again.`,
    );
  }
}

/**
 * Kills whichever process is currently holding the given port.
 * Best-effort and cross-platform: uses lsof on POSIX and netstat+taskkill on Windows.
 * Resolves even when nothing was listening; rejects only when the kill command itself fails.
 */
export async function killByPort(port: number): Promise<void> {
  if (process.platform === "win32") {
    await killByPortWindows(port);
  } else {
    await killByPortPosix(port);
  }
}

async function killByPortPosix(port: number): Promise<void> {
  let pids: string[];
  try {
    const { stdout } = await execAsync(`lsof -nP -ti tcp:${port} -sTCP:LISTEN`);
    pids = stdout.split(/\s+/).filter(Boolean);
  } catch {
    return;
  }
  if (pids.length === 0) return;

  await execAsync(`kill -TERM ${pids.join(" ")}`).catch(() => {});

  await new Promise((r) => setTimeout(r, 1_000));
  const stillAlive: string[] = [];
  for (const pid of pids) {
    try {
      process.kill(Number(pid), 0);
      stillAlive.push(pid);
    } catch {
      // already exited
    }
  }
  if (stillAlive.length > 0) {
    await execAsync(`kill -KILL ${stillAlive.join(" ")}`).catch(() => {});
  }
}

async function killByPortWindows(port: number): Promise<void> {
  let stdout: string;
  try {
    ({ stdout } = await execAsync(`netstat -ano -p tcp | findstr :${port}`));
  } catch {
    return;
  }
  const pids = new Set<string>();
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.trim().match(/LISTENING\s+(\d+)$/i);
    if (match) pids.add(match[1]);
  }
  for (const pid of pids) {
    await execAsync(`taskkill /PID ${pid} /F`).catch(() => {});
  }
}

/**
 * Extracts a port number from a line of process output.
 * Matches patterns like:
 *   - http://localhost:3000
 *   - http://127.0.0.1:5173
 *   - http://0.0.0.0:8000
 *   - port 3000
 *   - Port: 3000
 */
export function extractPortFromLine(line: string): number | null {
  // Match URLs: http(s)://host:PORT
  const urlMatch = line.match(
    /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]):(\d{2,5})/,
  );
  if (urlMatch) return parseInt(urlMatch[1], 10);

  // Match "port NNNN" or "Port: NNNN"
  const portMatch = line.match(/\bport[:\s]+(\d{2,5})\b/i);
  if (portMatch) return parseInt(portMatch[1], 10);

  return null;
}
