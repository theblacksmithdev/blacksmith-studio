export { FrontendEngineerAgent } from './frontend-engineer.js'
export { BackendEngineerAgent } from './backend-engineer.js'
export { FullstackEngineerAgent } from './fullstack-engineer.js'
export { UiDesignerAgent } from './ui-designer.js'
export { CodeReviewerAgent } from './code-reviewer.js'
export { QaEngineerAgent } from './qa-engineer.js'
export { ArchitectAgent } from './architect.js'
export { DatabaseEngineerAgent } from './database-engineer.js'
export { DevOpsEngineerAgent } from './devops-engineer.js'
export { SecurityEngineerAgent } from './security-engineer.js'
export { TechnicalWriterAgent } from './technical-writer.js'
export { ProductManagerAgent } from './product-manager.js'

import { FrontendEngineerAgent } from './frontend-engineer.js'
import { BackendEngineerAgent } from './backend-engineer.js'
import { FullstackEngineerAgent } from './fullstack-engineer.js'
import { UiDesignerAgent } from './ui-designer.js'
import { CodeReviewerAgent } from './code-reviewer.js'
import { QaEngineerAgent } from './qa-engineer.js'
import { ArchitectAgent } from './architect.js'
import { DatabaseEngineerAgent } from './database-engineer.js'
import { DevOpsEngineerAgent } from './devops-engineer.js'
import { SecurityEngineerAgent } from './security-engineer.js'
import { TechnicalWriterAgent } from './technical-writer.js'
import { ProductManagerAgent } from './product-manager.js'
import type { AgentRole } from '../types.js'
import type { BaseAgent } from '../base-agent.js'

/** Registry of all available agent roles. Instantiates one agent per role. */
export function createAgentRegistry(): Map<AgentRole, BaseAgent> {
  const registry = new Map<AgentRole, BaseAgent>()

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
  ]

  for (const agent of agents) {
    registry.set(agent.role, agent)
  }

  return registry
}
