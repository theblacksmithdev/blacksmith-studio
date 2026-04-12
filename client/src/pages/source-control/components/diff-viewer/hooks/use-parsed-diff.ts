import { useMemo } from 'react'
import { useGitDiff } from '@/hooks/use-git'

export interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'header'
  content: string
  oldNum: number | null
  newNum: number | null
}

export interface ParsedDiff {
  lines: DiffLine[]
  additions: number
  deletions: number
}

function parseDiff(raw: string): ParsedDiff {
  const rawLines = raw.split('\n')
  const lines: DiffLine[] = []
  let oldNum = 0
  let newNum = 0
  let additions = 0
  let deletions = 0

  for (const line of rawLines) {
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)/)
      if (match) {
        oldNum = parseInt(match[1], 10)
        newNum = parseInt(match[2], 10)
      }
      const label = line.replace(/^@@.*?@@\s*/, '') || line
      lines.push({ type: 'header', content: label, oldNum: null, newNum: null })
      continue
    }

    if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('---') || line.startsWith('+++')) {
      continue
    }

    if (line.startsWith('+')) {
      additions++
      lines.push({ type: 'add', content: line.slice(1), oldNum: null, newNum: newNum++ })
    } else if (line.startsWith('-')) {
      deletions++
      lines.push({ type: 'remove', content: line.slice(1), oldNum: oldNum++, newNum: null })
    } else {
      lines.push({ type: 'context', content: line.startsWith(' ') ? line.slice(1) : line, oldNum: oldNum++, newNum: newNum++ })
    }
  }

  return { lines, additions, deletions }
}

export function useParsedDiff(filePath?: string) {
  const { data: diff, isLoading } = useGitDiff(filePath)

  const parsed = useMemo(() => {
    if (!diff) return null
    return parseDiff(diff)
  }, [diff])

  return { parsed, isLoading }
}
