import { eq, desc } from "drizzle-orm";
import { agentDispatches } from "../../../db/schema.js";
import type { Database } from "../types.js";
import type { DispatchRow } from "../mappers.js";

export interface DispatchInsert {
  id: string;
  projectId: string;
  conversationId: string | null;
  prompt: string;
  planMode: string;
  planSummary: string;
  status: string;
  totalCostUsd: string;
  totalDurationMs: number;
  createdAt: string;
}

export interface DispatchUpdate {
  status?: string;
  totalCostUsd?: string;
  totalDurationMs?: number;
  completedAt?: string;
}

/**
 * DB access for the `agent_dispatches` table.
 *
 * Single Responsibility: dispatch-row CRUD. Field-level coercion (numeric
 * strings, optional timestamps) lives in the mappers — this layer works
 * in raw row shapes so the write path is typed exactly as the schema.
 */
export class DispatchRepository {
  constructor(private readonly db: Database) {}

  insert(row: DispatchInsert): void {
    this.db.insert(agentDispatches).values(row).run();
  }

  update(id: string, patch: DispatchUpdate): void {
    if (Object.keys(patch).length === 0) return;
    this.db
      .update(agentDispatches)
      .set(patch)
      .where(eq(agentDispatches.id, id))
      .run();
  }

  findById(id: string): DispatchRow | null {
    return (
      this.db
        .select()
        .from(agentDispatches)
        .where(eq(agentDispatches.id, id))
        .get() ?? null
    );
  }

  listByProject(projectId: string, limit: number): DispatchRow[] {
    return this.db
      .select()
      .from(agentDispatches)
      .where(eq(agentDispatches.projectId, projectId))
      .orderBy(desc(agentDispatches.createdAt))
      .limit(limit)
      .all();
  }
}
