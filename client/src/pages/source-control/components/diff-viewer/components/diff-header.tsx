import { Flex } from '@chakra-ui/react'
import { Plus, Minus, X } from 'lucide-react'
import { Text, Badge, IconButton, Tooltip, spacing } from '@/components/shared/ui'
import { FileIcon } from '@/pages/files/components/explorer/utils/file-icon'
import { FONT } from '../hooks'

interface DiffHeaderProps {
  filePath: string
  additions: number
  deletions: number
  onClose?: () => void
}

export function DiffHeader({ filePath, additions, deletions, onClose }: DiffHeaderProps) {
  const fileName = filePath.split('/').pop() || filePath

  return (
    <Flex align="center" gap={spacing.sm} css={{
      padding: `${spacing.xs} ${spacing.sm} ${spacing.xs} ${spacing.md}`,
      borderBottom: '1px solid var(--studio-border)',
      background: 'var(--studio-bg-sidebar)',
      flexShrink: 0,
      minHeight: '36px',
    }}>
      <FileIcon name={fileName} size={14} />
      <Text variant="bodySmall" css={{
        fontFamily: FONT,
        fontSize: '12px',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: 'var(--studio-text-secondary)',
      }}>
        {filePath}
      </Text>

      {additions > 0 && (
        <Badge variant="default" size="sm" css={{ color: 'var(--studio-green)', gap: '2px', fontFamily: FONT, fontSize: '11px', fontWeight: 500 }}>
          <Plus size={10} />{additions}
        </Badge>
      )}
      {deletions > 0 && (
        <Badge variant="default" size="sm" css={{ color: 'var(--studio-error)', gap: '2px', fontFamily: FONT, fontSize: '11px', fontWeight: 500 }}>
          <Minus size={10} />{deletions}
        </Badge>
      )}

      {onClose && (
        <Tooltip content="Close diff">
          <IconButton variant="ghost" size="xs" onClick={onClose} aria-label="Close diff"><X /></IconButton>
        </Tooltip>
      )}
    </Flex>
  )
}
