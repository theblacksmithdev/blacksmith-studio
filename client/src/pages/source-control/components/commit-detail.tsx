import { useState, useMemo, memo, useCallback } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { GitCommitHorizontal, User, Calendar, Copy, Check } from 'lucide-react'
import { useGitCommitDetail } from '@/hooks/use-git'
import { Drawer, Text, Badge, VirtualList, spacing, radii } from '@/components/shared/ui'
import { FileIcon } from '@/pages/files/components/explorer/utils/file-icon'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function classifyLine(line: string): 'add' | 'remove' | 'hunk' | 'context' {
  if (line.startsWith('@@')) return 'hunk'
  if (line.startsWith('+')) return 'add'
  if (line.startsWith('-')) return 'remove'
  return 'context'
}

const diffLineColors: Record<string, { bg: string; text: string }> = {
  add: { bg: 'var(--studio-green-subtle)', text: 'var(--studio-text-primary)' },
  remove: { bg: 'var(--studio-error-subtle)', text: 'var(--studio-text-primary)' },
  hunk: { bg: 'var(--studio-bg-surface)', text: 'var(--studio-text-muted)' },
  context: { bg: 'transparent', text: 'var(--studio-text-tertiary)' },
}

function getFileName(path: string) {
  return path.split('/').pop() || path
}

interface Props {
  hash: string
  onClose: () => void
}

export function CommitDetailDrawer({ hash, onClose }: Props) {
  const { data: detail, isLoading } = useGitCommitDetail(hash)
  const [copied, setCopied] = useState(false)

  const copyHash = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const { totalAdded, totalDeleted, diffLines } = useMemo(() => {
    if (!detail) return { totalAdded: 0, totalDeleted: 0, diffLines: [] as string[] }
    return {
      totalAdded: detail.files.reduce((n, f) => n + f.insertions, 0),
      totalDeleted: detail.files.reduce((n, f) => n + f.deletions, 0),
      diffLines: detail.diff.split('\n').filter((l) =>
        !l.startsWith('diff --git') && !l.startsWith('index ') && !l.startsWith('---') && !l.startsWith('+++')
      ),
    }
  }, [detail])

  const renderDiffLine = useCallback((line: string, i: number) => {
    const type = classifyLine(line)
    const colors = diffLineColors[type]
    return (
      <Flex css={{
        background: colors.bg,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: '12px',
        lineHeight: '18px',
      }}>
        <Box css={{
          width: '40px', minWidth: '40px', padding: '0 6px', textAlign: 'right',
          color: 'var(--studio-text-muted)', fontSize: '11px',
          userSelect: 'none', opacity: 0.5,
        }}>
          {i + 1}
        </Box>
        <Box css={{
          flex: 1, padding: '0 10px 0 6px', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          color: colors.text, fontWeight: type === 'hunk' ? 600 : 400,
        }}>
          {line || ' '}
        </Box>
      </Flex>
    )
  }, [])

  return (
    <Drawer
      title={detail?.message ?? 'Commit Detail'}
      onClose={onClose}
      size="620px"
      headerExtra={<GitCommitHorizontal size={16} style={{ color: 'var(--studio-text-muted)' }} />}
    >
      {isLoading ? (
        <Flex align="center" justify="center" css={{ height: '200px' }}>
          <Text variant="body" color="muted">Loading commit details...</Text>
        </Flex>
      ) : detail ? (
        <Flex direction="column" gap={spacing.xl} css={{ height: '100%', minHeight: 0 }}>
          {/* ── Metadata ── */}
          <Flex align="center" gap={spacing.md} css={{ flexWrap: 'wrap' }}>
            <Flex
              as="button"
              align="center"
              gap={spacing.xs}
              onClick={copyHash}
              css={{
                padding: `3px ${spacing.sm}`,
                borderRadius: radii.md,
                border: '1px solid var(--studio-border)',
                background: 'var(--studio-bg-surface)',
                fontFamily: "'SF Mono', monospace",
                fontSize: '12px',
                color: 'var(--studio-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                '&:hover': { borderColor: 'var(--studio-border-hover)', color: 'var(--studio-text-primary)' },
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {detail.hash.slice(0, 7)}
            </Flex>

            <Flex align="center" gap={spacing.xs} css={{ color: 'var(--studio-text-muted)' }}>
              <User size={12} />
              <Text variant="caption">{detail.author}</Text>
            </Flex>

            <Flex align="center" gap={spacing.xs} css={{ color: 'var(--studio-text-muted)' }}>
              <Calendar size={12} />
              <Text variant="caption">{formatDate(detail.date)}</Text>
            </Flex>
          </Flex>

          {/* ── Files changed ── */}
          <Box>
            <Flex align="center" gap={spacing.sm} css={{ marginBottom: spacing.sm }}>
              <Text variant="tiny" color="muted" css={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Files changed
              </Text>
              <Badge variant="default" size="sm">{detail.files.length}</Badge>
              {totalAdded > 0 && <Text variant="caption" css={{ color: 'var(--studio-green)', fontWeight: 500 }}>+{totalAdded}</Text>}
              {totalDeleted > 0 && <Text variant="caption" css={{ color: 'var(--studio-error)', fontWeight: 500 }}>-{totalDeleted}</Text>}
            </Flex>

            <Flex direction="column" gap="1px">
              {detail.files.map((f) => (
                <Flex
                  key={f.path}
                  align="center"
                  gap={spacing.sm}
                  css={{
                    padding: `5px ${spacing.sm}`,
                    borderRadius: radii.md,
                    transition: 'background 0.1s ease',
                    '&:hover': { background: 'var(--studio-bg-hover)' },
                  }}
                >
                  <FileIcon name={getFileName(f.path)} size={14} />
                  <Text variant="bodySmall" css={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.path}
                  </Text>
                  {f.insertions > 0 && <Text variant="caption" css={{ color: 'var(--studio-green)', fontWeight: 500 }}>+{f.insertions}</Text>}
                  {f.deletions > 0 && <Text variant="caption" css={{ color: 'var(--studio-error)', fontWeight: 500 }}>-{f.deletions}</Text>}
                </Flex>
              ))}
            </Flex>
          </Box>

          {/* ── Diff ── */}
          <Box css={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Text variant="tiny" color="muted" css={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: spacing.sm }}>
              Diff
            </Text>
            <Box css={{
              flex: 1,
              minHeight: 0,
              borderRadius: radii.lg,
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-sidebar)',
              overflow: 'hidden',
            }}>
              <VirtualList
                items={diffLines}
                estimateSize={18}
                overscan={40}
                renderItem={renderDiffLine}
              />
            </Box>
          </Box>
        </Flex>
      ) : (
        <Flex align="center" justify="center" css={{ height: '200px' }}>
          <Text variant="body" color="muted">Failed to load commit details</Text>
        </Flex>
      )}
    </Drawer>
  )
}
