import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ArtifactManager } from "../chat/agents/artifacts.js";
import type { AgentRole } from "../chat/agents/types.js";
import { projectDataRelPath } from "../project-paths.js";
import {
  ArtifactRepository,
  mapArtifactRow,
} from "./artifact-repository.js";
import type {
  ArtifactChange,
  ArtifactCreateInput,
  ArtifactListInput,
  ArtifactRecord,
} from "./types.js";

const ARTIFACTS_REL = projectDataRelPath("artifacts");

export interface ArtifactServiceProjectResolver {
  getPath(projectId: string): string;
}

export type ArtifactChangeListener = (change: ArtifactChange) => void;

/**
 * Application-level owner of the artifact lifecycle.
 *
 * Single Responsibility: orchestrate the filesystem ArtifactManager
 * (writes / reads markdown under `.blacksmith/artifacts/`) and the
 * ArtifactRepository (DB-indexed metadata) so that every on-disk file
 * has a matching row and vice versa.
 *
 * All read paths go through `readContent` (which reads disk) and
 * `list` / `get` (which read the repo) — IPC layer never touches fs
 * or Drizzle directly.
 */
export class ArtifactService {
  private listeners: ArtifactChangeListener[] = [];
  private managers = new Map<string, ArtifactManager>();

  constructor(
    private readonly repo: ArtifactRepository,
    private readonly projects: ArtifactServiceProjectResolver,
  ) {}

  onChange(listener: ArtifactChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /* ── Reads ── */

  list(input: ArtifactListInput): ArtifactRecord[] {
    return this.repo.list(input).map(mapArtifactRow);
  }

  get(id: string): ArtifactRecord | null {
    const row = this.repo.findById(id);
    return row ? mapArtifactRow(row) : null;
  }

  readContent(id: string): { artifact: ArtifactRecord; content: string } | null {
    const row = this.repo.findById(id);
    if (!row) return null;
    const projectRoot = this.projects.getPath(row.projectId);
    const abs = path.join(projectRoot, row.relPath);
    if (!fs.existsSync(abs)) return null;
    const raw = fs.readFileSync(abs, "utf-8");
    const content = stripFrontmatter(raw);
    return { artifact: mapArtifactRow(row), content };
  }

  /* ── Mutations ── */

  writeContent(id: string, content: string): ArtifactRecord {
    const row = this.repo.findById(id);
    if (!row) throw new Error(`Artifact ${id} not found`);
    const projectRoot = this.projects.getPath(row.projectId);
    const abs = path.join(projectRoot, row.relPath);
    const rendered = renderWithFrontmatter({
      role: row.role,
      title: row.title,
      taskId: row.taskId,
      createdAt: row.createdAt,
      content,
    });
    fs.writeFileSync(abs, rendered, "utf-8");
    const now = new Date().toISOString();
    this.repo.updateMeta(id, {
      sizeBytes: Buffer.byteLength(rendered, "utf-8"),
      updatedAt: now,
    });
    return this.emitUpsert(id);
  }

  rename(id: string, title: string): ArtifactRecord {
    const row = this.repo.findById(id);
    if (!row) throw new Error(`Artifact ${id} not found`);
    const trimmed = title.trim();
    if (!trimmed) throw new Error("Title cannot be empty");
    const projectRoot = this.projects.getPath(row.projectId);
    const manager = this.managerFor(row.projectId, projectRoot);
    const newSlug = manager.slugifyPublic(trimmed);
    const idPrefix = (row.taskId ?? row.id).slice(0, 8);
    const newFilename = `${idPrefix}-${newSlug}.md`;
    const newRel = path.posix.join(ARTIFACTS_REL, row.role, newFilename);
    const oldAbs = path.join(projectRoot, row.relPath);
    const newAbs = path.join(projectRoot, newRel);

    if (newRel !== row.relPath) {
      fs.mkdirSync(path.dirname(newAbs), { recursive: true });
      if (fs.existsSync(oldAbs)) {
        fs.renameSync(oldAbs, newAbs);
      }
    }

    // Rewrite content with updated frontmatter title
    if (fs.existsSync(newAbs)) {
      const body = stripFrontmatter(fs.readFileSync(newAbs, "utf-8"));
      const rendered = renderWithFrontmatter({
        role: row.role,
        title: trimmed,
        taskId: row.taskId,
        createdAt: row.createdAt,
        content: body,
      });
      fs.writeFileSync(newAbs, rendered, "utf-8");
    }

    const now = new Date().toISOString();
    this.repo.updateMeta(id, {
      title: trimmed,
      slug: newSlug,
      relPath: newRel,
      sizeBytes: fs.existsSync(newAbs) ? fs.statSync(newAbs).size : row.sizeBytes,
      updatedAt: now,
    });
    return this.emitUpsert(id);
  }

  setTags(id: string, tags: string[]): ArtifactRecord {
    const row = this.repo.findById(id);
    if (!row) throw new Error(`Artifact ${id} not found`);
    const cleaned = Array.from(
      new Set(
        tags
          .map((t) => t.trim())
          .filter((t) => t.length > 0 && t.length <= 40),
      ),
    );
    const now = new Date().toISOString();
    this.repo.updateMeta(id, {
      tags: JSON.stringify(cleaned),
      updatedAt: now,
    });
    return this.emitUpsert(id);
  }

  /** Hard delete — removes the DB row AND the file on disk. */
  delete(id: string): void {
    const row = this.repo.findById(id);
    if (!row) return;
    const projectRoot = this.projects.getPath(row.projectId);
    const abs = path.join(projectRoot, row.relPath);
    if (fs.existsSync(abs)) {
      try {
        fs.unlinkSync(abs);
      } catch (err) {
        console.warn(`[artifacts] failed to unlink ${abs}:`, err);
      }
    }
    this.repo.remove(id);
    for (const listener of this.listeners) {
      try {
        listener({ kind: "delete", id, projectId: row.projectId });
      } catch {
        /* ignore listener errors */
      }
    }
  }

  /** Create a brand-new artifact (from an agent MCP call or user action). */
  create(input: ArtifactCreateInput): ArtifactRecord {
    const projectRoot = this.projects.getPath(input.projectId);
    const manager = this.managerFor(input.projectId, projectRoot);
    const id = crypto.randomUUID();
    const taskIdOrNew = input.taskId ?? id;
    const relPath = manager.writeArtifact(
      input.role as AgentRole,
      taskIdOrNew,
      input.title,
      input.content,
    );
    const abs = path.join(projectRoot, relPath);
    const slug = manager.slugifyPublic(input.title);
    const now = new Date().toISOString();
    this.repo.upsert({
      id,
      projectId: input.projectId,
      conversationId: input.conversationId ?? null,
      dispatchId: input.dispatchId ?? null,
      taskId: input.taskId ?? null,
      role: input.role,
      slug,
      title: input.title,
      relPath,
      sizeBytes: fs.existsSync(abs) ? fs.statSync(abs).size : 0,
      tagsJson: JSON.stringify(input.tags ?? []),
      createdAt: now,
      updatedAt: now,
    });
    return this.emitUpsert(id);
  }

  /**
   * Called by the task-plan-executor after a task's response is auto-
   * saved to disk. Upserts the DB metadata so the artifact appears in
   * the UI / library immediately.
   */
  indexFromTaskWrite(params: {
    projectId: string;
    role: string;
    taskId: string;
    title: string;
    relPath: string;
    conversationId?: string | null;
    dispatchId?: string | null;
  }): ArtifactRecord | null {
    const projectRoot = this.projects.getPath(params.projectId);
    const abs = path.join(projectRoot, params.relPath);
    if (!fs.existsSync(abs)) return null;
    const size = fs.statSync(abs).size;
    const slug = path
      .basename(params.relPath, ".md")
      .replace(/^[a-f0-9]{8}-/, "");
    const existing = this.repo.findByRelPath(params.projectId, params.relPath);
    const id = existing?.id ?? crypto.randomUUID();
    const createdAt = existing?.createdAt ?? new Date().toISOString();
    const updatedAt = new Date().toISOString();
    this.repo.upsert({
      id,
      projectId: params.projectId,
      conversationId: params.conversationId ?? null,
      dispatchId: params.dispatchId ?? null,
      taskId: params.taskId,
      role: params.role,
      slug,
      title: params.title,
      relPath: params.relPath,
      sizeBytes: size,
      tagsJson: existing?.tags ?? "[]",
      createdAt,
      updatedAt,
    });
    return this.emitUpsert(id);
  }

  /**
   * Walk `.blacksmith/artifacts/*&#47;*.md` on disk and upsert any row that's
   * missing or stale. Does NOT delete DB rows for files that no longer
   * exist — the user triggers that explicitly via delete().
   */
  backfill(projectId: string): { indexed: number } {
    const projectRoot = this.projects.getPath(projectId);
    const root = path.join(projectRoot, ARTIFACTS_REL);
    if (!fs.existsSync(root)) return { indexed: 0 };

    let indexed = 0;
    const roles = fs.readdirSync(root, { withFileTypes: true });
    for (const roleEntry of roles) {
      if (!roleEntry.isDirectory()) continue;
      const role = roleEntry.name;
      const roleDir = path.join(root, role);
      const files = fs.readdirSync(roleDir, { withFileTypes: true });
      for (const fileEntry of files) {
        if (!fileEntry.isFile() || !fileEntry.name.endsWith(".md")) continue;
        const abs = path.join(roleDir, fileEntry.name);
        const relPath = path.posix.join(ARTIFACTS_REL, role, fileEntry.name);
        const raw = fs.readFileSync(abs, "utf-8");
        const meta = parseFrontmatter(raw);
        const slug = path
          .basename(fileEntry.name, ".md")
          .replace(/^[a-f0-9]{8}-/, "");
        const stat = fs.statSync(abs);
        const title = meta.task ?? slug.replace(/-/g, " ");
        const taskId = meta.taskId ?? null;
        const existing = this.repo.findByRelPath(projectId, relPath);
        const id = existing?.id ?? crypto.randomUUID();
        const createdAt =
          meta.createdAt ?? existing?.createdAt ?? stat.birthtime.toISOString();
        const updatedAt = stat.mtime.toISOString();
        this.repo.upsert({
          id,
          projectId,
          conversationId: null,
          dispatchId: null,
          taskId,
          role,
          slug,
          title,
          relPath,
          sizeBytes: stat.size,
          tagsJson: existing?.tags ?? "[]",
          createdAt,
          updatedAt,
        });
        this.emitUpsert(id);
        indexed += 1;
      }
    }
    return { indexed };
  }

  /* ── internals ── */

  private managerFor(projectId: string, projectRoot: string): ArtifactManager {
    const cached = this.managers.get(projectId);
    if (cached) return cached;
    const manager = new ArtifactManager(projectRoot);
    this.managers.set(projectId, manager);
    return manager;
  }

  private emitUpsert(id: string): ArtifactRecord {
    const row = this.repo.findById(id);
    if (!row) throw new Error(`Artifact ${id} vanished after write`);
    const artifact = mapArtifactRow(row);
    for (const listener of this.listeners) {
      try {
        listener({ kind: "upsert", artifact });
      } catch {
        /* ignore listener errors */
      }
    }
    return artifact;
  }
}

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith("---")) return raw.trim();
  const endIdx = raw.indexOf("---", 3);
  if (endIdx === -1) return raw.trim();
  return raw.slice(endIdx + 3).trim();
}

function renderWithFrontmatter(args: {
  role: string;
  title: string;
  taskId: string | null;
  createdAt: string;
  content: string;
}): string {
  return [
    "---",
    `role: ${args.role}`,
    `task: ${args.title}`,
    args.taskId ? `taskId: ${args.taskId}` : null,
    `createdAt: ${args.createdAt}`,
    "---",
    "",
    args.content,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

function parseFrontmatter(raw: string): {
  role?: string;
  task?: string;
  taskId?: string;
  createdAt?: string;
} {
  if (!raw.startsWith("---")) return {};
  const endIdx = raw.indexOf("---", 3);
  if (endIdx === -1) return {};
  const block = raw.slice(3, endIdx).trim();
  const out: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) out[key] = value;
  }
  return out as ReturnType<typeof parseFrontmatter>;
}
