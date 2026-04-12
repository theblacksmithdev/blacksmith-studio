import { Flex, Box } from '@chakra-ui/react'
import { MoreVertical, Eye, BotMessageSquare, Trash2 } from 'lucide-react'
import { IconButton, spacing, radii } from '@/components/shared/ui'

interface ServiceMenuProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onViewDetails: () => void
  onDiagnose: () => void
  onDelete: () => void
}

export function ServiceMenu({ isOpen, onToggle, onClose, onViewDetails, onDiagnose, onDelete }: ServiceMenuProps) {
  const itemCss = {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: radii.md,
    border: 'none',
    background: 'transparent',
    color: 'var(--studio-text-secondary)',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left' as const,
    width: '100%',
    '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-primary)' },
  }

  return (
    <Box css={{ position: 'relative' }}>
      <IconButton
        variant="ghost"
        size="xs"
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggle() }}
        aria-label="More options"
      >
        <MoreVertical />
      </IconButton>

      {isOpen && (
        <>
          <Box
            onClick={onClose}
            css={{ position: 'fixed', inset: 0, zIndex: 99 }}
          />
          <Flex
            direction="column"
            css={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 100,
              minWidth: '150px',
              padding: spacing.xs,
              background: 'var(--studio-bg-surface)',
              border: '1px solid var(--studio-border-hover)',
              borderRadius: radii.lg,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
              animation: 'fadeIn 0.1s ease',
            }}
          >
            <Flex
              as="button"
              align="center"
              gap={spacing.sm}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onViewDetails() }}
              css={itemCss}
            >
              <Eye size={13} /> View Details
            </Flex>
            <Flex
              as="button"
              align="center"
              gap={spacing.sm}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDiagnose() }}
              css={itemCss}
            >
              <BotMessageSquare size={13} /> Diagnose with AI
            </Flex>
            <Flex
              as="button"
              align="center"
              gap={spacing.sm}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete() }}
              css={{
                ...itemCss,
                color: 'var(--studio-error)',
                '&:hover': { background: 'var(--studio-error-subtle)' },
              }}
            >
              <Trash2 size={13} /> Remove
            </Flex>
          </Flex>
        </>
      )}
    </Box>
  )
}
