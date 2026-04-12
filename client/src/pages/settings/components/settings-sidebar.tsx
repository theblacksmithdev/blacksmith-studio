import { Box, Flex } from '@chakra-ui/react'
import { useProjectStore } from '@/stores/project-store'
import { Text, spacing, radii } from '@/components/shared/ui'
import { useSettingsNav, settingsGroups, dangerItems, type SettingsNavItem } from '../hooks'

function NavItem({ item, active, isDanger, onClick }: {
  item: SettingsNavItem
  active: boolean
  isDanger?: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <Flex
      as="button"
      align="center"
      gap={spacing.sm}
      onClick={onClick}
      css={{
        padding: '7px 12px',
        borderRadius: radii.md,
        border: 'none',
        background: active
          ? isDanger ? 'var(--studio-error-subtle)' : 'var(--studio-bg-hover)'
          : 'transparent',
        color: active
          ? isDanger ? 'var(--studio-error)' : 'var(--studio-text-primary)'
          : isDanger ? 'var(--studio-text-muted)' : 'var(--studio-text-tertiary)',
        fontSize: '14px',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        fontFamily: 'inherit',
        transition: 'all 0.1s ease',
        '&:hover': {
          background: active
            ? isDanger ? 'var(--studio-error-subtle)' : 'var(--studio-bg-hover)'
            : 'var(--studio-bg-surface)',
          color: isDanger
            ? active ? 'var(--studio-error)' : 'var(--studio-text-tertiary)'
            : 'var(--studio-text-secondary)',
        },
      }}
    >
      <Icon size={15} style={{ flexShrink: 0 }} />
      {item.label}
    </Flex>
  )
}

export function SettingsSidebar() {
  const activeProject = useProjectStore((s) => s.activeProject)
  const { isActive, goTo } = useSettingsNav()

  return (
    <Flex
      direction="column"
      css={{
        height: '100%',
        background: 'var(--studio-bg-sidebar)',
        padding: '20px 0',
        overflowY: 'auto',
      }}
    >
      <Box css={{ padding: '0 20px', marginBottom: '20px' }}>
        <Text css={{ fontSize: '16px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
          Settings
        </Text>
        {activeProject && (
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeProject.name}
          </Text>
        )}
      </Box>

      <Flex direction="column" gap={spacing.lg} css={{ padding: '0 8px', flex: 1 }}>
        {settingsGroups.map((group) => (
          <Box key={group.label}>
            <Text css={{
              fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--studio-text-muted)',
              padding: '0 12px', marginBottom: '4px',
            }}>
              {group.label}
            </Text>
            <Flex direction="column" gap="1px">
              {group.items.map((item) => (
                <NavItem key={item.id} item={item} active={isActive(item.id)} onClick={() => goTo(item.id)} />
              ))}
            </Flex>
          </Box>
        ))}
      </Flex>

      <Flex direction="column" gap="1px" css={{ padding: '0 8px', marginTop: spacing.sm }}>
        {dangerItems.map((item) => (
          <NavItem key={item.id} item={item} active={isActive(item.id)} isDanger onClick={() => goTo(item.id)} />
        ))}
      </Flex>
    </Flex>
  )
}
