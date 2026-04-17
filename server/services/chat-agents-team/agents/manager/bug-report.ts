import type { AgentRole, AgentExecution } from "../types.js";
import { extractJsonStructure } from "../utils/json-extract.js";

/** Structured bug report produced by QA when it finds a major issue it can't fix */
export interface BugReport {
  severity: "major";
  file: string;
  function: string;
  description: string;
  expected: string;
  actual: string;
  suggestedRole: AgentRole;
}

/**
 * Extract a bug report from a QA agent's response text.
 * Returns null if no bug report was found (tests passed or QA fixed it).
 */
export function extractBugReport(execution: AgentExecution): BugReport | null {
  const text = execution.responseText;

  const marker = "BUG_REPORT:";
  const idx = text.indexOf(marker);
  if (idx === -1) return null;

  const afterMarker = text.slice(idx + marker.length).trim();

  const candidate = extractJsonStructure(afterMarker, "{");
  if (!candidate) return null;

  try {
    const parsed = JSON.parse(candidate);

    if (!parsed.description || !parsed.file) return null;

    return {
      severity: "major",
      file: parsed.file ?? "",
      function: parsed.function ?? "",
      description: parsed.description ?? "",
      expected: parsed.expected ?? "",
      actual: parsed.actual ?? "",
      suggestedRole: isValidRole(parsed.suggestedRole)
        ? parsed.suggestedRole
        : "backend-engineer",
    };
  } catch {
    return null;
  }
}

/**
 * Build a prompt for the developer to fix a bug reported by QA.
 */
export function buildBugFixPrompt(report: BugReport): string {
  return [
    `The QA engineer found a major bug that needs to be fixed.`,
    "",
    `**File:** ${report.file}`,
    report.function ? `**Function/Class:** ${report.function}` : "",
    `**Description:** ${report.description}`,
    `**Expected behavior:** ${report.expected}`,
    `**Actual behavior:** ${report.actual}`,
    "",
    "Instructions:",
    `- Open and read ${report.file} to understand the current code.`,
    "- Fix the bug described above.",
    "- Do NOT modify test files — the QA engineer handles tests.",
    "- After fixing, briefly explain what you changed and why.",
  ]
    .filter(Boolean)
    .join("\n");
}

const VALID_ROLES = new Set([
  "frontend-engineer",
  "backend-engineer",
  "fullstack-engineer",
  "database-engineer",
  "devops-engineer",
]);

function isValidRole(role: string): role is AgentRole {
  return VALID_ROLES.has(role);
}
