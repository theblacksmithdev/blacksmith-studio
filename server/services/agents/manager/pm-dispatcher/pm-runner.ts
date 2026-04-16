import { spawn } from "node:child_process";
import { createNdjsonParser } from "../../../claude/ndjson-parser.js";
import { nodeEnv } from "../../../node-env.js";
import type { AgentExecuteOptions } from "../../base/index.js";

export interface PMRunOptions {
  /** User-facing prompt passed to Claude via `-p`. */
  prompt: string;
  /** System prompt appended via `--append-system-prompt`. */
  systemPrompt: string;
  /** Base execute options (projectRoot, claudeBin, nodePath). */
  baseOptions: Omit<AgentExecuteOptions, "prompt">;
  /** Label used in stderr/log prefixes — "dispatch", "refine", "replan". */
  label: string;
  /** Invoked each time a text chunk arrives on the assistant stream. */
  onAssistantText?: (chunk: { text: string; isFinal: boolean }) => void;
  /** Invoked once when the `result` frame arrives. */
  onResult?: (totalText: string) => void;
}

export interface PMRunResult {
  text: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
}

/**
 * Run the Claude CLI in PM mode and collect the assistant text.
 *
 * Single Responsibility: process spawn + NDJSON streaming + text
 * accumulation. Callers layer parsing and fallback policy on top.
 *
 * Resolves with `{ text, exitCode, signal }` whenever text was produced,
 * even on non-zero exit or signal termination — the PM CLI sometimes exits
 * 1 with valid output. Rejects only when we have no usable text.
 */
export async function runPM(opts: PMRunOptions): Promise<PMRunResult> {
  const claudeBin = opts.baseOptions.claudeBin ?? "claude";

  const args = [
    "-p",
    opts.prompt,
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "bypassPermissions",
    "--allowedTools",
    "Read,Glob,Grep",
    "--append-system-prompt",
    opts.systemPrompt,
  ];

  return new Promise<PMRunResult>((resolve, reject) => {
    const proc = spawn(claudeBin, args, {
      cwd: opts.baseOptions.projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: nodeEnv(opts.baseOptions.nodePath),
    });

    let text = "";
    let stderr = "";

    const parser = createNdjsonParser((chunk: any) => {
      if (chunk.type === "assistant") {
        for (const b of chunk.message?.content || []) {
          if (b.type === "text") {
            text += b.text;
            opts.onAssistantText?.({
              text: b.text,
              isFinal: !!chunk.stop_reason,
            });
          }
        }
      } else if (chunk.type === "result") {
        opts.onResult?.(text);
      }
    });

    proc.stdout!.on("data", (d: Buffer) => parser.write(d.toString()));
    proc.stderr!.on("data", (d: Buffer) => {
      const line = d.toString();
      stderr += line;
      if (line.trim()) console.log(`[pm-${opts.label}] stderr: ${line.trim()}`);
    });

    proc.on("close", (code, signal) => {
      parser.flush();
      const hasText = text.trim().length > 0;

      if (signal) {
        if (hasText) {
          console.warn(
            `[pm-${opts.label}] Process killed by ${signal}, using partial response`,
          );
          resolve({ text, exitCode: code, signal });
        } else {
          reject(
            new Error(
              `PM ${opts.label} killed by ${signal} before producing output`,
            ),
          );
        }
        return;
      }

      if (code !== 0 && code !== null) {
        if (hasText) {
          console.warn(
            `[pm-${opts.label}] Exit code ${code} but has output, attempting to parse`,
          );
          resolve({ text, exitCode: code, signal: null });
        } else {
          reject(
            new Error(
              stderr.trim() || `PM ${opts.label} exited with code ${code}`,
            ),
          );
        }
        return;
      }

      resolve({ text, exitCode: code, signal: null });
    });

    proc.on("error", (err) =>
      reject(new Error(`PM ${opts.label} spawn failed: ${err.message}`)),
    );
  });
}
