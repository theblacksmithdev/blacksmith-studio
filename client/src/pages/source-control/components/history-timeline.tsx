import { Flex, Box } from '@chakra-ui/react'
import { Text, spacing, radii } from '@/components/shared/ui'
import type { GitCommitEntry } from '@/api/types'

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay === 1) return 'yesterday'
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

function groupByDate(entries: GitCommitEntry[]): Map<string, GitCommitEntry[]> {
  const groups = new Map<string, GitCommitEntry[]>()
  for (const entry of entries) {
    const date = new Date(entry.date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)

    let key: string
    if (diffDays === 0) key = 'Today'
    else if (diffDays === 1) key = 'Yesterday'
    else if (diffDays < 7) key = date.toLocaleDateString(undefined, { weekday: 'long' })
    else key = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(entry)
  }
  return groups
}

interface Props {
  entries: GitCommitEntry[]
  onSelect?: (hash: string) => void
}

export function HistoryTimeline({ entries, onSelect }: Props) {
  if (entries.length === 0) {
    return (
      <Flex align="center" justify="center" css={{ padding: `${spacing.xl} 0` }}>
        <Text variant="caption" color="muted">No commits yet</Text>
      </Flex>
    )
  }

  const groups = groupByDate(entries)

  return (
    <Flex direction="column">
      {Array.from(groups.entries()).map(([date, items]) => (
        <Box key={date}>
          <Text variant="tiny" color="muted" css={{ padding: `${spacing.sm} 0 ${spacing.xs}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {date}
          </Text>

          <Box css={{ marginLeft: '6px', borderLeft: '1px solid var(--studio-border)', paddingLeft: 0 }}>
            {items.map((entry) => (
              <Flex
                as="button"
                key={entry.hash}
                align="center"
                gap={spacing.sm}
                onClick={() => onSelect?.(entry.hash)}
                css={{
                  width: '100%',
                  padding: `6px ${spacing.sm}`,
                  marginLeft: '-1px',
                  border: 'none',
                  borderLeft: '1px solid transparent',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.1s ease',
                  '&:hover': {
                    background: 'var(--studio-bg-surface)',
                    borderLeftColor: 'var(--studio-text-muted)',
                  },
                }}
              >
                {/* Dot */}
                <Box css={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--studio-border-hover)',
                  flexShrink: 0,
                  marginLeft: '-4px',
                }} />

                {/* Hash */}
                <Text variant="caption" css={{
                  fontFamily: "'SF Mono', monospace",
                  color: 'var(--studio-text-muted)',
                  flexShrink: 0,
                  opacity: 0.7,
                }}>
                  {entry.hash.slice(0, 7)}
                </Text>

                {/* Message */}
                <Text variant="bodySmall" css={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'var(--studio-text-primary)',
                  fontWeight: 450,
                }}>
                  {entry.message}
                </Text>

                {/* Time */}
                <Text variant="caption" color="muted" css={{ flexShrink: 0 }}>
                  {formatRelative(entry.date)}
                </Text>
              </Flex>
            ))}
          </Box>
        </Box>
      ))}
    </Flex>
  )
}
