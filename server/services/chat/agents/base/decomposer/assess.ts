import type { AgentRoleDefinition } from "../../types.js";
import type { AgentExecuteOptions } from "../types.js";
import { extractJsonStructure } from "../../utils/json-extract.js";
import { DECOMPOSER_PROMPT } from "./prompt.js";

export interface SubTask {
  id: string;
  title: string;
  /** Brief description of what this sub-task delivers */
  description: string;
  prompt: string;
}

export interface ComplexityAssessment {
  simple: boolean;
  subtasks: SubTask[];
}

/** Minimum prompt length to even consider assessment (short prompts are always simple) */
const MIN_PROMPT_LENGTH = 300;

/** Safety timeout — assessment shouldn't take more than 30s */
const ASSESS_TIMEOUT_MS = 30_000;

/**
 * Assess whether a task is too complex for one pass and optionally decompose it.
 * Returns immediately with { simple: true } for short/simple prompts.
 * Only runs the Claude assessment for longer, potentially complex prompts.
 */
export async function assessComplexity(
  prompt: string,
  definition: AgentRoleDefinition,
  options: AgentExecuteOptions,
): Promise<ComplexityAssessment> {
  if (prompt.length < MIN_PROMPT_LENGTH) {
    return { simple: true, subtasks: [] };
  }

  // Quick heuristic: if the prompt doesn't contain complexity signals, skip
  const complexitySignals = [
    " and ",
    " then ",
    " also ",
    " plus ",
    " with ",
    "\n-",
    "\n*",
    "\n1.",
    "\n2.",
  ];
  const signalCount = complexitySignals.filter((s) =>
    prompt.toLowerCase().includes(s),
  ).length;
  if (signalCount < 2) {
    return { simple: true, subtasks: [] };
  }

  if (!options.ai) {
    console.warn("[assess] Skipping assessment — Ai router not wired in");
    return { simple: true, subtasks: [] };
  }

  const text = await options.ai.complete({
    prompt: `You are a ${definition.title}.\n\nAssess this task:\n${prompt}`,
    systemPrompt: DECOMPOSER_PROMPT,
    cwd: options.projectRoot,
    disableTools: true,
    timeout: ASSESS_TIMEOUT_MS,
    providerId: options.providerId,
  });

  return parseAssessment(text ?? "");
}

function parseAssessment(raw: string): ComplexityAssessment {
  const candidate = extractJsonStructure(raw, "{");
  if (!candidate) {
    return { simple: true, subtasks: [] };
  }

  try {
    const parsed = JSON.parse(candidate);

    if (
      parsed.simple === true ||
      !Array.isArray(parsed.subtasks) ||
      parsed.subtasks.length === 0
    ) {
      return { simple: true, subtasks: [] };
    }

    const subtasks: SubTask[] = parsed.subtasks
      .filter((s: any) => s.prompt && typeof s.prompt === "string")
      .map((s: any, i: number) => ({
        id: s.id ?? `s${i + 1}`,
        title: s.title ?? `Sub-task ${i + 1}`,
        description: s.description ?? "",
        prompt: s.prompt,
      }));

    if (subtasks.length <= 1) {
      return { simple: true, subtasks: [] };
    }

    return { simple: false, subtasks };
  } catch {
    return { simple: true, subtasks: [] };
  }
}
