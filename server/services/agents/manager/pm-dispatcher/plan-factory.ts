import type { AgentRole } from "../../types.js";
import type { DispatchPlan, DispatchTask } from "./types.js";

/**
 * Build a DispatchPlan for a prompt that explicitly targets a single role.
 * Skips the PM entirely — used for "@role" or "as a <title>" prompts.
 */
export function buildDirectPlan(
  role: AgentRole,
  agentTitle: string,
  prompt: string,
): DispatchPlan {
  const task: DispatchTask = {
    id: "t0",
    title: prompt.slice(0, 60),
    description: "",
    role,
    prompt,
    dependsOn: [],
    model: "balanced",
    reviewLevel: "light",
  };
  return {
    mode: "single",
    task,
    tasks: [task],
    summary: `Direct to ${agentTitle} (requested by user)`,
  };
}
