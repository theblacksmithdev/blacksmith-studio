import { Flex, Box } from '@chakra-ui/react'
import { Text, spacing, radii } from '@/components/shared/ui'
import { FileIcon } from '@/pages/files/components/explorer/utils/file-icon'
import type { GitChangedFile } from '@/api/types'

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

function statusColor(status: GitChangedFile['status']): string {
  switch (status) {
    case 'modified': return 'var(--studio-warning)'
    case 'added':
    case 'untracked': return 'var(--studio-green)'
    case 'deleted': return 'var(--studio-error)'
    default: return 'var(--studio-text-muted)'
  }
}

function getFileName(path: string) {
  return path.split('/').pop() || path
}

function getDirectory(path: string) {
  const parts = path.split('/')
  if (parts.length <= 1) return ''
  return parts.slice(0, -1).join('/') + '/'
}

interface Props {
  files: GitChangedFile[]
  selectedPath?: string
  onSelect: (path: string) => void
}

export function ChangedFilesList({ files, selectedPath, onSelect }: Props) {
  if (files.length === 0) {
    return (
      <Flex align="center" justify="center" css={{ padding: `${spacing['3xl']} ${spacing.md}` }}>
        <Text variant="caption" color="muted">No uncommitted changes</Text>
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="1px">
      {files.map((f) => {
        const name = getFileName(f.path)
        const dir = getDirectory(f.path)
        const isSelected = selectedPath === f.path

        return (
          <Flex
            as="button"
            key={f.path}
            align="center"
            gap={spacing.sm}
            onClick={() => onSelect(f.path)}
            css={{
              padding: `6px ${spacing.sm}`,
              borderRadius: radii.md,
              border: 'none',
              background: isSelected ? 'var(--studio-bg-hover)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              fontFamily: 'inherit',
              transition: 'all 0.1s ease',
              '&:hover': {
                background: isSelected ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
              },
            }}
          >
            <FileIcon name={name} size={14} />

            <Flex direction="column" css={{ flex: 1, minWidth: 0 }}>
              <Text variant="bodySmall" css={{ color: isSelected ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)' }}>
                {name}
              </Text>
              {dir && (
                <Text variant="caption" color="muted" css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {dir}
                </Text>
              )}
            </Flex>

            <Box
              css={{
                width: '18px',
                height: '18px',
                borderRadius: radii.xs,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 600,
                fontFamily: "'SF Mono', monospace",
                color: statusColor(f.status),
                background: 'transparent',
                flexShrink: 0,
              }}
            >
              {statusLetter(f.status)}
            </Box>
          </Flex>
        )
      })}
    </Flex>
  )
}
