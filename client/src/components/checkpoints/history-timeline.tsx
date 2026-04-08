import styled from '@emotion/styled'
import type { GitCommitEntry } from '@/api/types'

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const DateGroup = styled.div`
  &:not(:first-of-type) {
    margin-top: 4px;
  }
`

const DateLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--studio-text-muted);
  padding: 8px 0 6px;
  letter-spacing: 0.02em;
`

const EntryRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin-left: 6px;
  border: none;
  border-left: 1px solid var(--studio-border);
  border-radius: 0;
  background: transparent;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: var(--studio-bg-surface);
  }
`

const Dot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--studio-border);
  border: 1.5px solid var(--studio-bg-main);
  flex-shrink: 0;
  margin-left: -4px;
`

const Message = styled.span`
  font-size: 13px;
  font-weight: 450;
  color: var(--studio-text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.01em;
`

const Meta = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  flex-shrink: 0;
  white-space: nowrap;
`

const Hash = styled.span`
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--studio-text-muted);
  flex-shrink: 0;
  opacity: 0.7;
`

const EmptyMessage = styled.div`
  padding: 20px 12px;
  text-align: center;
  font-size: 13px;
  color: var(--studio-text-muted);
  line-height: 1.6;
`

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
    return <EmptyMessage>No commits yet. Make your first commit to start tracking history.</EmptyMessage>
  }

  const groups = groupByDate(entries)

  return (
    <Container>
      {Array.from(groups.entries()).map(([date, items]) => (
        <DateGroup key={date}>
          <DateLabel>{date}</DateLabel>
          {items.map((entry) => (
            <EntryRow key={entry.hash} onClick={() => onSelect?.(entry.hash)}>
              <Dot />
              <Hash>{entry.hash.slice(0, 7)}</Hash>
              <Message>{entry.message}</Message>
              <Meta>{formatRelative(entry.date)}</Meta>
            </EntryRow>
          ))}
        </DateGroup>
      ))}
    </Container>
  )
}
