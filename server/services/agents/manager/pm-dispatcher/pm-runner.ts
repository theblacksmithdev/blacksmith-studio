import type { AgentExecuteOptions } from "../../base/index.js";

export interface PMRunOptions {
  /** User-facing prompt sent to the AI provider. */
  prompt: string;
  /** System prompt the provider applies on top of its defaults. */
  systemPrompt: string;
  /** Base execute options — must include the `ai` router. */
  baseOptions: Omit<AgentExecuteOptions, "prompt">;
  /** Label used in log prefixes — "dispatch", "refine", "replan". */
  label: string;
  /** Invoked for each assistant text delta as it streams in. */
  onAssistantText?: (chunk: { text: string; isFinal: boolean }) => void;
  /** Invoked once when the final `result` frame arrives, with the full collected text. */
  onResult?: (totalText: string) => void;
}

export interface PMRunResult {
  text: string;
}

/**
 * Run the PM in a one-shot planning call.
 *
 * Single Responsibility: delegate to the Ai router and surface the
 * collected assistant text. All process/spawn concerns live inside the
 * Ai provider — this helper is just PM-flavored wiring: restricted tool
 * set, tolerant exit policy, and label-scoped logging.
 */
export async function runPM(opts: PMRunOptions): Promise<PMRunResult> {
  const ai = opts.baseOptions.ai;
  if (!ai) {
    throw new Error(
      "PM dispatch requires baseOptions.ai — the Ai router was not wired in.",
    );
  }

  let collected = "";

  const { text } = await ai.streamText({
    prompt: opts.prompt,
    systemPrompt: opts.systemPrompt,
    cwd: opts.baseOptions.projectRoot,
    nodePath: opts.baseOptions.nodePath,
    permissionMode: "bypassPermissions",
    allowedTools: ["Read", "Glob", "Grep"],
    tolerantExit: true,
    onText: (delta, isFinal) => {
      collected += delta;
      opts.onAssistantText?.({ text: delta, isFinal });
    },
    onChunk: (event) => {
      if (event.type === "result") opts.onResult?.(collected);
    },
  });

  return { text };
}
