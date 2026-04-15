import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { buildClaudeArgs, type ClaudeArgsOptions } from "./args.js";
import { nodeEnv } from "../node-env.js";
import { createNdjsonParser } from "./ndjson-parser.js";
import type { ChunkCallback } from "./types.js";

export interface SpawnOptions extends Omit<
  ClaudeArgsOptions,
  "sessionId" | "prompt"
> {
  sessionId: string;
  prompt: string;
  projectRoot: string;
  nodePath?: string;
}

/**
 * Spawn a Claude Code subprocess for a single prompt.
 * Returns a promise that resolves on successful exit, rejects on error.
 */
export function spawnClaudePrompt(
  options: SpawnOptions,
  onChunk: ChunkCallback,
  claudeBin: string = "claude",
): { promise: Promise<void>; process: ChildProcess } {
  const { sessionId, prompt, projectRoot, nodePath, ...argsOptions } = options;
  console.log(
    `[claude] Spawning for session ${sessionId}, prompt: "${prompt.slice(0, 80)}..."`,
  );

  const args = buildClaudeArgs({ sessionId, prompt, ...argsOptions });

  const proc = spawn(claudeBin, args, {
    cwd: projectRoot,
    stdio: ["ignore", "pipe", "pipe"],
    env: nodeEnv(nodePath),
  });

  const parser = createNdjsonParser(onChunk);
  let stderrBuffer = "";

  const promise = new Promise<void>((resolve, reject) => {
    proc.stdout.on("data", (chunk: Buffer) => {
      parser.write(chunk.toString());
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderrBuffer += chunk.toString();
    });

    proc.on("close", (code, signal) => {
      console.log(`[claude] Process exited: code=${code}, signal=${signal}`);
      parser.flush();

      if (code === 0 || code === null) {
        resolve();
      } else {
        const errorMsg =
          stderrBuffer.trim() || `Claude process exited with code ${code}`;
        reject(new Error(errorMsg));
      }
    });

    proc.on("error", (err) => {
      console.error(`[claude] Spawn error:`, err);
      reject(new Error(`Failed to spawn claude: ${err.message}`));
    });
  });

  return { promise, process: proc };
}
