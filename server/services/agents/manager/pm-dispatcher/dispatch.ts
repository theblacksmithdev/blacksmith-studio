import type { AgentExecuteOptions } from "../../base/index.js";
import type { DispatchPlan } from "./types.js";
import { PM_DISPATCH_PROMPT } from "./prompts.js";
import { PMEventEmitter, type EmitFn } from "./pm-emitter.js";
import { runPM } from "./pm-runner.js";
import { parsePlan } from "./parse-plan.js";

/**
 * Use the PM agent (via Claude) to decompose a prompt into a task plan.
 * Streams activity/message events in real-time via the emit callback.
 */
export async function dispatchWithPM(
  prompt: string,
  baseOptions: Omit<AgentExecuteOptions, "prompt">,
  emit?: EmitFn,
): Promise<DispatchPlan> {
  const pm = new PMEventEmitter(emit);
  let firstChunkEmitted = false;

  const { text } = await runPM({
    prompt: `Analyze this request and produce a task plan:\n\n${prompt}`,
    systemPrompt: PM_DISPATCH_PROMPT,
    baseOptions,
    label: "dispatch",
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
    `[pm-dispatcher] Raw response (${text.length} chars): ${text.slice(0, 500)}...`,
  );
  return parsePlan(text);
}
