import { useMemo } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { FileCode2, Plus, Minus, X, GitCompareArrows } from 'lucide-react'
import { useGitDiff } from '@/hooks/use-git'
import { Text, Badge, IconButton, Tooltip, spacing, radii } from '@/components/shared/ui'
import { FileIcon } from '@/pages/files/components/explorer/utils/file-icon'

/* ── Types ── */

interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'header'
  content: string
  oldNum: number | null
  newNum: number | null
}

/* ── Parser ── */

function parseDiff(raw: string): { lines: DiffLine[]; additions: number; deletions: number } {
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

/* ── Styles ── */

const LINE_HEIGHT = 20
const FONT = "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace"

const lineNumStyle: React.CSSProperties = {
  width: '44px',
  minWidth: '44px',
  padding: '0 8px',
  textAlign: 'right',
  fontSize: '11px',
  userSelect: 'none',
  verticalAlign: 'top',
  lineHeight: `${LINE_HEIGHT}px`,
}

function getLineStyles(type: DiffLine['type']) {
  switch (type) {
    case 'add': return {
      bg: 'rgba(46, 160, 67, 0.08)',
      numColor: 'rgba(46, 160, 67, 0.6)',
      gutterColor: 'var(--studio-green)',
      textColor: 'var(--studio-text-primary)',
    }
    case 'remove': return {
      bg: 'rgba(248, 81, 73, 0.08)',
      numColor: 'rgba(248, 81, 73, 0.6)',
      gutterColor: 'var(--studio-error)',
      textColor: 'var(--studio-text-primary)',
    }
    case 'context': return {
      bg: 'transparent',
      numColor: 'var(--studio-text-muted)',
      gutterColor: 'transparent',
      textColor: 'var(--studio-text-tertiary)',
    }
    case 'header': return {
      bg: 'var(--studio-bg-surface)',
      numColor: 'var(--studio-text-muted)',
      gutterColor: 'transparent',
      textColor: 'var(--studio-text-muted)',
    }
  }
}

/* ── Shell ── */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" css={{
      height: '100%',
      background: 'var(--studio-bg-main)',
      overflow: 'hidden',
    }}>
      {children}
    </Flex>
  )
}

/* ── Component ── */

interface Props {
  filePath?: string
  onClose?: () => void
}

export function DiffViewer({ filePath, onClose }: Props) {
  const { data: diff, isLoading } = useGitDiff(filePath)

  const parsed = useMemo(() => {
    if (!diff) return null
    return parseDiff(diff)
  }, [diff])

  // No file selected
  if (!filePath) {
    return (
      <Shell>
        <Flex direction="column" align="center" justify="center" gap={spacing.md} css={{ flex: 1 }}>
          <Box css={{
            width: '48px',
            height: '48px',
            borderRadius: radii.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--studio-bg-surface)',
            border: '1px solid var(--studio-border)',
            color: 'var(--studio-text-muted)',
          }}>
            <GitCompareArrows size={22} />
          </Box>
          <Flex direction="column" align="center" gap={spacing.xs}>
            <Text variant="subtitle">No file selected</Text>
            <Text variant="bodySmall" color="muted">Click a changed file on the left to compare versions</Text>
          </Flex>
        </Flex>
      </Shell>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <Shell>
        <Flex align="center" justify="center" css={{ flex: 1 }}>
          <Text variant="caption" color="muted">Loading diff...</Text>
        </Flex>
      </Shell>
    )
  }

  // No diff content
  if (!parsed || parsed.lines.length === 0) {
    return (
      <Shell>
        <Flex align="center" gap={spacing.sm} css={{
          padding: `${spacing.xs} ${spacing.md}`,
          borderBottom: '1px solid var(--studio-border)',
          background: 'var(--studio-bg-sidebar)',
          flexShrink: 0,
          minHeight: '36px',
        }}>
          <FileIcon name={filePath.split('/').pop() || filePath} size={14} />
          <Text variant="bodySmall" css={{ fontFamily: FONT, fontSize: '12px', flex: 1, color: 'var(--studio-text-secondary)' }}>
            {filePath}
          </Text>
          {onClose && (
            <Tooltip content="Close diff">
              <IconButton variant="ghost" size="xs" onClick={onClose} aria-label="Close diff"><X /></IconButton>
            </Tooltip>
          )}
        </Flex>
        <Flex direction="column" align="center" justify="center" gap={spacing.sm} css={{ flex: 1 }}>
          <FileCode2 size={20} style={{ color: 'var(--studio-text-muted)', opacity: 0.4 }} />
          <Text variant="bodySmall" color="muted">No changes to display</Text>
        </Flex>
      </Shell>
    )
  }

  const fileName = filePath.split('/').pop() || filePath

  return (
    <Shell>
      {/* ── Header ── */}
      <Flex align="center" gap={spacing.sm} css={{
        padding: `${spacing.xs} ${spacing.sm} ${spacing.xs} ${spacing.md}`,
        borderBottom: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-sidebar)',
        flexShrink: 0,
        minHeight: '36px',
      }}>
        <FileIcon name={fileName} size={14} />
        <Text variant="bodySmall" css={{
          fontFamily: FONT,
          fontSize: '12px',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'var(--studio-text-secondary)',
        }}>
          {filePath}
        </Text>

        {parsed.additions > 0 && (
          <Badge variant="default" size="sm" css={{ color: 'var(--studio-green)', gap: '2px', fontFamily: FONT, fontSize: '11px', fontWeight: 500 }}>
            <Plus size={10} />{parsed.additions}
          </Badge>
        )}
        {parsed.deletions > 0 && (
          <Badge variant="default" size="sm" css={{ color: 'var(--studio-error)', gap: '2px', fontFamily: FONT, fontSize: '11px', fontWeight: 500 }}>
            <Minus size={10} />{parsed.deletions}
          </Badge>
        )}

        {onClose && (
          <Tooltip content="Close diff">
            <IconButton variant="ghost" size="xs" onClick={onClose} aria-label="Close diff"><X /></IconButton>
          </Tooltip>
        )}
      </Flex>

      {/* ── Diff table ── */}
      <Box css={{
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '6px', height: '6px' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(128,128,128,0.15)', borderRadius: '3px' },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(128,128,128,0.25)' },
      }}>
        <Box
          as="table"
          css={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: FONT,
            fontSize: '12px',
            lineHeight: `${LINE_HEIGHT}px`,
          }}
        >
          <tbody>
            {parsed.lines.map((line, i) => {
              const s = getLineStyles(line.type)

              if (line.type === 'header') {
                return (
                  <tr key={i}>
                    <td
                      colSpan={4}
                      style={{
                        padding: `6px ${spacing.md}`,
                        background: s.bg,
                        color: s.textColor,
                        fontSize: '11px',
                        fontWeight: 500,
                        borderTop: i > 0 ? '1px solid var(--studio-border)' : undefined,
                        borderBottom: '1px solid var(--studio-border)',
                      }}
                    >
                      {line.content}
                    </td>
                  </tr>
                )
              }

              return (
                <tr
                  key={i}
                  style={{ background: s.bg }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                >
                  <td style={{ ...lineNumStyle, color: s.numColor, borderRight: '1px solid var(--studio-border)' }}>
                    {line.oldNum ?? ''}
                  </td>
                  <td style={{ ...lineNumStyle, color: s.numColor }}>
                    {line.newNum ?? ''}
                  </td>
                  <td style={{
                    width: '18px', minWidth: '18px', textAlign: 'center',
                    color: s.gutterColor, fontWeight: 700, fontSize: '11px',
                    userSelect: 'none', verticalAlign: 'top',
                    lineHeight: `${LINE_HEIGHT}px`,
                    borderRight: '1px solid var(--studio-border)',
                  }}>
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '\u2212' : ''}
                  </td>
                  <td style={{
                    padding: `0 ${spacing.md} 0 ${spacing.sm}`,
                    whiteSpace: 'pre',
                    color: s.textColor,
                    lineHeight: `${LINE_HEIGHT}px`,
                  }}>
                    {line.content || ' '}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Box>
      </Box>
    </Shell>
  )
}
