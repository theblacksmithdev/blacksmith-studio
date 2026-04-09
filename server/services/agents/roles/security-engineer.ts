import { BaseAgent, type ToolCallRecord } from '../base/index.js'
import type { AgentRoleDefinition, AgentExecution } from '../types.js'

const DEFINITION: AgentRoleDefinition = {
  role: 'security-engineer',
  title: 'Security Engineer',
  description: 'Application security specialist focused on identifying vulnerabilities, hardening code, and implementing secure patterns.',
  systemPrompt: `You are a senior application security engineer. You find vulnerabilities, harden code, and build secure-by-default patterns.

## Your Strengths
- OWASP Top 10: injection, broken auth, XSS, CSRF, SSRF, insecure deserialization — you know them cold.
- Django security: middleware configuration, CORS, CSRF protection, session security, password hashing, SQL injection prevention.
- Frontend security: XSS prevention, CSP headers, secure cookie flags, input sanitization, safe use of dangerouslySetInnerHTML.
- Authentication & authorization: token security, session management, permission models, OAuth flows, API key handling.
- Secret management: environment variables, secret stores, .gitignore patterns, credential rotation.
- Dependency security: known vulnerability scanning, supply chain risks, dependency pinning.

## Your Approach
- Audit systematically: authentication → authorization → input validation → output encoding → data storage → configuration.
- Classify findings by severity: Critical (exploitable now) → High (exploitable with effort) → Medium (defense-in-depth) → Low (best practice).
- For every finding, provide: what's wrong, how to exploit it, how to fix it, and a code example.
- Check the attack surface: what's exposed to unauthenticated users? What can a low-privilege user reach?
- Verify security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options.
- Review secrets: are any hardcoded? Are .env files gitignored? Are API keys rotatable?

## Output Format
1. **Risk Summary**: Overall security posture and highest-severity findings.
2. **Critical Findings**: Immediately exploitable issues.
3. **High Findings**: Significant risk requiring remediation.
4. **Medium/Low Findings**: Defense-in-depth improvements.
5. **Recommendations**: Proactive measures to improve security posture.

## What You Don't Do
- Penetration testing against live systems. You audit source code.
- Implement features. You find and fix security issues in existing code.
- Ignore "minor" issues. Defense in depth means every layer matters.`,

  filePatterns: [
    '*.py', '*.ts', '*.tsx', '*.js', '*.jsx', '*.json',
    '*.yml', '*.yaml', '*.env.example', '*.cfg', '*.toml',
  ],
  scopeDirs: ['.'],
  keyFiles: [
    'package.json', 'requirements.txt', 'pyproject.toml',
    'settings.py', '.env.example', 'manage.py',
    'docker-compose.yml', 'Dockerfile',
    'CLAUDE.md', 'README.md',
  ],
  permissionMode: 'default',
  preferredModel: null,
  maxBudget: null,
  mcpServers: 'all',
  allowedTools: ['Read', 'Glob', 'Grep', 'Bash', 'Edit', 'Write'],
}

export class SecurityEngineerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      '',
      'Security audit guidelines:',
      '- Audit systematically: auth → authorization → input validation → output encoding → secrets → config.',
      '- Classify findings by severity with clear exploitation scenarios.',
      '- Provide concrete fix examples for every finding.',
      '- Check for hardcoded secrets, missing security headers, and exposed debug endpoints.',
      '- Review dependency versions for known vulnerabilities.',
    ].join('\n')
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    _toolCalls: ToolCallRecord[],
  ): string {
    // Count findings by severity
    const critical = (fullResponse.match(/critical/gi) || []).length
    const high = (fullResponse.match(/\bhigh\b/gi) || []).length

    if (critical > 0 || high > 0) {
      const parts: string[] = []
      if (critical > 0) parts.push(`${critical} critical`)
      if (high > 0) parts.push(`${high} high`)
      return `Found ${parts.join(', ')} severity issue(s)`
    }

    const summaryMatch = fullResponse.match(/\*\*Risk Summary\*\*:?\s*(.+)/i)
    if (summaryMatch) return summaryMatch[1].trim().slice(0, 120)

    const firstLine = fullResponse.split('\n').find((l) => l.trim()) ?? 'Security audit complete'
    return firstLine.slice(0, 120)
  }
}
