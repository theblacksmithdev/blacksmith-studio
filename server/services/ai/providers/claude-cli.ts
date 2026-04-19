import { spawn, execSync } from "node:child_process";
import { nodeEnv } from "../../node-env.js";
import { createStreamParser, extractTextFromEvent } from "../parser.js";
import { AiModelTier } from "../types.js";
import type {
  AiCompletionOptions,
  AiStreamOptions,
  AiStreamHandle,
  AiProviderStatus,
  AiModelOption,
} from "../types.js";
import { AiProvider, type ModelSelector } from "./provider.js";

const MODEL_MAP: Record<AiModelTier, string> = {
  [AiModelTier.Fast]: "haiku",
  [AiModelTier.Balanced]: "sonnet",
  [AiModelTier.Powerful]: "opus",
};

const MODEL_OPTIONS: AiModelOption[] = [
  { value: "sonnet", label: "Sonnet", description: "Fast & capable" },
  { value: "opus", label: "Opus", description: "Most intelligent" },
  { value: "haiku", label: "Haiku", description: "Fastest responses" },
];

export class ClaudeCliProvider extends AiProvider {
  readonly name = "Claude CLI";
  private binPath: string | null = null;

  getBin(): string {
    if (this.binPath) return this.binPath;
    try {
      this.binPath = execSync('bash -ilc "which claude"', {
        encoding: "utf-8",
        timeout: 5000,
      }).trim();
    } catch {
      this.binPath = "claude";
    }
    return this.binPath;
  }

  resolveModel(selector: ModelSelector): string {
    // AiModelTier values are strings, so this indexing works for both tiers
    // and concrete IDs. Unknown strings pass through to the CLI as-is.
    return (MODEL_MAP as Record<string, string>)[selector] ?? selector;
  }

  listModels(): AiModelOption[] {
    return MODEL_OPTIONS;
  }

  async checkStatus(): Promise<AiProviderStatus> {
    return new Promise((resolve) => {
      const proc = spawn("claude", ["--version"], {
        stdio: ["ignore", "pipe", "pipe"],
      });
      let out = "";
      proc.stdout.on("data", (d: Buffer) => {
        out += d.toString();
      });
      proc.on("close", (code) => {
        resolve(
          code === 0 && out.trim()
            ? { available: true, version: out.trim(), name: this.name }
            : { available: false, name: this.name },
        );
      });
      proc.on("error", () => resolve({ available: false, name: this.name }));
    });
  }

  complete(options: AiCompletionOptions): Promise<string | null> {
    const {
      prompt,
      systemPrompt,
      model = AiModelTier.Fast,
      cwd,
      timeout = 30000,
      disableTools,
    } = options;
    const bin = this.getBin();

    return new Promise((resolve) => {
      const args = [
        "--print",
        "--output-format",
        "stream-json",
        "--model",
        this.resolveModel(model),
      ];
      if (systemPrompt) args.push("--append-system-prompt", systemPrompt);
      if (disableTools) args.push("--allowedTools", "");

      const proc = spawn(bin, args, {
        cwd: cwd || process.cwd(),
        stdio: ["pipe", "pipe", "pipe"],
        env: nodeEnv(),
      });

      proc.stdin.write(prompt);
      proc.stdin.end();

      let text = "";
      const parser = createStreamParser((event) => {
        const t = extractTextFromEvent(event);
        if (t) text += t;
      });

      proc.stdout.on("data", (chunk: Buffer) => parser.write(chunk.toString()));

      const timer = setTimeout(() => {
        proc.kill("SIGTERM");
        resolve(null);
      }, timeout);

      proc.on("close", () => {
        clearTimeout(timer);
        parser.flush();
        resolve(text.trim() || null);
      });
      proc.on("error", () => {
        clearTimeout(timer);
        resolve(null);
      });
    });
  }

  stream(options: AiStreamOptions): AiStreamHandle {
    const {
      prompt,
      systemPrompt,
      model,
      cwd,
      nodePath,
      onChunk,
      sessionId,
      resume,
      permissionMode = "bypassPermissions",
      mcpConfigPath,
      maxBudget,
      customInstructions,
      projectContext,
      disableTools,
      allowedTools,
      tolerantExit,
    } = options;
    const bin = this.getBin();

    // Build effective system prompt
    let effectiveSystem = systemPrompt ?? "";
    if (customInstructions) {
      effectiveSystem = effectiveSystem
        ? `${effectiveSystem}\n\n## User's Custom Instructions\n\n${customInstructions}`
        : customInstructions;
    }

    // Build effective prompt — prepend project context on first message
    const effectivePrompt =
      !resume && projectContext
        ? `Here is the current project context for reference:\n\n${projectContext}\n\n---\n\nUser request: ${prompt}`
        : prompt;

    const args = [
      "-p",
      effectivePrompt,
      "--output-format",
      "stream-json",
      "--verbose",
      "--permission-mode",
      permissionMode,
      "--include-partial-messages",
    ];

    if (effectiveSystem) args.push("--append-system-prompt", effectiveSystem);
    if (resume && sessionId) args.push("--resume", sessionId);
    else if (sessionId) args.push("--session-id", sessionId);
    if (model) args.push("--model", this.resolveModel(model));
    if (maxBudget != null && maxBudget > 0)
      args.push("--max-budget-usd", String(maxBudget));
    if (mcpConfigPath) args.push("--mcp-config", mcpConfigPath);
    if (disableTools) args.push("--allowedTools", "");
    else if (allowedTools && allowedTools.length > 0)
      args.push("--allowedTools", allowedTools.join(","));

    const proc = spawn(bin, args, {
      cwd: cwd || process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env: nodeEnv(nodePath),
    });

    const parser = createStreamParser(onChunk);
    let stderrBuffer = "";

    const promise = new Promise<void>((resolve, reject) => {
      proc.stdout.on("data", (chunk: Buffer) => parser.write(chunk.toString()));
      proc.stderr.on("data", (chunk: Buffer) => {
        stderrBuffer += chunk.toString();
      });
      proc.on("close", (code, signal) => {
        parser.flush();
        if (code === 0 || code === null) {
          resolve();
          return;
        }
        if (tolerantExit) {
          console.warn(
            `[claude-cli] Non-zero exit (code=${code}, signal=${signal}) — resolving tolerantly`,
          );
          resolve();
          return;
        }
        reject(
          new Error(stderrBuffer.trim() || `Process exited with code ${code}`),
        );
      });
      proc.on("error", (err) =>
        reject(new Error(`Failed to spawn: ${err.message}`)),
      );
    });

    return {
      promise,
      cancel: () => {
        if (!proc.killed) proc.kill("SIGTERM");
      },
    };
  }
}
