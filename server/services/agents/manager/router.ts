import type { AgentRole } from '../types.js'
import type { BaseAgent } from '../base/index.js'

/**
 * Routing rules that map keywords/patterns to agent roles.
 * Ordered by specificity — first match wins on score.
 */
const ROUTING_RULES: { patterns: RegExp[]; role: AgentRole }[] = [
  {
    patterns: [/security/i, /vulnerabilit/i, /owasp/i, /xss/i, /csrf/i, /injection/i, /auth.*bypass/i, /penetration/i, /hardening/i],
    role: 'security-engineer',
  },
  {
    patterns: [/review/i, /code review/i, /pull request/i, /\bPR\b/, /audit.*code/i],
    role: 'code-reviewer',
  },
  {
    patterns: [/\btest/i, /\bspec\b/i, /coverage/i, /e2e/i, /integration test/i, /unit test/i, /pytest/i, /vitest/i, /jest/i],
    role: 'qa-engineer',
  },
  {
    patterns: [/docker/i, /deploy/i, /ci[\s/]cd/i, /pipeline/i, /kubernetes/i, /k8s/i, /terraform/i, /github.?action/i, /infra/i, /nginx/i],
    role: 'devops-engineer',
  },
  {
    patterns: [/migration/i, /\bmodel\b.*field/i, /schema/i, /index.*query/i, /query.*optim/i, /database/i, /\bsql\b/i, /foreign.?key/i],
    role: 'database-engineer',
  },
  {
    patterns: [/architect/i, /system.?design/i, /trade.?off/i, /refactor.*structure/i, /module.*boundar/i, /adr/i],
    role: 'architect',
  },
  {
    patterns: [/user.?stor/i, /acceptance.?criteria/i, /product.?req/i, /\bprd\b/i, /feature.?spec/i, /task.?break/i, /mvp/i],
    role: 'product-manager',
  },
  {
    patterns: [/document/i, /readme/i, /\bdocs?\b/i, /changelog/i, /api.?doc/i, /jsdoc/i, /docstring/i],
    role: 'technical-writer',
  },
  {
    patterns: [/design/i, /\bui\b/i, /\bux\b/i, /styling/i, /animation/i, /layout/i, /responsive/i, /theme/i, /color/i, /spacing/i, /accessibility/i, /a11y/i],
    role: 'ui-designer',
  },
  {
    patterns: [/django/i, /endpoint/i, /serializer/i, /\bapi\b/i, /view.*class/i, /middleware/i, /celery/i, /backend/i, /python/i],
    role: 'backend-engineer',
  },
  {
    patterns: [/react/i, /component/i, /hook/i, /\bstate\b.*manag/i, /zustand/i, /redux/i, /\bcss\b/i, /vite/i, /webpack/i, /frontend/i, /typescript/i],
    role: 'frontend-engineer',
  },
]

export interface RouteResult {
  role: AgentRole | null
  confidence: 'high' | 'medium' | 'low'
  /** When true, the prompt should go through PM dispatch for task decomposition */
  needsDispatch: boolean
}

/**
 * Analyze a prompt and determine routing.
 *
 * - High confidence (2+ keyword matches or explicit @mention): direct to that role.
 * - Medium confidence (1 match): direct to that role.
 * - Low confidence (no match): needs PM dispatch — the prompt is ambiguous or multi-scope.
 */
export function routePrompt(
  prompt: string,
  registry: Map<AgentRole, BaseAgent>,
): RouteResult {
  const lower = prompt.toLowerCase()

  // Explicit role mention: "as a frontend engineer..." or "@frontend-engineer"
  for (const [role, agent] of registry) {
    const title = agent.title.toLowerCase()
    if (lower.includes(`as a ${title}`) || lower.includes(`@${role}`)) {
      return { role, confidence: 'high', needsDispatch: false }
    }
  }

  // Pattern-based scoring
  let bestRole: AgentRole | null = null
  let bestScore = 0
  let secondBestScore = 0

  for (const rule of ROUTING_RULES) {
    const score = rule.patterns.reduce((n, re) => n + (re.test(prompt) ? 1 : 0), 0)
    if (score > bestScore) {
      secondBestScore = bestScore
      bestScore = score
      bestRole = rule.role
    } else if (score > secondBestScore) {
      secondBestScore = score
    }
  }

  // If two roles score equally high, the prompt spans multiple domains → PM dispatch
  if (bestScore > 0 && secondBestScore === bestScore) {
    return { role: null, confidence: 'low', needsDispatch: true }
  }

  if (bestRole && bestScore >= 2) return { role: bestRole, confidence: 'high', needsDispatch: false }
  if (bestRole && bestScore === 1) return { role: bestRole, confidence: 'medium', needsDispatch: false }

  // No match → PM dispatch (not fullstack-engineer)
  return { role: null, confidence: 'low', needsDispatch: true }
}
