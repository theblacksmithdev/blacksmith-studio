import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { FileCode2 } from 'lucide-react'
import { api } from '@/api'

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--studio-bg-sidebar);
  border-radius: 10px;
  border: 1px solid var(--studio-border);
`

const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--studio-border);
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--studio-text-secondary);
`

const Stats = styled.span`
  margin-left: auto;
  display: flex;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
`

const DiffContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 0;
`

const DiffTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 20px;
`

const DiffRow = styled.tr<{ type: 'add' | 'remove' | 'context' }>`
  background: ${(p) => {
    switch (p.type) {
      case 'add': return 'rgba(16, 163, 127, 0.06)'
      case 'remove': return 'rgba(239, 68, 68, 0.06)'
      default: return 'transparent'
    }
  }};
`

const LineNum = styled.td`
  width: 48px;
  padding: 0 8px;
  text-align: right;
  color: var(--studio-text-muted);
  font-size: 11px;
  user-select: none;
  opacity: 0.6;
  vertical-align: top;
`

const LineContent = styled.td<{ type: 'add' | 'remove' | 'context' }>`
  padding: 0 14px 0 8px;
  white-space: pre-wrap;
  word-break: break-all;
  color: ${(p) => {
    switch (p.type) {
      case 'add': return 'var(--studio-green)'
      case 'remove': return 'var(--studio-error)'
      default: return 'var(--studio-text-tertiary)'
    }
  }};
`

const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
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
    if (!filePath) { setDiff(null); return }
    setLoading(true)
    api.git.diff({ path: filePath }).then((d) => {
      setDiff(d)
      setLoading(false)
    }).catch(() => { setDiff(null); setLoading(false) })
  }, [filePath])

  if (!filePath) {
    return (
      <Container>
        <Placeholder>
          <FileCode2 size={24} style={{ opacity: 0.4 }} />
          Select a file to view diff
        </Placeholder>
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
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {filePath}
        </span>
        <Stats>
          {addCount > 0 && <span style={{ color: 'var(--studio-green)' }}>+{addCount}</span>}
          {removeCount > 0 && <span style={{ color: 'var(--studio-error)' }}>-{removeCount}</span>}
        </Stats>
      </Header>
      <DiffContent>
        <DiffTable>
          <tbody>
            {lines.map((line, i) => {
              const type = classifyLine(line)
              return (
                <DiffRow key={i} type={type}>
                  <LineNum>{i + 1}</LineNum>
                  <LineContent type={type}>{line || ' '}</LineContent>
                </DiffRow>
              )
            })}
          </tbody>
        </DiffTable>
      </DiffContent>
    </Container>
  )
}
