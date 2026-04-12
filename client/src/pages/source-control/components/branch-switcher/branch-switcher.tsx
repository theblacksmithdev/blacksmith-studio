import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { GitBranch, GitMerge, Plus } from 'lucide-react'
import { Modal, ModalFooterSpacer, Text, Input, Badge, Button, Alert, spacing, radii } from '@/components/shared/ui'
import { useBranchActions } from './hooks'

interface Props {
  onClose: () => void
}

export function BranchSwitcher({ onClose }: Props) {
  const { branches, actions, pending, error, clearError } = useBranchActions(onClose)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [mergeSource, setMergeSource] = useState<string | null>(null)

  const filtered = branches.others.filter((b) =>
    !search || b.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    actions.create(trimmed)
  }

  const handleCheckout = (name: string) => {
    actions.checkout(name)
  }

  const handleMerge = (source: string) => {
    actions.mergeInto(source)
  }

  return (
    <Modal
      title="Branches"
      onClose={onClose}
      width="440px"
      headerExtra={<GitBranch size={16} style={{ color: 'var(--studio-text-muted)' }} />}
    >
      {/* ── Error banner ── */}
      {error && (
        <Box css={{ marginBottom: spacing.md }}>
          <Alert variant="error" onDismiss={clearError}>{error}</Alert>
        </Box>
      )}

      {/* ── Search ── */}
      {branches.others.length > 3 && (
        <Box css={{ marginBottom: spacing.md }}>
          <Input
            size="sm"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search branches..."
          />
        </Box>
      )}

      {branches.isLoading ? (
        <Flex align="center" justify="center" css={{ padding: spacing['3xl'] }}>
          <Text variant="caption" color="muted">Loading branches...</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="2px">
          {/* ── Current branch ── */}
          {branches.current && (
            <Flex align="center" gap={spacing.sm} css={{
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: radii.md,
              background: 'var(--studio-bg-hover)',
            }}>
              <Box css={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--studio-accent)', flexShrink: 0,
              }} />
              <Text variant="bodySmall" css={{
                flex: 1,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontWeight: 500,
                color: 'var(--studio-text-primary)',
              }}>
                {branches.current.name}
              </Text>
              <Badge variant="default" size="sm">current</Badge>
            </Flex>
          )}

          {/* ── Other branches ── */}
          {filtered.map((b) => (
            <Flex
              as="button"
              key={b.name}
              align="center"
              gap={spacing.sm}
              onClick={() => handleCheckout(b.name)}
              css={{
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: radii.md,
                border: 'none',
                background: 'transparent',
                cursor: pending.switching ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.1s ease',
                opacity: pending.switching ? 0.6 : 1,
                '&:hover': { background: 'var(--studio-bg-surface)' },
              }}
            >
              <Box css={{
                width: '8px', height: '8px', borderRadius: '50%',
                border: '1.5px solid var(--studio-border-hover)', flexShrink: 0,
              }} />
              <Text variant="bodySmall" css={{
                flex: 1,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                color: 'var(--studio-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {b.name}
              </Text>

              {/* Merge button */}
              <Box
                as="button"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); setMergeSource(b.name) }}
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: `2px ${spacing.sm}`,
                  borderRadius: radii.sm,
                  border: '1px solid var(--studio-border)',
                  background: 'transparent',
                  color: 'var(--studio-text-muted)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  opacity: 0,
                  transition: 'all 0.1s ease',
                  '*:hover > &': { opacity: 1 },
                  '&:hover': { borderColor: 'var(--studio-border-hover)', color: 'var(--studio-text-primary)' },
                }}
              >
                <GitMerge size={10} /> Merge
              </Box>
            </Flex>
          ))}

          {filtered.length === 0 && search && (
            <Flex align="center" justify="center" css={{ padding: spacing.xl }}>
              <Text variant="caption" color="muted">No branches match "{search}"</Text>
            </Flex>
          )}
        </Flex>
      )}

      {/* ── Create branch ── */}
      <Box css={{ marginTop: spacing.md, paddingTop: spacing.md, borderTop: '1px solid var(--studio-border)' }}>
        {showCreate ? (
          <Flex gap={spacing.sm}>
            <Box css={{ flex: 1 }}>
              <Input
                size="sm"
                value={newName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                placeholder="new-branch-name"
                autoFocus
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') { setShowCreate(false); setNewName('') }
                }}
              />
            </Box>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              disabled={!newName.trim() || pending.creating}
            >
              {pending.creating ? 'Creating...' : 'Create'}
            </Button>
          </Flex>
        ) : (
          <Flex
            as="button"
            align="center"
            justify="center"
            gap={spacing.xs}
            onClick={() => setShowCreate(true)}
            css={{
              width: '100%',
              padding: spacing.sm,
              borderRadius: radii.md,
              border: '1px dashed var(--studio-border)',
              background: 'transparent',
              color: 'var(--studio-text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '13px',
              transition: 'all 0.1s ease',
              '&:hover': {
                borderColor: 'var(--studio-border-hover)',
                color: 'var(--studio-text-secondary)',
                background: 'var(--studio-bg-surface)',
              },
            }}
          >
            <Plus size={13} /> New branch
          </Flex>
        )}
      </Box>

      {/* ── Merge confirmation ── */}
      {mergeSource && branches.current && (
        <Box css={{
          marginTop: spacing.md,
          padding: spacing.md,
          borderRadius: radii.md,
          border: '1px solid var(--studio-border)',
          background: 'var(--studio-bg-surface)',
        }}>
          <Text variant="bodySmall" css={{ marginBottom: spacing.md, lineHeight: 1.5 }}>
            Merge{' '}
            <Text as="span" variant="bodySmall" css={{ fontFamily: "'SF Mono', monospace", fontWeight: 600, color: 'var(--studio-text-primary)' }}>
              {mergeSource}
            </Text>
            {' '}into{' '}
            <Text as="span" variant="bodySmall" css={{ fontFamily: "'SF Mono', monospace", fontWeight: 600, color: 'var(--studio-text-primary)' }}>
              {branches.current.name}
            </Text>
            ?
          </Text>

          <Flex gap={spacing.sm} justify="flex-end">
            <Button variant="ghost" size="sm" onClick={() => setMergeSource(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleMerge(mergeSource)}
              disabled={pending.merging}
            >
              <GitMerge size={12} />
              {pending.merging ? 'Merging...' : 'Merge'}
            </Button>
          </Flex>
        </Box>
      )}
    </Modal>
  )
}
