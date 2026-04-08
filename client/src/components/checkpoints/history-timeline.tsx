import styled from '@emotion/styled'
import type { GitCommitEntry } from '@/api/types'

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const DateGroup = styled.div`
  margin-bottom: 4px;
`

const DateLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--studio-text-secondary);
  padding: 12px 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--studio-accent);
    flex-shrink: 0;
  }
`

const EntryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0 8px 24px;
  border-left: 1px solid var(--studio-border);
  margin-left: 3.5px;
`

const Dot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--studio-border);
  flex-shrink: 0;
  margin-left: -3.5px;
`

const Message = styled.span`
  font-size: 13px;
  color: var(--studio-text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Meta = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  flex-shrink: 0;
  white-space: nowrap;
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
    else if (diffDays < 7) key = `${diffDays} days ago`
    else key = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(entry)
  }

  return groups
}

interface Props {
  entries: GitCommitEntry[]
}

export function HistoryTimeline({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--studio-text-muted)', fontSize: '13px' }}>
        No commits yet. Make your first commit to start tracking history.
      </div>
    )
  }

  const groups = groupByDate(entries)

  return (
    <Container>
      {Array.from(groups.entries()).map(([date, items]) => (
        <DateGroup key={date}>
          <DateLabel>{date}</DateLabel>
          {items.map((entry) => (
            <EntryRow key={entry.hash}>
              <Dot />
              <Message>{entry.message}</Message>
              <Meta>{formatRelative(entry.date)}</Meta>
              {entry.filesChanged > 0 && (
                <Meta>({entry.filesChanged} file{entry.filesChanged !== 1 ? 's' : ''})</Meta>
              )}
            </EntryRow>
          ))}
        </DateGroup>
      ))}
    </Container>
  )
}
