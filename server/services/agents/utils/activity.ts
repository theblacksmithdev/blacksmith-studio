import path from 'node:path'

/**
 * Translates raw tool_use events into human-readable activity descriptions.
 *
 * Write file_path -> "Creating user.py"
 * Edit  file_path -> "Editing views.py"
 * Read  file_path -> "Reading package.json"
 * Bash  command   -> "Running npm run test"
 * Glob  pattern   -> "Searching for .tsx files"
 * Grep  pattern   -> "Searching for 'useState'"
 */
export function describeToolUse(toolName: string, input: Record<string, unknown>): string {
  switch (toolName) {
    case 'Write': {
      const fp = input.file_path as string | undefined
      return fp ? `Creating ${filename(fp)}` : 'Creating file'
    }

    case 'Edit': {
      const fp = input.file_path as string | undefined
      return fp ? `Editing ${filename(fp)}` : 'Editing file'
    }

    case 'Read': {
      const fp = input.file_path as string | undefined
      return fp ? `Reading ${filename(fp)}` : 'Reading file'
    }

    case 'Bash': {
      const cmd = input.command as string | undefined
      if (!cmd) return 'Running command'
      const clean = cmd.trim().split('\n')[0]
      return `Running ${truncate(clean, 60)}`
    }

    case 'Glob': {
      const pattern = input.pattern as string | undefined
      return pattern ? `Searching for ${pattern} files` : 'Searching files'
    }

    case 'Grep': {
      const pattern = input.pattern as string | undefined
      return pattern ? `Searching for '${truncate(pattern, 40)}'` : 'Searching code'
    }

    case 'NotebookEdit':
      return 'Editing notebook'

    default:
      return `Using ${toolName}`
  }
}

/**
 * Extract a meaningful one-liner from the first chunk of agent text output.
 * Used when the agent starts responding before any tool calls (analysis/planning phase).
 */
export function describeMessageStart(content: string): string | null {
  // Skip if it's just whitespace or very short
  const trimmed = content.trim()
  if (trimmed.length < 10) return null

  // Try to get the first heading
  const headingMatch = trimmed.match(/^#+\s+(.+)/m)
  if (headingMatch) return truncate(headingMatch[1], 80)

  // Try the first sentence
  const firstLine = trimmed.split('\n')[0].trim()
  if (firstLine.length > 0) {
    // Skip markdown formatting artifacts
    if (firstLine.startsWith('```') || firstLine.startsWith('---')) return null
    return truncate(firstLine, 80)
  }

  return null
}

function filename(fp: string): string {
  return path.basename(fp)
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}
