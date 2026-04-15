import crypto from "node:crypto";
import path from "node:path";
import { eq, desc } from "drizzle-orm";
import { getDatabase } from "../db/index.js";
import { projects } from "../db/schema.js";

export interface Project {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  lastOpenedAt: string;
}

export class ProjectManager {
  constructor() {
    getDatabase();
  }

  private get db() {
    return getDatabase();
  }

  list(): Project[] {
    return this.db
      .select()
      .from(projects)
      .orderBy(desc(projects.lastOpenedAt))
      .all() as Project[];
  }

  get(id: string): Project | null {
    return this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .get() as Project | null;
  }

  getByPath(projectPath: string): Project | null {
    return this.db
      .select()
      .from(projects)
      .where(eq(projects.path, projectPath))
      .get() as Project | null;
  }

  register(projectPath: string, name?: string): Project {
    const absPath = path.resolve(projectPath);

    // Check if already registered
    const existing = this.getByPath(absPath);
    if (existing) {
      this.touchLastOpened(existing.id);
      return existing;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const projectName = name || path.basename(absPath);

    this.db
      .insert(projects)
      .values({
        id,
        name: projectName,
        path: absPath,
        createdAt: now,
        lastOpenedAt: now,
      })
      .run();

    return {
      id,
      name: projectName,
      path: absPath,
      createdAt: now,
      lastOpenedAt: now,
    };
  }

  remove(id: string): boolean {
    const existing = this.get(id);
    if (!existing) return false;
    this.db.delete(projects).where(eq(projects.id, id)).run();
    return true;
  }

  rename(id: string, name: string): Project | null {
    const existing = this.get(id);
    if (!existing) return null;
    this.db.update(projects).set({ name }).where(eq(projects.id, id)).run();
    return { ...existing, name };
  }

  /** Update lastOpenedAt timestamp for a project. */
  touchLastOpened(id: string): void {
    this.db
      .update(projects)
      .set({ lastOpenedAt: new Date().toISOString() })
      .where(eq(projects.id, id))
      .run();
  }
}
