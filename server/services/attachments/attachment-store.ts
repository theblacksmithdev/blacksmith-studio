import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { attachmentsDirFor } from "./attachment-path.js";
import { extOf } from "./mime.js";

export class AttachmentStore {
  /**
   * Write bytes under `<projectRoot>/.blacksmith/attachments/<bucket>/<uuid>.<ext>`
   * and return the absolute path that was written.
   */
  async write(
    projectRoot: string,
    conversationId: string | null,
    originalName: string,
    bytes: Uint8Array,
  ): Promise<string> {
    const dir = attachmentsDirFor(projectRoot, conversationId);
    await fs.mkdir(dir, { recursive: true });
    const ext = extOf(originalName);
    const filename = `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;
    const abs = path.join(dir, filename);
    await fs.writeFile(abs, bytes);
    return abs;
  }

  async read(absPath: string): Promise<Buffer> {
    return fs.readFile(absPath);
  }

  async remove(absPath: string): Promise<void> {
    try {
      await fs.unlink(absPath);
    } catch (err: any) {
      if (err?.code !== "ENOENT") throw err;
    }
  }

  async removeBucket(
    projectRoot: string,
    conversationId: string | null,
  ): Promise<void> {
    const dir = attachmentsDirFor(projectRoot, conversationId);
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (err: any) {
      if (err?.code !== "ENOENT") throw err;
    }
  }
}
