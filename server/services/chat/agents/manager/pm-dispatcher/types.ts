import type { AgentRole } from "../../types.js";

export type TaskModel = "fast" | "balanced" | "premium";

/**
 * Review level determines how much quality gate scrutiny a task receives.
 * - 'none': Skip quality gate entirely (specs, docs, trivial changes)
 * - 'light': One review pass, no test cycle (simple renames, config changes)
 * - 'full': Full review + test cycles (features, complex logic, security-critical code)
 */
export type ReviewLevel = "none" | "light" | "full";

export interface DispatchTask {
  id: string;
  title: string;
  /** Brief description of what this task delivers */
  description: string;
  role: AgentRole;
  prompt: string;
  /** IDs of tasks this depends on (must complete first) */
  dependsOn: string[];
  /** AI model selected by PM based on task complexity */
  model: TaskModel;
  /** How much quality gate scrutiny this task needs */
  reviewLevel: ReviewLevel;
}

export interface DispatchPlan {
  /** 'single' = one agent, 'multi' = ordered tasks, 'clarification' = PM needs more info */
  mode: "single" | "multi" | "clarification";
  /** For single mode: the one task to execute */
  task?: DispatchTask;
  /** For multi mode: ordered task list */
  tasks: DispatchTask[];
  /** Brief explanation of the plan, or the PM's question for clarification mode */
  summary: string;
  /**
   * Claude CLI session id the PM used for this dispatch. Populated whenever
   * the PM was invoked (any mode). The IPC layer persists this on the
   * conversation so the next user message resumes the same PM session
   * instead of starting fresh. Undefined for direct (non-PM) plans.
   */
  pmSessionId?: string;
}
