import crypto from "node:crypto";
import type { AgentRole } from "../../types.js";
import type { DispatchPlan, DispatchTask } from "./types.js";
import { VALID_ROLES, VALID_MODELS, VALID_REVIEW_LEVELS } from "./constants.js";

/**
 * Coerce a raw JSON task object from the PM into a fully-validated
 * DispatchTask, substituting safe defaults when fields are missing
 * or invalid. Throws only when the task is fundamentally broken
 * (no role, no prompt).
 */
export function normalizeTask(
  raw: any,
  index: number,
  idOverride?: string,
): DispatchTask {
  if (!raw.role || !VALID_ROLES.has(raw.role)) {
    throw new Error(`Task ${index}: invalid role "${raw.role}"`);
  }
  if (!raw.prompt) {
    throw new Error(`Task ${index}: missing prompt`);
  }

  return {
    id: idOverride ?? raw.id ?? `t${index}`,
    title: raw.title ?? `Task ${index + 1}`,
    description: raw.description ?? "",
    role: raw.role as AgentRole,
    prompt: raw.prompt,
    dependsOn: Array.isArray(raw.dependsOn) ? raw.dependsOn : [],
    model: VALID_MODELS.has(raw.model) ? raw.model : "balanced",
    reviewLevel: VALID_REVIEW_LEVELS.has(raw.reviewLevel)
      ? raw.reviewLevel
      : "full",
  };
}

/**
 * Parse the PM's dispatch response into a DispatchPlan.
 *
 * - No JSON or invalid JSON → treated as a clarification question.
 * - Each task is validated + gets a dispatch-unique ID prefix so IDs
 *   don't collide across dispatches.
 * - `dependsOn` values are remapped from PM-local IDs to the prefixed IDs.
 */
export function parsePlan(raw: string): DispatchPlan {
  const braceStart = raw.indexOf("{");
  const braceEnd = raw.lastIndexOf("}");

  if (braceStart === -1 || braceEnd <= braceStart) {
    console.log(
      `[pm-dispatcher] No JSON in response — treating as clarification`,
    );
    return { mode: "clarification", tasks: [], summary: raw.trim() };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw.slice(braceStart, braceEnd + 1));
  } catch {
    console.log(
      `[pm-dispatcher] JSON parse failed — treating as clarification`,
    );
    return { mode: "clarification", tasks: [], summary: raw.trim() };
  }

  const mode = parsed.mode === "single" ? "single" : "multi";
  const summary = parsed.summary ?? "";

  // Dispatch-unique prefix so task IDs don't collide across dispatches
  const prefix = crypto.randomUUID().slice(0, 8);
  const idMap = new Map<string, string>();

  const validate = (raw: any, index: number): DispatchTask => {
    const originalId = raw.id ?? `t${index}`;
    const uniqueId = `${prefix}-${originalId}`;
    idMap.set(originalId, uniqueId);
    return normalizeTask(raw, index, uniqueId);
  };

  if (mode === "single" && parsed.task) {
    const task = validate(parsed.task, 0);
    return { mode: "single", task, tasks: [task], summary };
  }

  const tasks: DispatchTask[] = (parsed.tasks || []).map(
    (t: any, i: number) => validate(t, i),
  );

  // Remap dependency references from PM's original IDs to prefixed IDs
  for (const task of tasks) {
    task.dependsOn = task.dependsOn
      .map((dep: string) => {
        const mapped = idMap.get(dep);
        if (!mapped) {
          console.warn(
            `[pm-dispatcher] Task "${task.id}" references unknown dep "${dep}", removing`,
          );
          return null;
        }
        return mapped;
      })
      .filter(Boolean) as string[];
  }

  if (tasks.length === 0) {
    throw new Error("PM produced an empty task plan");
  }

  if (tasks.length === 1) {
    return { mode: "single", task: tasks[0], tasks, summary };
  }

  return { mode: "multi", tasks, summary };
}
