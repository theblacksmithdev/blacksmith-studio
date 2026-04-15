import { execSync } from "node:child_process";
import {
  BaseAgent,
  type AgentExecuteOptions,
  type ToolCallRecord,
} from "../../base/index.js";
import type { AgentRoleDefinition, AgentExecution } from "../../types.js";
import { DEFINITION } from "./definition.js";

export class CodeReviewerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION;
  }

  protected buildExecutionContext(options: AgentExecuteOptions): string {
    // Get the actual diff of uncommitted + recent changes
    // The quality gate passes changedFiles in the prompt, but this catches
    // cases where the reviewer is called directly (not via quality gate)
    try {
      // Uncommitted changes (staged + unstaged)
      const uncommitted = execSync("git diff --stat --no-color", {
        cwd: options.projectRoot,
        encoding: "utf-8",
        timeout: 5000,
      }).trim();

      const staged = execSync("git diff --cached --stat --no-color", {
        cwd: options.projectRoot,
        encoding: "utf-8",
        timeout: 5000,
      }).trim();

      // Recent commit (in case agents committed their work)
      const recentCommit = execSync(
        "git log -1 --oneline --no-color 2>/dev/null",
        {
          cwd: options.projectRoot,
          encoding: "utf-8",
          timeout: 5000,
        },
      ).trim();

      const parts: string[] = [];

      if (staged) parts.push(`### Staged Changes\n\`\`\`\n${staged}\n\`\`\``);
      if (uncommitted)
        parts.push(`### Unstaged Changes\n\`\`\`\n${uncommitted}\n\`\`\``);
      if (recentCommit) parts.push(`### Latest Commit\n${recentCommit}`);

      if (parts.length > 0) {
        return `## Working Tree Status\n${parts.join("\n\n")}`;
      }
    } catch {
      /* no git */
    }

    return "";
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      "",
      "Review instructions:",
      "- ONLY review the files listed in the changes above. Do not review unrelated code.",
      "- Read each changed file completely. Understand what was added or modified.",
      "- Check for: correctness, security issues, performance, adherence to project conventions.",
      "- Categorize issues: Critical (must fix) > Improvements (should fix) > Suggestions (nice to have).",
      "- Be specific — include file paths, line numbers, and concrete fix descriptions.",
      '- If everything looks good, start your response with "APPROVED:" followed by a brief summary.',
      '- If there are issues, start your response with "CHANGES NEEDED:" followed by the issues.',
      "- Do NOT modify any files. This is a read-only review.",
    ].join("\n");
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    _toolCalls: ToolCallRecord[],
  ): string {
    const summaryMatch = fullResponse.match(/\*\*Summary\*\*:?\s*(.+)/i);
    if (summaryMatch) return summaryMatch[1].trim().slice(0, 120);

    if (fullResponse.toLowerCase().startsWith("approved:"))
      return "Approved: " + fullResponse.slice(9).trim().slice(0, 100);
    if (fullResponse.toLowerCase().startsWith("changes needed:"))
      return "Changes needed: " + fullResponse.slice(15).trim().slice(0, 100);

    const firstLine =
      fullResponse.split("\n").find((l) => l.trim()) ?? "Review complete";
    return firstLine.slice(0, 120);
  }
}
