import { Box, Flex, Checkbox } from '@chakra-ui/react'
import { Text, Badge, spacing, radii } from '@/components/shared/ui'
import { FileIcon } from '@/pages/files/components/explorer/utils/file-icon'
import type { GitChangedFile } from '@/api/types'

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

interface FileListProps {
  files: GitChangedFile[]
  selected: Set<string>
  onToggle: (path: string) => void
  onToggleAll: () => void
}

export function FileList({ files, selected, onToggle, onToggleAll }: FileListProps) {
  return (
    <Box>
      <Flex align="center" justify="space-between" css={{ marginBottom: spacing.sm }}>
        <Flex align="center" gap={spacing.xs}>
          <Text variant="bodySmall" css={{ fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
            Files
          </Text>
          <Badge variant="default" size="sm">{selected.size}/{files.length}</Badge>
        </Flex>
        <Box
          as="button"
          onClick={onToggleAll}
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
        </Box>
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
                onCheckedChange={() => onToggle(f.path)}
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
  )
}
