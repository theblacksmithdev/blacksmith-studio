import crypto from "node:crypto";
import fs from "node:fs/promises";
import type { ProjectManager } from "../projects.js";
import { AttachmentStore } from "./attachment-store.js";
import { kindFor, mimeFor } from "./mime.js";
import { relativeToProject } from "./attachment-path.js";
import type { AttachmentRecord, SaveAttachmentInput } from "./types.js";

const MAX_BYTES = 20 * 1024 * 1024;

export class AttachmentService {
  private readonly store: AttachmentStore;

  constructor(
    private readonly projects: ProjectManager,
    store?: AttachmentStore,
  ) {
    this.store = store ?? new AttachmentStore();
  }

  async save(input: SaveAttachmentInput): Promise<AttachmentRecord> {
    const project = this.projects.get(input.projectId);
    if (!project) throw new Error("Project not found");

    const bytes =
      input.bytes instanceof Uint8Array
        ? input.bytes
        : new Uint8Array(input.bytes);

    if (bytes.byteLength === 0) throw new Error("Attachment is empty");
    if (bytes.byteLength > MAX_BYTES) {
      throw new Error(
        `Attachment exceeds limit (${Math.round(MAX_BYTES / 1024 / 1024)}MB)`,
      );
    }

    const conversationId = input.conversationId ?? null;
    const abs = await this.store.write(
      project.path,
      conversationId,
      input.name,
      bytes,
    );

    return {
      id: crypto.randomUUID(),
      name: input.name,
      kind: kindFor(input.name),
      mime: mimeFor(input.name),
      size: bytes.byteLength,
      absPath: abs,
      relPath: relativeToProject(project.path, abs),
      conversationId,
      createdAt: new Date().toISOString(),
    };
  }

  async read(
    projectId: string,
    absPath: string,
  ): Promise<{ bytes: Buffer; mime: string; name: string }> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error("Project not found");
    if (!absPath.startsWith(project.path)) {
      throw new Error("Attachment path is outside the project");
    }
    const bytes = await this.store.read(absPath);
    const name = absPath.split(/[/\\]/).pop() ?? absPath;
    return { bytes, mime: mimeFor(name), name };
  }

  async remove(projectId: string, absPath: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error("Project not found");
    if (!absPath.startsWith(project.path)) {
      throw new Error("Attachment path is outside the project");
    }
    await this.store.remove(absPath);
  }

  async removeConversation(
    projectId: string,
    conversationId: string,
  ): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) return;
    await this.store.removeBucket(project.path, conversationId);
  }

  async exists(absPath: string): Promise<boolean> {
    try {
      await fs.access(absPath);
      return true;
    } catch {
      return false;
    }
  }

  async assertInProject(projectId: string, absPath: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error("Project not found");
    if (!absPath.startsWith(project.path)) {
      throw new Error("Attachment path is outside the project");
    }
  }
}
