import { eq, desc } from "drizzle-orm";
import { sessions } from "../../../db/schema.js";
import type { Database } from "../types.js";
import type { SessionRow } from "../mappers.js";

/**
 * DB access for the `sessions` table.
 *
 * Single Responsibility: CRUD on session rows. No domain objects leak
 * in or out — callers translate via mappers.
 */
export class SessionRepository {
  constructor(private readonly db: Database) {}

  insert(row: {
    id: string;
    projectId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }): void {
    this.db.insert(sessions).values(row).run();
  }

  findById(id: string): SessionRow | null {
    return (
      this.db.select().from(sessions).where(eq(sessions.id, id)).get() ?? null
    );
  }

  listByProject(
    projectId: string,
    limit?: number,
    offset?: number,
  ): SessionRow[] {
    let query = this.db
      .select()
      .from(sessions)
      .where(eq(sessions.projectId, projectId))
      .orderBy(desc(sessions.updatedAt));

    if (limit != null) query = query.limit(limit) as typeof query;
    if (offset != null) query = query.offset(offset) as typeof query;

    return query.all();
  }

  countByProject(projectId: string): number {
    return this.db
      .select()
      .from(sessions)
      .where(eq(sessions.projectId, projectId))
      .all().length;
  }

  rename(id: string, name: string): void {
    this.db
      .update(sessions)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(sessions.id, id))
      .run();
  }

  touch(id: string): void {
    this.db
      .update(sessions)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(sessions.id, id))
      .run();
  }

  remove(id: string): void {
    this.db.delete(sessions).where(eq(sessions.id, id)).run();
  }
}
