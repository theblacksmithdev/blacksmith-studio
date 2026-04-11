import { Box, Text, VStack, HStack, Flex } from '@chakra-ui/react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Palette, Sparkles, Code2, FolderCog, Blocks, Wand2, BookOpen, AlertTriangle } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'

const sidebarGroups = [
  {
    label: 'Claude',
    items: [
      { id: 'ai', icon: Sparkles, label: 'AI & Prompting' },
      { id: 'mcp', icon: Blocks, label: 'MCP Servers' },
      { id: 'skills', icon: Wand2, label: 'Skills' },
    ],
  },
  {
    label: 'Preferences',
    items: [
      { id: 'appearance', icon: Palette, label: 'Appearance' },
      { id: 'editor', icon: Code2, label: 'Editor' },
    ],
  },
  {
    label: 'Project',
    items: [
      { id: 'workspace', icon: FolderCog, label: 'Workspace' },
      { id: 'knowledge', icon: BookOpen, label: 'Knowledge Base' },
    ],
  },
]

const dangerItems = [
  { id: 'danger', icon: AlertTriangle, label: 'Danger Zone' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeProject = useProjectStore((s) => s.activeProject)

  // Extract the active tab from the URL: /:projectId/settings/ai → "ai"
  const pathSegments = location.pathname.split('/')
  const active = pathSegments[pathSegments.length - 1] || 'ai'

  const goTo = (id: string) => navigate(id, { relative: 'path' })

  const renderItem = (item: { id: string; icon: any; label: string }, isDanger = false) => {
    const isActive = active === item.id
    const Icon = item.icon
    return (
      <Box
        key={item.id}
        as="button"
        onClick={() => goTo(item.id)}
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '7px 12px',
          borderRadius: '7px',
          border: 'none',
          background: isActive
            ? isDanger ? 'var(--studio-error-subtle)' : 'var(--studio-bg-hover)'
            : 'transparent',
          color: isActive
            ? isDanger ? 'var(--studio-error)' : 'var(--studio-text-primary)'
            : isDanger ? 'var(--studio-text-muted)' : 'var(--studio-text-tertiary)',
          fontSize: '13px',
          fontWeight: isActive ? 500 : 400,
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          transition: 'all 0.1s ease',
          '&:hover': {
            background: isActive
              ? isDanger ? 'var(--studio-error-subtle)' : 'var(--studio-bg-hover)'
              : 'var(--studio-bg-surface)',
            color: isDanger
              ? isActive ? 'var(--studio-error)' : 'var(--studio-text-tertiary)'
              : 'var(--studio-text-secondary)',
          },
        }}
      >
        <Icon size={15} style={{ flexShrink: 0 }} />
        {item.label}
      </Box>
    )
  }

  return (
    <HStack gap={0} align="stretch" css={{ height: '100%' }}>
      {/* Sidebar */}
      <Flex
        direction="column"
        css={{
          width: '220px',
          flexShrink: 0,
          borderRight: '1px solid var(--studio-border)',
          background: 'var(--studio-bg-sidebar)',
          padding: '20px 0',
          overflowY: 'auto',
        }}
      >
        <Box css={{ padding: '0 20px', marginBottom: '20px' }}>
          <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
            Settings
          </Text>
          {activeProject && (
            <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeProject.name}
            </Text>
          )}
        </Box>

        <VStack gap={5} align="stretch" css={{ padding: '0 8px' }}>
          {sidebarGroups.map((group) => (
            <Box key={group.label}>
              <Text css={{
                fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--studio-text-muted)',
                padding: '0 12px', marginBottom: '4px',
              }}>
                {group.label}
              </Text>
              <VStack gap={0} align="stretch">
                {group.items.map((item) => renderItem(item))}
              </VStack>
            </Box>
          ))}
        </VStack>

        <Box css={{ flex: 1 }} />

        <VStack gap={0} align="stretch" css={{ padding: '0 8px', marginTop: '8px' }}>
          {dangerItems.map((item) => renderItem(item, true))}
        </VStack>
      </Flex>

      {/* Content — rendered by nested route */}
      <Box
        css={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 40px 64px',
        }}
      >
        <Box css={{ maxWidth: '600px', margin: '0 auto' }}>
          <Outlet />
        </Box>
      </Box>
    </HStack>
  )
}
