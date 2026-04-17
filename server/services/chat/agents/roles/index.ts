export { FrontendEngineerAgent } from "./frontend-engineer/index.js";
export { BackendEngineerAgent } from "./backend-engineer/index.js";
export { FullstackEngineerAgent } from "./fullstack-engineer/index.js";
export { UiDesignerAgent } from "./ui-designer/index.js";
export { CodeReviewerAgent } from "./code-reviewer/index.js";
export { QaEngineerAgent } from "./qa-engineer/index.js";
export { ArchitectAgent } from "./architect/index.js";
export { DatabaseEngineerAgent } from "./database-engineer/index.js";
export { DevOpsEngineerAgent } from "./devops-engineer/index.js";
export { SecurityEngineerAgent } from "./security-engineer/index.js";
export { TechnicalWriterAgent } from "./technical-writer/index.js";
export { ProductManagerAgent } from "./product-manager/index.js";
export { GeneralistAgent } from "./generalist/index.js";

import { FrontendEngineerAgent } from "./frontend-engineer/index.js";
import { BackendEngineerAgent } from "./backend-engineer/index.js";
import { FullstackEngineerAgent } from "./fullstack-engineer/index.js";
import { UiDesignerAgent } from "./ui-designer/index.js";
import { CodeReviewerAgent } from "./code-reviewer/index.js";
import { QaEngineerAgent } from "./qa-engineer/index.js";
import { ArchitectAgent } from "./architect/index.js";
import { DatabaseEngineerAgent } from "./database-engineer/index.js";
import { DevOpsEngineerAgent } from "./devops-engineer/index.js";
import { SecurityEngineerAgent } from "./security-engineer/index.js";
import { TechnicalWriterAgent } from "./technical-writer/index.js";
import { ProductManagerAgent } from "./product-manager/index.js";
import { GeneralistAgent } from "./generalist/index.js";
import type { AgentRole, AgentTeam, AgentTeamDefinition } from "../types.js";
import { AGENT_TEAMS } from "../types.js";
import type { BaseAgent } from "../base/index.js";

/**
 * Registry of the specialised team agents available to the multi-agent
 * workflow. The PM routes user requests to these roles.
 *
 * The generalist role is intentionally excluded — it belongs to the
 * single-agent chat and must never be a PM dispatch target. Consumers
 * of the multi-agent registry should not see it.
 */
export function createAgentRegistry(): Map<AgentRole, BaseAgent> {
  const registry = new Map<AgentRole, BaseAgent>();

  const agents: BaseAgent[] = [
    new FrontendEngineerAgent(),
    new BackendEngineerAgent(),
    new FullstackEngineerAgent(),
    new UiDesignerAgent(),
    new CodeReviewerAgent(),
    new QaEngineerAgent(),
    new ArchitectAgent(),
    new DatabaseEngineerAgent(),
    new DevOpsEngineerAgent(),
    new SecurityEngineerAgent(),
    new TechnicalWriterAgent(),
    new ProductManagerAgent(),
  ];

  for (const agent of agents) {
    registry.set(agent.role, agent);
  }

  return registry;
}

/** Get the team definition for a given role */
export function getTeamForRole(
  role: AgentRole,
): AgentTeamDefinition | undefined {
  return AGENT_TEAMS.find((t) => t.roles.includes(role));
}

/** Get all roles belonging to a team */
export function getTeamRoles(team: AgentTeam): AgentRole[] {
  return AGENT_TEAMS.find((t) => t.team === team)?.roles ?? [];
}
