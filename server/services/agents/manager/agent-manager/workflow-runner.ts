import crypto from "node:crypto";
import type { AgentExecuteOptions } from "../../base/index.js";
import type {
  AgentRole,
  AgentExecution,
  Workflow,
  WorkflowStep,
} from "../../types.js";
import { PIPELINE_TEMPLATES, type PipelineTemplate } from "../pipelines.js";
import { executeWorkflowSteps } from "../workflow-engine.js";
import type { EventBus } from "./event-bus.js";

type ExecuteFn = (
  opts: AgentExecuteOptions & { role?: AgentRole },
) => Promise<AgentExecution>;

/**
 * Manages pipeline and workflow lifecycle.
 *
 * Single Responsibility: creating, running, and tracking workflows.
 * Delegates step execution to the existing workflow-engine module.
 */
export class WorkflowRunner {
  private activeWorkflows = new Map<string, Workflow>();

  constructor(
    private readonly bus: EventBus,
    private readonly execute: ExecuteFn,
  ) {}

  listPipelines(): PipelineTemplate[] {
    return PIPELINE_TEMPLATES;
  }

  async runPipeline(
    pipelineId: string,
    prompt: string,
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<Workflow> {
    const template = PIPELINE_TEMPLATES.find((t) => t.id === pipelineId);
    if (!template) throw new Error(`Unknown pipeline: ${pipelineId}`);

    const steps: WorkflowStep[] = template.steps.map((s) => ({
      role: s.role,
      prompt: s.promptTemplate.replace(/\{prompt\}/g, prompt),
      dependsOn: s.dependsOn,
      status: "pending",
      executionId: null,
      result: null,
      error: null,
    }));

    return this.run(template.name, steps, baseOptions, maxBudgetUsd);
  }

  async runWorkflow(
    name: string,
    steps: { role: AgentRole; prompt: string; dependsOn?: number }[],
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<Workflow> {
    const workflowSteps: WorkflowStep[] = steps.map((s) => ({
      role: s.role,
      prompt: s.prompt,
      dependsOn: s.dependsOn ?? null,
      status: "pending",
      executionId: null,
      result: null,
      error: null,
    }));

    return this.run(name, workflowSteps, baseOptions, maxBudgetUsd);
  }

  getActive(): Workflow[] {
    return Array.from(this.activeWorkflows.values());
  }

  /** Cancel all running workflows and emit cancellation events */
  cancelAll(): void {
    for (const [id, workflow] of this.activeWorkflows) {
      if (workflow.status === "running") {
        workflow.status = "cancelled";
        workflow.completedAt = new Date().toISOString();
        this.bus.emitWorkflowEvent({
          type: "workflow:cancelled",
          workflowId: id,
          stepIndex: null,
          timestamp: workflow.completedAt,
          data: { status: "cancelled", message: "Cancelled by user" },
        });
      }
    }
    this.activeWorkflows.clear();
  }

  private async run(
    name: string,
    steps: WorkflowStep[],
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<Workflow> {
    const workflowId = crypto.randomUUID();
    const now = new Date().toISOString();

    const workflow: Workflow = {
      id: workflowId,
      name,
      status: "running",
      steps,
      totalCostUsd: 0,
      totalDurationMs: 0,
      startedAt: now,
      completedAt: null,
      maxBudgetUsd: maxBudgetUsd ?? null,
    };

    this.activeWorkflows.set(workflowId, workflow);
    this.bus.emitWorkflowEvent({
      type: "workflow:started",
      workflowId,
      stepIndex: null,
      timestamp: now,
      data: { status: "running", message: `Starting ${name}` },
    });

    try {
      await executeWorkflowSteps(
        workflow,
        baseOptions,
        (opts) => this.execute(opts),
        (event) => this.bus.emitWorkflowEvent(event),
      );

      const allDone = workflow.steps.every((s) => s.status === "completed");
      workflow.status = allDone ? "completed" : "failed";
      workflow.completedAt = new Date().toISOString();

      this.bus.emitWorkflowEvent({
        type: allDone ? "workflow:completed" : "workflow:failed",
        workflowId,
        stepIndex: null,
        timestamp: workflow.completedAt,
        data: {
          status: workflow.status,
          costUsd: workflow.totalCostUsd,
          durationMs: workflow.totalDurationMs,
          message: allDone
            ? `${name} completed (${steps.length} steps)`
            : `${name} failed`,
        },
      });
    } catch (err: any) {
      workflow.status = "failed";
      workflow.completedAt = new Date().toISOString();
      this.bus.emitWorkflowEvent({
        type: "workflow:failed",
        workflowId,
        stepIndex: null,
        timestamp: workflow.completedAt,
        data: { status: "failed", message: err.message },
      });
    } finally {
      this.activeWorkflows.delete(workflowId);
    }

    return workflow;
  }
}
