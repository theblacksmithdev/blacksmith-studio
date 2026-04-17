import type { SimpleGit } from "simple-git";
import { AiModelTier } from "../../ai/types.js";
import type { Ai } from "../../ai/ai.js";
import {
  COMMIT_MESSAGE_TIMEOUT_MS,
  COMMIT_SYSTEM_PROMPT,
  MAX_AI_DIFF_SIZE,
} from "../constants.js";
import type { GitClient } from "../git-client.js";

/**
 * Produces a commit message from the current diff.
 *
 * Single Responsibility: turning "what changed" into a one-line message.
 * Dependency Inversion: takes the Ai router through the method call so
 * the same service can run with or without an AI present — without an Ai
 * it falls back to a mechanical summary from file-status counts.
 */
export class CommitMessageGenerator {
  constructor(private readonly client: GitClient) {}

  async generate(projectPath: string, ai?: Ai): Promise<string> {
    const git = this.client.of(projectPath);
    const diff = await this.collectDiff(git);

    if (!diff) return this.mechanicalMessage(git);

    if (ai) {
      const aiMessage = await this.aiMessage(ai, diff, projectPath);
      if (aiMessage) return aiMessage;
    }

    return this.mechanicalMessage(git);
  }

  private async aiMessage(
    ai: Ai,
    diff: string,
    projectPath: string,
  ): Promise<string | null> {
    try {
      const result = await ai.complete({
        prompt: diff,
        systemPrompt: COMMIT_SYSTEM_PROMPT,
        model: AiModelTier.Fast,
        cwd: projectPath,
        timeout: COMMIT_MESSAGE_TIMEOUT_MS,
      });

      if (!result) return null;

      const line = result
        .replace(/^["'`]+|["'`]+$/g, "")
        .split("\n")[0]
        .trim();

      return line.length > 0 && line.length < 150 ? line : null;
    } catch {
      return null;
    }
  }

  private async collectDiff(git: SimpleGit): Promise<string> {
    try {
      const [staged, unstaged] = await Promise.all([
        git.diff(["--cached"]),
        git.diff(),
      ]);
      const combined = [staged, unstaged].filter(Boolean).join("\n");
      if (!combined) return "";
      return combined.length > MAX_AI_DIFF_SIZE
        ? combined.slice(0, MAX_AI_DIFF_SIZE) + "\n...(truncated)"
        : combined;
    } catch {
      return "";
    }
  }

  /** Build a message from file-status counts when the AI is unavailable. */
  private async mechanicalMessage(git: SimpleGit): Promise<string> {
    try {
      const status = await git.status();
      const segments: string[] = [];

      const pairs: { label: string; n: number }[] = [
        {
          label: "add",
          n: status.files.filter(
            (f) => f.working_dir === "?" || f.index === "A",
          ).length,
        },
        {
          label: "update",
          n: status.files.filter(
            (f) => f.working_dir === "M" || f.index === "M",
          ).length,
        },
        {
          label: "remove",
          n: status.files.filter(
            (f) => f.working_dir === "D" || f.index === "D",
          ).length,
        },
      ];

      for (const { label, n } of pairs) {
        if (n > 0) segments.push(`${label} ${n} file${n > 1 ? "s" : ""}`);
      }

      return segments.join(", ") || "save changes";
    } catch {
      return "save changes";
    }
  }
}
