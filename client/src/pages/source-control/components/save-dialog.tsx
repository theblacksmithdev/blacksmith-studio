import { useState, useEffect } from 'react'
import { Box, Flex, Checkbox } from '@chakra-ui/react'
import { Sparkles, GitCommitHorizontal } from 'lucide-react'
import type { GitChangedFile } from '@/api/types'
import { useGit } from '@/hooks/use-git'
import { Modal, PrimaryButton, SecondaryButton, GhostButton, FooterSpacer } from '@/components/shared/modal'
import { Text, Input, Badge, spacing, radii } from '@/components/shared/ui'
import { FileIcon } from '@/pages/files/components/explorer/utils/file-icon'

function statusColor(status: GitChangedFile['status']): string {
  switch (status) {
    case 'modified': return 'var(--studio-warning)'
    case 'added':
    case 'untracked': return 'var(--studio-green)'
    case 'deleted': return 'var(--studio-error)'
    default: return 'var(--studio-text-muted)'
  }
}

function statusLetter(status: GitChangedFile['status']): string {
  switch (status) {
    case 'modified': return 'M'
    case 'added': return 'A'
    case 'deleted': return 'D'
    case 'renamed': return 'R'
    case 'untracked': return 'U'
    default: return '?'
  }
}

function getFileName(path: string) {
  return path.split('/').pop() || path
}

interface Props {
  files: GitChangedFile[]
  onClose: () => void
  onCommitted: () => void
}

export function CommitDialog({ files, onClose, onCommitted }: Props) {
  const { commit, generateMessage } = useGit()
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Set<string>>(() => new Set(files.map((f) => f.path)))
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    setGenerating(true)
    generateMessage.mutateAsync().then((msg) => {
      setMessage(msg)
      setGenerating(false)
    }).catch(() => setGenerating(false))
  }, [])

  const toggleFile = (path: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === files.length) setSelected(new Set())
    else setSelected(new Set(files.map((f) => f.path)))
  }

  const handleCommit = async () => {
    if (!message.trim() || selected.size === 0) return
    const selectedFiles = selected.size === files.length ? undefined : Array.from(selected)
    await commit.mutateAsync({ message: message.trim(), files: selectedFiles })
    onCommitted()
  }

  return (
    <Modal
      title="Commit Changes"
      onClose={onClose}
      headerExtra={<GitCommitHorizontal size={16} style={{ color: 'var(--studio-text-muted)' }} />}
      footer={
        <>
          <FooterSpacer />
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton
            onClick={handleCommit}
            disabled={commit.isPending || !message.trim() || selected.size === 0}
          >
            {commit.isPending ? 'Committing...' : 'Commit'}
          </PrimaryButton>
        </>
      }
    >
      {/* Commit message */}
      <Box css={{ marginBottom: spacing.xl }}>
        <Text variant="bodySmall" css={{ fontWeight: 500, marginBottom: spacing.sm, color: 'var(--studio-text-secondary)' }}>
          Commit message
        </Text>
        <Input
          size="md"
          value={generating ? 'Generating...' : message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          placeholder="Describe your changes..."
          disabled={generating}
          autoFocus
        />
        <Box
          as="button"
          onClick={() => {
            if (generating) return
            setGenerating(true)
            generateMessage.mutateAsync().then((msg) => { setMessage(msg); setGenerating(false) }).catch(() => setGenerating(false))
          }}
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            marginTop: spacing.sm,
            padding: `${spacing.xs} ${spacing.sm}`,
            borderRadius: radii.md,
            border: 'none',
            background: 'transparent',
            color: 'var(--studio-text-muted)',
            fontSize: '12px',
            cursor: generating ? 'default' : 'pointer',
            fontFamily: 'inherit',
            opacity: generating ? 0.5 : 1,
            transition: 'all 0.1s ease',
            '&:hover': generating ? {} : { color: 'var(--studio-text-primary)', background: 'var(--studio-bg-hover)' },
          }}
        >
          <Sparkles size={12} />
          Generate with AI
        </Box>
      </Box>

      {/* Staged files */}
      <Box>
        <Flex align="center" justify="space-between" css={{ marginBottom: spacing.sm }}>
          <Flex align="center" gap={spacing.xs}>
            <Text variant="bodySmall" css={{ fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
              Files
            </Text>
            <Badge variant="default" size="sm">{selected.size}/{files.length}</Badge>
          </Flex>
          <Flex
            as="button"
            align="center"
            onClick={toggleAll}
            css={{
              border: 'none',
              background: 'transparent',
              color: 'var(--studio-text-muted)',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              '&:hover': { color: 'var(--studio-text-primary)' },
            }}
          >
            {selected.size === files.length ? 'Deselect all' : 'Select all'}
          </Flex>
        </Flex>

        <Flex direction="column" gap="2px" css={{ maxHeight: '240px', overflowY: 'auto' }}>
          {files.map((f) => {
            const name = getFileName(f.path)
            return (
              <Flex
                as="label"
                key={f.path}
                align="center"
                gap={spacing.sm}
                css={{
                  padding: `5px ${spacing.sm}`,
                  borderRadius: radii.md,
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                  '&:hover': { background: 'var(--studio-bg-hover)' },
                }}
              >
                <Checkbox.Root
                  checked={selected.has(f.path)}
                  onCheckedChange={() => toggleFile(f.path)}
                  size="sm"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control css={{
                    borderRadius: '4px',
                    border: '1px solid var(--studio-border)',
                    '&[data-state=checked]': {
                      background: 'var(--studio-accent)',
                      borderColor: 'var(--studio-accent)',
                    },
                  }}>
                    <Checkbox.Indicator>
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                    </Checkbox.Indicator>
                  </Checkbox.Control>
                </Checkbox.Root>

                <FileIcon name={name} size={14} />
                <Text variant="bodySmall" css={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.path}
                </Text>
                <Text variant="caption" css={{ color: statusColor(f.status), fontWeight: 600, fontFamily: "'SF Mono', monospace", fontSize: '10px' }}>
                  {statusLetter(f.status)}
                </Text>
              </Flex>
            )
          })}
        </Flex>
      </Box>
    </Modal>
  )
}
