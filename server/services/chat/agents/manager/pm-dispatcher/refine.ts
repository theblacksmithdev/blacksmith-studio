import type { AgentExecuteOptions } from "../../base/index.js";
import type { DispatchTask } from "./types.js";
import { PM_REFINE_PROMPT } from "./prompts.js";
import { PMEventEmitter, type EmitFn } from "./pm-emitter.js";
import { runPM, type PMLifecycleHook } from "./pm-runner.js";
import { AiModelTier } from "../../../../ai/types.js";

/**
 * Two-phase PM refinement: refine a task's prompt using artifacts from
 * completed tasks.
 *
 * Called before each task in the pipeline (when artifacts exist) to replace
 * the PM's original speculative prompt with one grounded in actual agent
 * output. Lightweight call — short response, falls back to the original
 * prompt on any failure so the pipeline never blocks on refinement.
 */
export async function refineTaskPrompt(
  task: DispatchTask,
  artifactSummaries: { role: string; artifactPath: string; title: string }[],
  baseOptions: Omit<AgentExecuteOptions, "prompt">,
  emit?: EmitFn,
  onLifecycle?: PMLifecycleHook,
): Promise<string> {
  if (artifactSummaries.length === 0) return task.prompt;

  const pm = new PMEventEmitter(emit);

  const artifactContext = artifactSummaries
    .map(
      (a) =>
        `- ${a.role} completed "${a.title}" → artifact at: ${a.artifactPath}`,
    )
    .join("\n");

  const prompt = [
    `Refine this task prompt for the ${task.role}:`,
    "",
    "## Original Task",
    `Title: ${task.title}`,
    `Role: ${task.role}`,
    `Prompt: ${task.prompt}`,
    "",
    "## Completed Artifacts (from earlier agents)",
    artifactContext,
    "",
    "Rewrite the task prompt to be specific and grounded in these artifacts.",
  ].join("\n");

  pm.activity(
    `Refining task "${task.title}" with ${artifactSummaries.length} artifact(s)...`,
  );

  try {
    const { text } = await runPM({
      prompt,
      systemPrompt: PM_REFINE_PROMPT,
      baseOptions,
      label: "refine",
      model: AiModelTier.Fast,
      onLifecycle,
    });

    const refined = text.trim();
    if (refined) {
      console.log(
        `[pm-dispatcher] Refined task "${task.title}" (${refined.length} chars)`,
      );
      pm.activity(`Task "${task.title}" refined with artifact context`);
      return refined;
    }
  } catch (err: any) {
    console.warn(
      `[pm-dispatcher] Refinement failed for "${task.title}", using original prompt:`,
      err.message,
    );
    pm.activity(
      `Refinement failed — using original prompt for "${task.title}"`,
    );
  }

  return task.prompt;
}
