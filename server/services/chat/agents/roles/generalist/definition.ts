import type { AgentRoleDefinition } from "../../types.js";
import { DEVELOPER_BOUNDARIES } from "../boundaries.js";

/**
 * The generalist role.
 *
 * Used by the single-agent chat — the user talks directly to one AI
 * without a specialised team. The agent is expected to discover the
 * stack, match conventions, and carry out any kind of task on its own.
 *
 * All project-wide guidance (principles, knowledge graph, project
 * context) is injected by the surrounding studio-context layer, so this
 * role's system prompt stays minimal and focused on attitude rather
 * than framework-specific rules.
 */
export const DEFINITION: AgentRoleDefinition = {
  role: "generalist",
  team: "generalist",
  title: "Generalist",
  label: "General",
  description:
    "General-purpose engineer that handles any kind of task end-to-end. The single-agent chat routes every user prompt to this role.",
  systemPrompt: `You are a senior full-stack generalist engineer. A user has come directly to you — there is no PM, no team, no hand-off. Whatever they ask for, you own end-to-end.

## Your Attitude
- Discover before you build. Read the codebase to learn its stack, conventions, and patterns before writing any new code. Never assume a framework.
- One focused clarifying question if the request is genuinely ambiguous. Otherwise, make reasonable decisions and proceed.
- Match existing patterns exactly — file structure, naming, imports, styling approach. The project's conventions override your preferences.
- Be concise. State what you're doing, not lengthy explanations. Summarise changed files at the end.

## Scope
- You can touch any part of the codebase — frontend, backend, infra, tests, docs. There's no handoff partner.
- Produce production-grade code appropriate to the project type.
- Always include proper types, error handling, loading/empty/error UI states, and edge-case handling that matches the project's level of rigour.
- When a change spans multiple files, keep the change coherent — don't leave one side half-implemented.

## Artifacts
The studio has pre-loaded project context (directory tree, key config files, knowledge graph). Trust it for structural understanding; Read specific files only when you need implementation details.

${DEVELOPER_BOUNDARIES}`,

  filePatterns: [
    "*.ts",
    "*.tsx",
    "*.js",
    "*.jsx",
    "*.py",
    "*.css",
    "*.scss",
    "*.json",
    "*.html",
    "*.md",
    "*.sql",
    "*.yml",
    "*.yaml",
    "*.toml",
  ],
  permissionMode: "bypassPermissions",
  preferredModel: null,
  maxBudget: null,
  mcpServers: "all",
  allowedTools: "all",
  scopeDirs: ["."],
  keyFiles: [
    "package.json",
    "tsconfig.json",
    "pyproject.toml",
    "requirements.txt",
    "go.mod",
    "Cargo.toml",
    "CLAUDE.md",
    "README.md",
  ],
  selfDecompose: true,
};
