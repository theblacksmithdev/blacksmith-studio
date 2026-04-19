import type { AgentExecuteOptions } from "../../base/index.js";
import { AiModelTier } from "../../../../ai/types.js";
import { getProjectContext } from "../../../../studio-context/index.js";

export interface PMRunOptions {
  /** User-facing prompt sent to the AI provider. */
  prompt: string;
  /** System prompt the provider applies on top of its defaults. */
  systemPrompt: string;
  /** Base execute options — must include the `ai` router. */
  baseOptions: Omit<AgentExecuteOptions, "prompt">;
  /** Label used in log prefixes — "dispatch", "refine", "replan". */
  label: string;
  /**
   * Model tier. Defaults to Balanced for planning. Refine/replan should
   * use Fast — they're structural rewrites, not creative work.
   */
  model?: AiModelTier;
  /**
   * Claude CLI session id for the PM. When `resume` is true, the provider
   * passes --resume so the PM continues its prior conversation; when
   * false, --session-id seeds a brand new session with this id. Omit for
   * one-shot planning calls (refine/replan) that should not share
   * conversational state.
   */
  sessionId?: string;
  /** Resume the PM's prior session instead of starting a new one. */
  resume?: boolean;
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

  // Inject the cached project context (Graphify report + tree + key files +
  // knowledge base) so Claude doesn't burn a Read/Glob/Grep tool-use phase
  // discovering the project on every PM call. The helper caches per project
  // root with a 1-minute TTL, so dispatch + subsequent refine/replan calls
  // share the same context.
  const projectContext = safeGetProjectContext(opts.baseOptions.projectRoot);

  const { text } = await ai.streamText({
    prompt: opts.prompt,
    systemPrompt: opts.systemPrompt,
    projectContext,
    model: opts.model ?? AiModelTier.Balanced,
    cwd: opts.baseOptions.projectRoot,
    nodePath: opts.baseOptions.nodePath,
    permissionMode: "bypassPermissions",
    allowedTools: ["Read", "Glob", "Grep"],
    tolerantExit: true,
    sessionId: opts.sessionId,
    resume: opts.resume,
    providerId: opts.baseOptions.providerId,
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

/**
 * Swallow project-context generation errors so a PM call never fails just
 * because context assembly hit an unreadable file. Returns empty string on
 * failure — the PM can still fall back to its own Read/Glob/Grep.
 */
function safeGetProjectContext(projectRoot: string): string | undefined {
  try {
    const ctx = getProjectContext(projectRoot);
    return ctx.trim() ? ctx : undefined;
  } catch (err: any) {
    console.warn(
      `[pm-runner] Failed to build project context, skipping:`,
      err?.message,
    );
    return undefined;
  }
}
