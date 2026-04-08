import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { api } from '@/api'

const Container = styled.div`
  flex: 1;
  overflow: auto;
  background: var(--studio-bg-sidebar);
  border-radius: 10px;
  border: 1px solid var(--studio-border);
`

const Header = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid var(--studio-border);
  font-size: 12px;
  font-family: 'SF Mono', monospace;
  color: var(--studio-text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
`

const DiffContent = styled.pre`
  padding: 12px 16px;
  margin: 0;
  font-size: 12px;
  font-family: 'SF Mono', monospace;
  line-height: 1.7;
  color: var(--studio-text-secondary);
  overflow-x: auto;
`

const DiffLine = styled.div<{ type: 'add' | 'remove' | 'context' }>`
  padding: 0 4px;
  margin: 0 -4px;
  border-radius: 3px;
  background: ${(p) => {
    switch (p.type) {
      case 'add': return 'rgba(80, 200, 120, 0.08)'
      case 'remove': return 'rgba(240, 80, 80, 0.08)'
      default: return 'transparent'
    }
  }};
  color: ${(p) => {
    switch (p.type) {
      case 'add': return '#50c878'
      case 'remove': return '#e05050'
      default: return 'var(--studio-text-tertiary)'
    }
  }};
`

const Placeholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--studio-text-muted);
  font-size: 13px;
`

function classifyLine(line: string): 'add' | 'remove' | 'context' {
  if (line.startsWith('+')) return 'add'
  if (line.startsWith('-')) return 'remove'
  return 'context'
}

interface Props {
  filePath?: string
}

export function DiffViewer({ filePath }: Props) {
  const [diff, setDiff] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!filePath) {
      setDiff(null)
      return
    }

    setLoading(true)
    api.git.diff({ path: filePath }).then((d) => {
      setDiff(d)
      setLoading(false)
    }).catch(() => {
      setDiff(null)
      setLoading(false)
    })
  }, [filePath])

  if (!filePath) {
    return (
      <Container>
        <Placeholder>Select a file to view diff</Placeholder>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container>
        <Placeholder>Loading diff...</Placeholder>
      </Container>
    )
  }

  if (!diff) {
    return (
      <Container>
        <Placeholder>No changes to display</Placeholder>
      </Container>
    )
  }

  const lines = diff.split('\n')
  const addCount = lines.filter((l) => l.startsWith('+')).length
  const removeCount = lines.filter((l) => l.startsWith('-')).length

  return (
    <Container>
      <Header>
        <span>{filePath}</span>
        <span style={{ marginLeft: 'auto' }}>
          {addCount > 0 && <span style={{ color: '#50c878' }}>+{addCount}</span>}
          {addCount > 0 && removeCount > 0 && <span> </span>}
          {removeCount > 0 && <span style={{ color: '#e05050' }}>-{removeCount}</span>}
        </span>
      </Header>
      <DiffContent>
        {lines.map((line, i) => (
          <DiffLine key={i} type={classifyLine(line)}>
            {line || ' '}
          </DiffLine>
        ))}
      </DiffContent>
    </Container>
  )
}
