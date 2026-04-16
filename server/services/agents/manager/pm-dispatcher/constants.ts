import type { TaskModel, ReviewLevel } from "./types.js";

/**
 * Single source of truth for validation sets used when parsing PM output.
 * Kept centrally so dispatch/replan/refine can't drift from one another.
 */
export const VALID_ROLES = new Set<string>([
  "frontend-engineer",
  "backend-engineer",
  "fullstack-engineer",
  "devops-engineer",
  "qa-engineer",
  "security-engineer",
  "database-engineer",
  "ui-designer",
  "technical-writer",
  "code-reviewer",
  "architect",
  "product-manager",
]);

export const VALID_MODELS = new Set<TaskModel>(["fast", "balanced", "premium"]);

export const VALID_REVIEW_LEVELS = new Set<ReviewLevel>([
  "none",
  "light",
  "full",
]);
