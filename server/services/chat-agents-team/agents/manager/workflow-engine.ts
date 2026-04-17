import type { AgentExecuteOptions } from "../base/index.js";
import type {
  AgentRole,
  AgentExecution,
  Workflow,
  WorkflowEvent,
} from "../types.js";

type ExecuteFn = (
  options: AgentExecuteOptions & { role?: AgentRole },
) => Promise<AgentExecution>;
type EmitFn = (event: WorkflowEvent) => void;

/**
 * Execute workflow steps respecting dependency ordering.
 * Steps without dependencies (or whose dependencies are met) run in parallel.
 */
export async function executeWorkflowSteps(
  workflow: Workflow,
  baseOptions: Omit<AgentExecuteOptions, "prompt">,
  execute: ExecuteFn,
  emitWorkflow: EmitFn,
): Promise<void> {
  const { steps } = workflow;
  const completed = new Set<number>();

  while (completed.size < steps.length) {
    // Budget guard
    if (
      workflow.maxBudgetUsd != null &&
      workflow.totalCostUsd >= workflow.maxBudgetUsd
    ) {
      for (let i = 0; i < steps.length; i++) {
        if (!completed.has(i)) {
          steps[i].status = "failed";
          steps[i].error = "Budget exceeded";
        }
      }
      break;
    }

    // Cancellation guard
    if (workflow.status === "cancelled") break;

    // Find ready steps
    const ready: number[] = [];
    for (let i = 0; i < steps.length; i++) {
      if (completed.has(i)) continue;
      if (steps[i].status !== "pending") continue;

      const dep = steps[i].dependsOn;
      if (dep === null || completed.has(dep)) {
        if (dep !== null && steps[dep].status !== "completed") {
          steps[i].status = "failed";
          steps[i].error = `Dependency step ${dep} (${steps[dep].role}) failed`;
          completed.add(i);
          continue;
        }
        ready.push(i);
      }
    }

    // Deadlock detection
    if (ready.length === 0) {
      for (let i = 0; i < steps.length; i++) {
        if (!completed.has(i)) {
          steps[i].status = "failed";
          steps[i].error = "Deadlocked — unresolvable dependencies";
          completed.add(i);
        }
      }
      break;
    }

    // Execute in parallel
    await Promise.allSettled(
      ready.map((idx) =>
        executeStep(workflow, idx, baseOptions, execute, emitWorkflow),
      ),
    );

    for (const idx of ready) completed.add(idx);
  }
}

async function executeStep(
  workflow: Workflow,
  stepIndex: number,
  baseOptions: Omit<AgentExecuteOptions, "prompt">,
  execute: ExecuteFn,
  emitWorkflow: EmitFn,
): Promise<void> {
  const step = workflow.steps[stepIndex];

  // Inject previous step's result into prompt
  let prompt = step.prompt;
  if (step.dependsOn !== null) {
    const depResult = workflow.steps[step.dependsOn].result;
    if (depResult) {
      prompt = prompt.replace(/\{previous_result\}/g, depResult);
    }
  }

  step.status = "running";
  emitWorkflow({
    type: "workflow:step_started",
    workflowId: workflow.id,
    stepIndex,
    timestamp: new Date().toISOString(),
    data: {
      role: step.role,
      status: "running",
      message: `Starting ${step.role}`,
    },
  });

  try {
    const execution = await execute({
      ...baseOptions,
      prompt,
      role: step.role,
    });

    step.executionId = execution.id;

    if (execution.status === "done") {
      step.result = `Completed by ${step.role}`;
      step.status = "completed";
      workflow.totalCostUsd += execution.costUsd;
      workflow.totalDurationMs += execution.durationMs;

      emitWorkflow({
        type: "workflow:step_completed",
        workflowId: workflow.id,
        stepIndex,
        timestamp: new Date().toISOString(),
        data: {
          role: step.role,
          status: "completed",
          costUsd: execution.costUsd,
          durationMs: execution.durationMs,
        },
      });
    } else {
      step.status = "failed";
      step.error = execution.error ?? "Unknown error";
      emitWorkflow({
        type: "workflow:step_failed",
        workflowId: workflow.id,
        stepIndex,
        timestamp: new Date().toISOString(),
        data: { role: step.role, status: "failed", message: step.error },
      });
    }
  } catch (err: any) {
    step.status = "failed";
    step.error = err.message;
    emitWorkflow({
      type: "workflow:step_failed",
      workflowId: workflow.id,
      stepIndex,
      timestamp: new Date().toISOString(),
      data: { role: step.role, status: "failed", message: err.message },
    });
  }
}
