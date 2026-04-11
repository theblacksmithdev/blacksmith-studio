import { Box, Flex } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { FileIcon } from '../explorer/utils/file-icon'
import { Text, spacing, radii } from '@/components/shared/ui'
import { useFileStore, type OpenTab } from '@/stores/file-store'

function getFileName(path: string) {
  return path.split('/').pop() || path
}

function TabItem({ tab, isActive }: { tab: OpenTab; isActive: boolean }) {
  const { selectTab, closeTab, changedFiles } = useFileStore()
  const isChanged = changedFiles.has(tab.path)
  const name = getFileName(tab.path)

  return (
    <Flex
      as="button"
      align="center"
      onClick={() => selectTab(tab.path)}
      css={{
        gap: spacing.xs,
        padding: `${spacing.xs} ${spacing.md}`,
        height: '36px',
        border: 'none',
        borderRight: '1px solid var(--studio-border)',
        background: isActive ? 'var(--studio-bg-main)' : 'transparent',
        color: isActive ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        fontFamily: 'inherit',
        position: 'relative',
        '&:hover': {
          color: 'var(--studio-text-secondary)',
          background: isActive ? 'var(--studio-bg-main)' : 'var(--studio-bg-surface)',
          '& .tab-close': { opacity: 1 },
        },
        '&::after': isActive ? {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--studio-border-hover)',
        } : {},
      }}
    >
      <FileIcon name={name} size={14} />
      <Text variant="bodySmall" css={{ fontWeight: isActive ? 500 : 400, color: 'inherit' }}>
        {name}
      </Text>
      {isChanged && (
        <Box css={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--studio-warning)', flexShrink: 0 }} />
      )}
      <Box
        as="span"
        className="tab-close"
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); closeTab(tab.path) }}
        css={{
          width: '18px',
          height: '18px',
          borderRadius: radii.xs,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isActive ? 0.6 : 0,
          color: 'var(--studio-text-muted)',
          transition: 'all 0.1s ease',
          marginLeft: spacing['2xs'],
          '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-primary)', opacity: 1 },
        }}
      >
        <X size={11} />
      </Box>
    </Flex>
  )
}

export function TabBar() {
  const { openTabs, activeTab } = useFileStore()

  return (
    <Flex
      css={{
        borderBottom: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-sidebar)',
        flexShrink: 0,
        height: '36px',
        overflow: 'hidden',
        overflowX: 'auto',
        '&::-webkit-scrollbar': { height: '0px' },
      }}
    >
      {openTabs.map((tab) => (
        <TabItem key={tab.path} tab={tab} isActive={tab.path === activeTab} />
      ))}
    </Flex>
  )
}
