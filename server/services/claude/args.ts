import { STUDIO_SYSTEM_PROMPT } from './system-prompt.js'

export interface ClaudeArgsOptions {
  sessionId: string
  prompt: string
  isResume?: boolean
  projectContext?: string
  model?: string
  maxBudget?: number | null
  permissionMode?: string
  customInstructions?: string
  mcpConfigPath?: string
}

/**
 * Build the CLI arguments for a Claude Code subprocess.
 * Accepts optional settings overrides for model, budget, permissions, and custom instructions.
 */
export function buildClaudeArgs(options: ClaudeArgsOptions): string[] {
  const {
    sessionId,
    prompt,
    isResume = false,
    projectContext,
    model,
    maxBudget,
    permissionMode = 'bypassPermissions',
    customInstructions,
    mcpConfigPath,
  } = options

  // For first message, prepend project context so Claude doesn't need to scan
  const effectivePrompt = !isResume && projectContext
    ? `Here is the current project context for reference:\n\n${projectContext}\n\n---\n\nUser request: ${prompt}`
    : prompt

  const systemPrompt = customInstructions
    ? `${STUDIO_SYSTEM_PROMPT}\n\n## User's Custom Instructions\n\n${customInstructions}`
    : STUDIO_SYSTEM_PROMPT

  const args = [
    '-p', effectivePrompt,
    '--output-format', 'stream-json',
    '--verbose',
    '--permission-mode', permissionMode,
    '--include-partial-messages',
    '--append-system-prompt', systemPrompt,
  ]

  // First message: create session with --session-id
  // Follow-up messages: resume with --resume
  if (isResume) {
    args.push('--resume', sessionId)
  } else {
    args.push('--session-id', sessionId)
  }

  if (model) {
    args.push('--model', model)
  }

  if (maxBudget != null && maxBudget > 0) {
    args.push('--max-budget-usd', String(maxBudget))
  }

  if (mcpConfigPath) {
    args.push('--mcp-config', mcpConfigPath)
  }

  return args
}
