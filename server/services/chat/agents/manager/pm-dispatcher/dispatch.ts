import crypto from "node:crypto";
import type { AgentExecuteOptions } from "../../base/index.js";
import type { DispatchPlan } from "./types.js";
import { PM_DISPATCH_PROMPT } from "./prompts.js";
import { PMEventEmitter, type EmitFn } from "./pm-emitter.js";
import { runPM, type PMLifecycleHook } from "./pm-runner.js";
import { parsePlan } from "./parse-plan.js";

/**
 * Use the PM agent (via Claude) to decompose a prompt into a task plan.
 * Streams activity/message events in real-time via the emit callback.
 *
 * Conversation-aware: if `baseOptions.conversationContext` carries a PM
 * session id, the PM resumes that Claude session instead of starting
 * fresh. Otherwise a new session id is minted so the caller can persist
 * it and resume on the next user message. Either way, the session id
 * used for this call is returned on the {@link DispatchPlan}.
 */
export async function dispatchWithPM(
  prompt: string,
  baseOptions: Omit<AgentExecuteOptions, "prompt">,
  emit?: EmitFn,
  onLifecycle?: PMLifecycleHook,
): Promise<DispatchPlan> {
  const pm = new PMEventEmitter(emit);
  let firstChunkEmitted = false;

  const ctx = baseOptions.conversationContext;
  const resume = !!ctx?.pmSessionId;
  const sessionId = ctx?.pmSessionId ?? crypto.randomUUID();

  // On a fresh PM session we seed the first turn with a prior-transcript
  // preamble built from SQLite. On resume, Claude already has the
  // history in its own session — we just send the new user request.
  const historyBlock = ctx?.formatHistoryForPM() ?? "";
  const prefix = historyBlock
    ? `${historyBlock}\n\n---\n\nNew request from the user:\n\n`
    : "";
  const pmPrompt = `${prefix}Analyze this request and produce a task plan:\n\n${prompt}`;

  const { text } = await runPM({
    prompt: pmPrompt,
    systemPrompt: PM_DISPATCH_PROMPT,
    baseOptions,
    label: "dispatch",
    sessionId,
    resume,
    onLifecycle,
    onAssistantText: ({ text, isFinal }) => {
      if (!firstChunkEmitted) {
        firstChunkEmitted = true;
        pm.status("executing", "PM is planning tasks...");
      }
      pm.message(text, !isFinal);
    },
    onResult: (full) => {
      pm.activity(`Plan complete — parsing ${full.length} chars`);
    },
  });

  if (!text.trim()) {
    throw new Error(
      "PM returned empty response — Claude CLI may not have produced output",
    );
  }

  console.log(
    `[pm-dispatcher] Raw response (${text.length} chars, session=${sessionId}, resumed=${resume}): ${text.slice(0, 500)}...`,
  );
  const plan = parsePlan(text);
  plan.pmSessionId = sessionId;
  return plan;
}
