import { useMemo, memo, useCallback } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { Text, InfiniteScrollList, spacing } from '@/components/shared/ui'
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

function getDateKey(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'long' })
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

type FlatItem =
  | { type: 'header'; label: string }
  | { type: 'entry'; entry: GitCommitEntry }

function flattenWithHeaders(entries: GitCommitEntry[]): FlatItem[] {
  const items: FlatItem[] = []
  let lastKey = ''
  for (const entry of entries) {
    const key = getDateKey(entry.date)
    if (key !== lastKey) {
      items.push({ type: 'header', label: key })
      lastKey = key
    }
    items.push({ type: 'entry', entry })
  }
  return items
}

const CommitRow = memo(function CommitRow({
  entry,
  onSelect,
}: {
  entry: GitCommitEntry
  onSelect?: (hash: string) => void
}) {
  return (
    <Flex
      as="button"
      align="center"
      gap={spacing.sm}
      onClick={() => onSelect?.(entry.hash)}
      css={{
        width: '100%',
        padding: `6px ${spacing.sm}`,
        marginLeft: '5px',
        border: 'none',
        borderLeft: '1px solid var(--studio-border)',
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
      <Box css={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: 'var(--studio-border-hover)', flexShrink: 0, marginLeft: '-4px',
      }} />
      <Text variant="caption" css={{ fontFamily: "'SF Mono', monospace", color: 'var(--studio-text-muted)', flexShrink: 0, opacity: 0.7 }}>
        {entry.hash.slice(0, 7)}
      </Text>
      <Text variant="bodySmall" css={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--studio-text-primary)', fontWeight: 450 }}>
        {entry.message}
      </Text>
      <Text variant="caption" color="muted" css={{ flexShrink: 0 }}>
        {formatRelative(entry.date)}
      </Text>
    </Flex>
  )
})

interface Props {
  entries: GitCommitEntry[]
  onSelect?: (hash: string) => void
}

export function HistoryTimeline({ entries, onSelect }: Props) {
  const flatItems = useMemo(() => flattenWithHeaders(entries), [entries])

  if (entries.length === 0) {
    return (
      <Flex align="center" justify="center" css={{ padding: `${spacing.xl} 0` }}>
        <Text variant="caption" color="muted">No commits yet</Text>
      </Flex>
    )
  }

  const renderItem = useCallback((item: FlatItem) => {
    if (item.type === 'header') {
      return (
        <Text variant="tiny" color="muted" css={{ padding: `${spacing.sm} 0 ${spacing.xs}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {item.label}
        </Text>
      )
    }
    return <CommitRow entry={item.entry} onSelect={onSelect} />
  }, [onSelect])

  return (
    <InfiniteScrollList
      items={flatItems}
      estimateSize={32}
      renderItem={renderItem}
      overscan={20}
    />
  )
}
