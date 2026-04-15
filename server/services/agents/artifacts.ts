import fs from "node:fs";
import path from "node:path";
import type { AgentRole } from "./types.js";

const ARTIFACTS_DIR = ".blacksmith/artifacts";

/**
 * ArtifactManager — manages persisted agent output artifacts.
 *
 * When an agent completes a task, its output is written to a file under
 * `.blacksmith/artifacts/{role}/`. Dependent tasks receive the artifact
 * file path so they can read the full context with their normal file tools.
 *
 * Directory structure:
 *   .blacksmith/artifacts/
 *     ui-designer/
 *       a3f2b1c0-card-redesign.md
 *     architect/
 *       c9f1a3b2-auth-system-design.md
 *     backend-engineer/
 *       d2e5f8a0-user-api-summary.md
 */
export class ArtifactManager {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /** Get the absolute path to the artifacts root */
  private get artifactsRoot(): string {
    return path.join(this.projectRoot, ARTIFACTS_DIR);
  }

  /** Get the absolute path to a role's artifact directory */
  private roleDir(role: AgentRole): string {
    return path.join(this.artifactsRoot, role);
  }

  /** Ensure the role's artifact directory exists */
  private ensureRoleDir(role: AgentRole): void {
    const dir = this.roleDir(role);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Generate a slug from a task title for human-readable filenames.
   * e.g. "Design Card Component Layout" → "design-card-component-layout"
   */
  private slugify(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "artifact"
    );
  }

  /**
   * Write an agent's output as an artifact file.
   *
   * @param role     The agent role that produced this output
   * @param taskId   The dispatch task ID (used as unique prefix)
   * @param title    The task title (used to generate a readable slug)
   * @param content  The agent's full response text
   * @returns The project-relative path to the artifact file (for referencing in prompts)
   */
  writeArtifact(
    role: AgentRole,
    taskId: string,
    title: string,
    content: string,
  ): string {
    this.ensureRoleDir(role);

    // Use first 8 chars of taskId as unique prefix
    const idPrefix = taskId.slice(0, 8);
    const slug = this.slugify(title);
    const filename = `${idPrefix}-${slug}.md`;

    const absPath = path.join(this.roleDir(role), filename);
    const relPath = path.join(ARTIFACTS_DIR, role, filename);

    // Build artifact file with frontmatter
    const artifact = [
      "---",
      `role: ${role}`,
      `task: ${title}`,
      `taskId: ${taskId}`,
      `createdAt: ${new Date().toISOString()}`,
      "---",
      "",
      content,
    ].join("\n");

    fs.writeFileSync(absPath, artifact, "utf-8");

    return relPath;
  }

  /**
   * Read an artifact file and return its content (without frontmatter).
   */
  readArtifact(relPath: string): string | null {
    const absPath = path.join(this.projectRoot, relPath);
    if (!fs.existsSync(absPath)) return null;

    const raw = fs.readFileSync(absPath, "utf-8");

    // Strip frontmatter if present
    if (raw.startsWith("---")) {
      const endIdx = raw.indexOf("---", 3);
      if (endIdx !== -1) {
        return raw.slice(endIdx + 3).trim();
      }
    }

    return raw.trim();
  }

  /**
   * List all artifact files for a given role.
   */
  listArtifacts(role: AgentRole): string[] {
    const dir = this.roleDir(role);
    if (!fs.existsSync(dir)) return [];

    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => path.join(ARTIFACTS_DIR, role, f));
  }

  /**
   * Remove all artifacts for a project (e.g. on cleanup).
   */
  clearAll(): void {
    if (fs.existsSync(this.artifactsRoot)) {
      fs.rmSync(this.artifactsRoot, { recursive: true, force: true });
    }
  }

  /**
   * Remove artifacts for a specific role.
   */
  clearRole(role: AgentRole): void {
    const dir = this.roleDir(role);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  /**
   * Ensure .blacksmith/artifacts is in .gitignore.
   */
  ensureGitignore(): void {
    const gitignorePath = path.join(this.projectRoot, ".gitignore");
    const entry = ".blacksmith/";

    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, "utf-8");
      if (content.includes(entry)) return;
      fs.appendFileSync(
        gitignorePath,
        `\n# Blacksmith Studio artifacts\n${entry}\n`,
      );
    } else {
      fs.writeFileSync(
        gitignorePath,
        `# Blacksmith Studio artifacts\n${entry}\n`,
      );
    }
  }
}
