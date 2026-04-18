import { and, desc, eq } from "drizzle-orm";
import { commandRuns } from "../../../db/schema.js";
import type { Database } from "../../../db/index.js";
import type { CommandStatus } from "../types.js";

type CommandRunRow = typeof commandRuns.$inferSelect;

export interface CommandRunInsert {
  id: string;
  projectId: string;
  conversationId: string | null;
  taskId: string | null;
  agentRole: string | null;
  toolchainId: string;
  preset: string | null;
  scope: "studio" | "project";
  command: string;
  args: string; // JSON array
  cwd: string;
  resolvedEnvDisplay: string | null;
  startedAt: string;
  status: CommandStatus;
}

export interface CommandRunUpdate {
  exitCode?: number | null;
  stdout?: string | null;
  stderr?: string | null;
  finishedAt?: string;
  durationMs?: number;
  status?: CommandStatus;
}

/**
 * DB access for the `command_runs` table.
 *
 * Single Responsibility: row-level CRUD for command audit rows. The
 * service layer owns truncation policy for stdout/stderr before calling
 * `update()` — this class never shapes data.
 */
export class CommandRunRepository {
  constructor(private readonly db: Database) {}

  insert(row: CommandRunInsert): void {
    this.db.insert(commandRuns).values(row).run();
  }

  update(id: string, patch: CommandRunUpdate): void {
    if (Object.keys(patch).length === 0) return;
    this.db.update(commandRuns).set(patch).where(eq(commandRuns.id, id)).run();
  }

  findById(id: string): CommandRunRow | null {
    return (
      this.db
        .select()
        .from(commandRuns)
        .where(eq(commandRuns.id, id))
        .get() ?? null
    );
  }

  listForProject(
    projectId: string,
    limit = 100,
    conversationId?: string,
  ): CommandRunRow[] {
    const condition = conversationId
      ? and(
          eq(commandRuns.projectId, projectId),
          eq(commandRuns.conversationId, conversationId),
        )
      : eq(commandRuns.projectId, projectId);
    return this.db
      .select()
      .from(commandRuns)
      .where(condition)
      .orderBy(desc(commandRuns.startedAt))
      .limit(limit)
      .all();
  }
}

export type { CommandRunRow };
