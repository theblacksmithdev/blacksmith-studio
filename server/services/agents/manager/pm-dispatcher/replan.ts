import crypto from "node:crypto";
import type { AgentExecuteOptions } from "../../base/index.js";
import type { AgentRole } from "../../types.js";
import type { DispatchTask } from "./types.js";
import {
  VALID_ROLES,
  VALID_MODELS,
  VALID_REVIEW_LEVELS,
} from "./constants.js";
import { PM_REPLAN_PROMPT } from "./prompts.js";
import { PMEventEmitter, type EmitFn } from "./pm-emitter.js";
import { runPM } from "./pm-runner.js";

/**
 * Re-plan downstream tasks after a spec-producing agent completes.
 * PM reads the artifact and re-decomposes remaining tasks based on actual
 * output. Returns a new task list to replace remaining unexecuted tasks.
 * Falls back to the original `remainingTasks` on any failure so the
 * pipeline continues uninterrupted.
 */
export async function replanDownstream(
  completedTask: DispatchTask,
  artifactPath: string,
  remainingTasks: DispatchTask[],
  baseOptions: Omit<AgentExecuteOptions, "prompt">,
  emit?: EmitFn,
): Promise<DispatchTask[]> {
  if (remainingTasks.length === 0) return [];

  const pm = new PMEventEmitter(emit);

  const remainingDesc = remainingTasks
    .map(
      (t, i) =>
        `${i + 1}. [${t.role}] "${t.title}": ${t.prompt.slice(0, 200)}...`,
    )
    .join("\n");

  const prompt = [
    `A ${completedTask.role} just completed "${completedTask.title}".`,
    `Their output artifact is at: ${artifactPath}`,
    `Read that file to understand what was produced.`,
    "",
    `The remaining tasks in the pipeline are:`,
    remainingDesc,
    "",
    `Based on the ACTUAL artifact content, re-decompose these remaining tasks.`,
    `Split any oversized tasks into focused subtasks. Adjust model selections.`,
    `Each task prompt must tell the agent exactly what to build and reference the artifact.`,
  ].join("\n");

  pm.activity(
    `Re-evaluating plan after ${completedTask.role} completed "${completedTask.title}"...`,
  );

  try {
    const { text } = await runPM({
      prompt,
      systemPrompt: PM_REPLAN_PROMPT,
      baseOptions,
      label: "replan",
    });

    if (!text.trim()) {
      pm.activity("Re-plan returned empty — keeping original tasks");
      return remainingTasks;
    }

    const newTasks = parseReplanResponse(text, completedTask.id);
    if (!newTasks) {
      pm.activity("Re-plan did not produce valid tasks — keeping original plan");
      return remainingTasks;
    }

    if (newTasks.length === 0) {
      pm.activity("Re-plan produced no valid tasks — keeping original plan");
      return remainingTasks;
    }

    pm.activity(
      `Re-plan: ${remainingTasks.length} tasks → ${newTasks.length} tasks`,
    );
    console.log(
      `[pm-dispatcher] Re-plan: ${remainingTasks.length} → ${newTasks.length} tasks`,
    );
    return newTasks;
  } catch (err: any) {
    console.warn(
      "[pm-dispatcher] Re-plan failed, keeping original tasks:",
      err.message,
    );
    pm.activity(`Re-plan failed — continuing with original plan`);
    return remainingTasks;
  }
}

/**
 * Parse the re-plan JSON array response into a serial task chain.
 * Returns null if no JSON array is found (caller keeps originals);
 * otherwise returns the validated chain, possibly empty after filtering.
 *
 * More lenient than parse-plan.ts by design: invalid roles default to
 * "frontend-engineer" and tasks with empty prompts are silently dropped,
 * rather than aborting the entire re-plan.
 */
function parseReplanResponse(
  raw: string,
  completedTaskId: string,
): DispatchTask[] | null {
  const bracketStart = raw.indexOf("[");
  const bracketEnd = raw.lastIndexOf("]");

  if (bracketStart === -1 || bracketEnd <= bracketStart) {
    console.warn(
      "[pm-dispatcher] Re-plan: no JSON array found, keeping original tasks",
    );
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(bracketStart, bracketEnd + 1));
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return [];

  const prefix = crypto.randomUUID().slice(0, 8);

  return parsed
    .map((t: any, i: number): DispatchTask => {
      const id = `${prefix}-r${i}`;
      return {
        id,
        title: t.title ?? `Task ${i + 1}`,
        description: t.description ?? "",
        role: VALID_ROLES.has(t.role)
          ? (t.role as AgentRole)
          : ("frontend-engineer" as AgentRole),
        prompt: t.prompt ?? "",
        dependsOn: i > 0 ? [`${prefix}-r${i - 1}`] : [completedTaskId],
        model: VALID_MODELS.has(t.model) ? t.model : "balanced",
        reviewLevel: VALID_REVIEW_LEVELS.has(t.reviewLevel)
          ? t.reviewLevel
          : "full",
      };
    })
    .filter((t) => t.prompt.trim());
}
