import type { AgentEvent } from "../../types.js";

export type EmitFn = (event: AgentEvent) => void;

/**
 * PM-scoped event shaping.
 *
 * Single Responsibility: converting PM-domain concepts (activity/status/
 * message) into the AgentEvent envelope. The three PM entry points all
 * emitted the same hand-rolled shape — this centralises it.
 */
export class PMEventEmitter {
  constructor(private readonly emit?: EmitFn) {}

  activity(description: string): void {
    this.send("activity", { description });
  }

  status(status: "executing", message: string): void {
    this.send("status", { status, message });
  }

  message(content: string, isPartial: boolean): void {
    this.send("message", { content, isPartial });
  }

  private send(type: AgentEvent["data"]["type"], data: Record<string, any>): void {
    if (!this.emit) return;
    this.emit({
      type: type as AgentEvent["type"],
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: { type, ...data } as AgentEvent["data"],
    });
  }
}
