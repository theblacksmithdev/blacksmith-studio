import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { AgentExecuteOptions } from "../../base/index.js";
import type { AgentRole } from "../../types.js";
import type { DispatchTask } from "./types.js";
import {
  VALID_ROLES,
  VALID_MODELS,
  VALID_REVIEW_LEVELS,
} from "./constants.js";
import { PM_REPLAN_PROMPT, PM_REPLAN_GATE_PROMPT } from "./prompts.js";
import { PMEventEmitter, type EmitFn } from "./pm-emitter.js";
import { runPM } from "./pm-runner.js";
import { AiModelTier } from "../../../../ai/types.js";
import { extractJsonStructure } from "../../utils/json-extract.js";

/** Artifacts smaller than this don't have enough content to warrant restructuring. */
const TINY_ARTIFACT_BYTES = 1024;
/** Truncate artifact content before sending to the gate — keeps the gate call cheap. */
const GATE_ARTIFACT_PREVIEW = 6000;

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

  // ── Cheap gates: skip the full replan when it clearly isn't needed ──
  if (remainingTasks.length <= 1) {
    // Nothing to re-distribute — a single remaining task can't be split or
    // merged with siblings.
    return remainingTasks;
  }

  const artifactContent = safeReadArtifact(
    artifactPath,
    baseOptions.projectRoot,
  );
  if (!artifactContent || artifactContent.length < TINY_ARTIFACT_BYTES) {
    // Artifact has too little content to shift the plan's shape.
    return remainingTasks;
  }

  const gateDecision = await runReplanGate(
    completedTask,
    artifactContent,
    remainingTasks,
    baseOptions,
  );
  if (!gateDecision.needed) {
    pm.activity(
      `Re-plan gate: skipping (${gateDecision.reason || "plan looks fine"})`,
    );
    return remainingTasks;
  }

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
    `Re-evaluating plan after ${completedTask.role} completed "${completedTask.title}" (gate: ${gateDecision.reason})...`,
  );

  try {
    const { text } = await runPM({
      prompt,
      systemPrompt: PM_REPLAN_PROMPT,
      baseOptions,
      label: "replan",
      model: AiModelTier.Fast,
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
  const candidate = extractJsonStructure(raw, "[");

  if (!candidate) {
    console.warn(
      "[pm-dispatcher] Re-plan: no JSON array found, keeping original tasks",
    );
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch (err: any) {
    console.warn(
      `[pm-dispatcher] Re-plan: parse failed (${err?.message}). ` +
        `Raw response (${raw.length} chars):\n${raw.slice(0, 2000)}` +
        (raw.length > 2000 ? "\n... [truncated]" : ""),
    );
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

/**
 * Ask a cheap Haiku call whether the remaining plan actually needs
 * restructuring. Defaults to "needed: true" on any failure so we never
 * suppress a legitimate replan — the gate is a speedup, not a filter.
 */
async function runReplanGate(
  completedTask: DispatchTask,
  artifactContent: string,
  remainingTasks: DispatchTask[],
  baseOptions: Omit<AgentExecuteOptions, "prompt">,
): Promise<{ needed: boolean; reason: string }> {
  const preview =
    artifactContent.length > GATE_ARTIFACT_PREVIEW
      ? artifactContent.slice(0, GATE_ARTIFACT_PREVIEW) + "\n\n[... truncated]"
      : artifactContent;

  const remainingDesc = remainingTasks
    .map(
      (t, i) =>
        `${i + 1}. [${t.role}] "${t.title}" — ${t.prompt.slice(0, 160).replace(/\s+/g, " ")}`,
    )
    .join("\n");

  const prompt = [
    `A ${completedTask.role} just completed "${completedTask.title}".`,
    "",
    "## Artifact content",
    preview,
    "",
    "## Remaining tasks",
    remainingDesc,
    "",
    "Decide: given what the artifact actually specifies, are the remaining tasks properly sized, or does the plan need to be re-decomposed?",
  ].join("\n");

  try {
    const { text } = await runPM({
      prompt,
      systemPrompt: PM_REPLAN_GATE_PROMPT,
      baseOptions,
      label: "replan-gate",
      model: AiModelTier.Fast,
    });

    const candidate = extractJsonStructure(text, "{");
    if (!candidate) {
      return { needed: true, reason: "gate returned no JSON" };
    }

    const parsed = JSON.parse(candidate);
    return {
      needed: parsed.needsReplan === true,
      reason: typeof parsed.reason === "string" ? parsed.reason : "",
    };
  } catch (err: any) {
    console.warn(
      `[pm-dispatcher] Replan gate failed, defaulting to full replan:`,
      err?.message,
    );
    return { needed: true, reason: "gate failed" };
  }
}

/**
 * Read the artifact file, clamping to a sensible upper bound.
 *
 * ArtifactManager returns a PROJECT-RELATIVE path (.blacksmith/artifacts/…)
 * so absolute paths resolve correctly regardless of the Electron process's
 * cwd. Callers pass in the project root so we can rejoin them.
 */
function safeReadArtifact(
  artifactPath: string,
  projectRoot: string,
): string | null {
  const absPath = path.isAbsolute(artifactPath)
    ? artifactPath
    : path.join(projectRoot, artifactPath);
  try {
    const stat = fs.statSync(absPath);
    if (stat.size === 0) return null;
    // Cap at 256KB — artifacts this large are exceptional and we only need
    // enough content for the gate + full replan to understand shape.
    const content = fs.readFileSync(absPath, "utf-8");
    return content.length > 262_144 ? content.slice(0, 262_144) : content;
  } catch (err: any) {
    console.warn(
      `[pm-dispatcher] Could not read artifact at ${absPath}:`,
      err?.message,
    );
    return null;
  }
}
