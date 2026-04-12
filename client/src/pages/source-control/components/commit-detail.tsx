import { useState } from 'react'
import styled from '@emotion/styled'
import { Flex, Box } from '@chakra-ui/react'
import { GitCommitHorizontal, User, Calendar, Copy, Check } from 'lucide-react'
import { Drawer } from '@/components/shared/drawer'
import { useGitCommitDetail } from '@/hooks/use-git'

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--studio-text-tertiary);
`

const MetaIcon = styled.span`
  color: var(--studio-text-muted);
  display: flex;
  flex-shrink: 0;
`

const HashBadge = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-inset);
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--studio-text-secondary);
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`

const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  transition: background 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
  }
`

const FilePath = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--studio-text-secondary);
`

const StatBadge = styled.span<{ variant: 'add' | 'del' }>`
  font-size: 12px;
  font-weight: 500;
  color: ${(p) => (p.variant === 'add' ? 'var(--studio-green)' : 'var(--studio-error)')};
`

const DiffBlock = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-inset);
`

const DiffTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 18px;
`

const DiffRow = styled.tr<{ type: 'add' | 'remove' | 'context' | 'hunk' }>`
  background: ${(p) => {
    switch (p.type) {
      case 'add': return 'var(--studio-green-subtle)'
      case 'remove': return 'var(--studio-error-subtle))'
      case 'hunk': return 'var(--studio-bg-surface)'
      default: return 'transparent'
    }
  }};
`

const LineNum = styled.td`
  width: 40px;
  padding: 0 6px;
  text-align: right;
  color: var(--studio-text-muted);
  font-size: 11px;
  user-select: none;
  opacity: 0.5;
  vertical-align: top;
`

const LineContent = styled.td<{ type: 'add' | 'remove' | 'context' | 'hunk' }>`
  padding: 0 10px 0 6px;
  white-space: pre-wrap;
  word-break: break-all;
  color: ${(p) => {
    switch (p.type) {
      case 'add': return 'var(--studio-green)'
      case 'remove': return 'var(--studio-error)'
      case 'hunk': return 'var(--studio-text-muted)'
      default: return 'var(--studio-text-tertiary)'
    }
  }};
  font-weight: ${(p) => (p.type === 'hunk' ? 600 : 400)};
`

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: 8px;
`

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 14px;
  color: var(--studio-text-muted);
`

function classifyLine(line: string): 'add' | 'remove' | 'hunk' | 'context' {
  if (line.startsWith('@@')) return 'hunk'
  if (line.startsWith('+')) return 'add'
  if (line.startsWith('-')) return 'remove'
  return 'context'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  hash: string
  onClose: () => void
}

export function CommitDetailDrawer({ hash, onClose }: Props) {
  const { data: detail, isLoading: loading } = useGitCommitDetail(hash)
  const [copied, setCopied] = useState(false)

  const copyHash = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalAdded = detail?.files.reduce((n, f) => n + f.insertions, 0) ?? 0
  const totalDeleted = detail?.files.reduce((n, f) => n + f.deletions, 0) ?? 0

  const diffLines = (detail?.diff ?? '').split('\n').filter((l) => {
    // Skip diff header lines (diff --git, index, ---, +++)
    return !l.startsWith('diff --git') && !l.startsWith('index ') && !l.startsWith('---') && !l.startsWith('+++')
  })

  return (
    <Drawer
      title={detail?.message ?? 'Commit Detail'}
      onClose={onClose}
      size="620px"
      headerExtra={
        <GitCommitHorizontal size={16} style={{ color: 'var(--studio-text-muted)' }} />
      }
    >
      {loading ? (
        <LoadingState>Loading commit details...</LoadingState>
      ) : detail ? (
        <Flex direction="column" gap={5} css={{ height: '100%', minHeight: 0 }}>
          {/* Metadata */}
          <Flex direction="column" gap={2}>
            <Flex align="center" gap={3}>
              <HashBadge onClick={copyHash} title="Copy full hash">
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {detail.hash.slice(0, 7)}
              </HashBadge>
              <MetaRow>
                <MetaIcon><User size={12} /></MetaIcon>
                {detail.author}
              </MetaRow>
              <MetaRow>
                <MetaIcon><Calendar size={12} /></MetaIcon>
                {formatDate(detail.date)}
              </MetaRow>
            </Flex>
          </Flex>

          {/* Files changed */}
          <Box>
            <SectionLabel>
              {detail.files.length} file{detail.files.length !== 1 ? 's' : ''} changed
              {totalAdded > 0 && <StatBadge variant="add" style={{ marginLeft: '8px' }}>+{totalAdded}</StatBadge>}
              {totalDeleted > 0 && <StatBadge variant="del" style={{ marginLeft: '4px' }}>-{totalDeleted}</StatBadge>}
            </SectionLabel>
            <Flex direction="column" gap={0}>
              {detail.files.map((f) => (
                <FileRow key={f.path}>
                  <FilePath>{f.path}</FilePath>
                  {f.insertions > 0 && <StatBadge variant="add">+{f.insertions}</StatBadge>}
                  {f.deletions > 0 && <StatBadge variant="del">-{f.deletions}</StatBadge>}
                </FileRow>
              ))}
            </Flex>
          </Box>

          {/* Diff */}
          <Box css={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <SectionLabel>Diff</SectionLabel>
            <DiffBlock>
              <DiffTable>
                <tbody>
                  {diffLines.map((line, i) => {
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
            </DiffBlock>
          </Box>
        </Flex>
      ) : (
        <LoadingState>Failed to load commit details</LoadingState>
      )}
    </Drawer>
  )
}
