import { and, desc, eq, like, or } from "drizzle-orm";
import { artifacts } from "../../db/schema.js";
import type { Database } from "../../db/index.js";
import type {
  ArtifactListInput,
  ArtifactRecord,
  ArtifactUpsertInput,
} from "./types.js";

type ArtifactRow = typeof artifacts.$inferSelect;

/**
 * DB access for the `artifacts` table.
 *
 * Single Responsibility: row-level CRUD + a narrow set of filters the
 * library UI and MCP tools need. The service layer composes this with
 * the filesystem ArtifactManager — this class never touches disk.
 */
export class ArtifactRepository {
  constructor(private readonly db: Database) {}

  insert(row: {
    id: string;
    projectId: string;
    conversationId: string | null;
    dispatchId: string | null;
    taskId: string | null;
    role: string;
    slug: string;
    title: string;
    relPath: string;
    sizeBytes: number;
    tags: string;
    createdAt: string;
    updatedAt: string;
  }): void {
    this.db.insert(artifacts).values(row).run();
  }

  findById(id: string): ArtifactRow | null {
    return (
      this.db.select().from(artifacts).where(eq(artifacts.id, id)).get() ??
      null
    );
  }

  findByRelPath(projectId: string, relPath: string): ArtifactRow | null {
    return (
      this.db
        .select()
        .from(artifacts)
        .where(
          and(
            eq(artifacts.projectId, projectId),
            eq(artifacts.relPath, relPath),
          ),
        )
        .get() ?? null
    );
  }

  list(input: ArtifactListInput): ArtifactRow[] {
    const conditions = [eq(artifacts.projectId, input.projectId)];
    if (input.conversationId) {
      conditions.push(eq(artifacts.conversationId, input.conversationId));
    }
    if (input.role) conditions.push(eq(artifacts.role, input.role));
    if (input.search && input.search.trim().length > 0) {
      const needle = `%${input.search.trim()}%`;
      conditions.push(
        or(like(artifacts.title, needle), like(artifacts.slug, needle))!,
      );
    }
    if (input.tag && input.tag.trim().length > 0) {
      conditions.push(like(artifacts.tags, `%"${input.tag.trim()}"%`));
    }

    let query = this.db
      .select()
      .from(artifacts)
      .where(and(...conditions))
      .orderBy(desc(artifacts.updatedAt));

    if (input.limit != null) query = query.limit(input.limit) as typeof query;

    return query.all();
  }

  listByProject(projectId: string): ArtifactRow[] {
    return this.db
      .select()
      .from(artifacts)
      .where(eq(artifacts.projectId, projectId))
      .all();
  }

  updateMeta(
    id: string,
    patch: {
      title?: string;
      slug?: string;
      relPath?: string;
      sizeBytes?: number;
      tags?: string;
      updatedAt: string;
    },
  ): void {
    this.db.update(artifacts).set(patch).where(eq(artifacts.id, id)).run();
  }

  remove(id: string): void {
    this.db.delete(artifacts).where(eq(artifacts.id, id)).run();
  }

  /** Insert or update on (project_id, rel_path) conflict. */
  upsert(row: ArtifactUpsertInput & {
    id: string;
    tagsJson: string;
    createdAt: string;
    updatedAt: string;
  }): void {
    const existing = this.findByRelPath(row.projectId, row.relPath);
    if (existing) {
      this.updateMeta(existing.id, {
        title: row.title,
        slug: row.slug,
        sizeBytes: row.sizeBytes,
        tags: row.tagsJson,
        updatedAt: row.updatedAt,
      });
      return;
    }
    this.insert({
      id: row.id,
      projectId: row.projectId,
      conversationId: row.conversationId,
      dispatchId: row.dispatchId,
      taskId: row.taskId,
      role: row.role,
      slug: row.slug,
      title: row.title,
      relPath: row.relPath,
      sizeBytes: row.sizeBytes,
      tags: row.tagsJson,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

export function mapArtifactRow(row: ArtifactRow): ArtifactRecord {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags);
    if (Array.isArray(parsed)) {
      tags = parsed.filter((t): t is string => typeof t === "string");
    }
  } catch {
    tags = [];
  }
  return {
    id: row.id,
    projectId: row.projectId,
    conversationId: row.conversationId,
    dispatchId: row.dispatchId,
    taskId: row.taskId,
    role: row.role,
    slug: row.slug,
    title: row.title,
    relPath: row.relPath,
    sizeBytes: row.sizeBytes,
    tags,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
