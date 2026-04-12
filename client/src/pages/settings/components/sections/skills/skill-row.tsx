import { Flex, Box } from '@chakra-ui/react'
import { Wand2, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Text, Badge, Menu, IconButton } from '@/components/shared/ui'
import type { MenuOption } from '@/components/shared/ui'
import type { SkillEntry } from '@/api/modules/skills'

interface SkillRowProps {
  skill: SkillEntry
  onEdit: () => void
  onDelete: () => void
}

export function SkillRow({ skill, onEdit, onDelete }: SkillRowProps) {
  const menuOptions: MenuOption[] = [
    { icon: <Pencil />, label: 'Edit', onClick: onEdit },
    { icon: <Trash2 />, label: 'Remove', onClick: onDelete, danger: true, separator: true },
  ]

  return (
    <Flex
      align="center"
      gap="12px"
      css={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--studio-border)',
        transition: 'background 0.1s ease',
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { background: 'var(--studio-bg-surface)' },
      }}
    >
      {/* Icon */}
      <Wand2 size={14} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />

      {/* Content */}
      <Box css={{ flex: 1, minWidth: 0 }}>
        <Flex align="center" gap="6px">
          <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
            {skill.name}
          </Text>
          <Badge variant="default" size="sm">/{skill.name}</Badge>
        </Flex>
        {skill.description && (
          <Text css={{
            fontSize: '12px', color: 'var(--studio-text-tertiary)', marginTop: '1px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {skill.description}
          </Text>
        )}
      </Box>

      {/* Menu */}
      <Menu
        trigger={
          <IconButton variant="ghost" size="xs" aria-label="Options">
            <MoreVertical size={14} />
          </IconButton>
        }
        options={menuOptions}
      />
    </Flex>
  )
}
