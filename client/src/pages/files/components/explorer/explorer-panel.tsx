import { useMemo } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { RefreshCw, Search, X } from 'lucide-react'
import { Text, IconButton, Tooltip, Badge, spacing, radii } from '@/components/shared/ui'
import { TreeNode } from './tree-node'
import { toTreeData, filterTree } from './utils/tree-data'
import type { FileNode } from '@/types'

interface ExplorerPanelProps {
  tree: FileNode | null
  activeTab: string | null
  changedFiles: Set<string>
  searchQuery: string
  onSearchChange: (query: string) => void
  onRefresh: () => void
  onSelectFile: (path: string) => void
}

export function ExplorerPanel({
  tree,
  activeTab,
  changedFiles,
  searchQuery,
  onSearchChange,
  onRefresh,
  onSelectFile,
}: ExplorerPanelProps) {
  const data = useMemo(() => {
    if (!tree) return []
    const items = toTreeData(tree)
    return searchQuery ? filterTree(items, searchQuery) : items
  }, [tree, searchQuery])

  const itemCount = tree?.children?.length ?? 0
  const modifiedCount = changedFiles.size

  return (
    <Flex
      direction="column"
      css={{ width: '100%', height: '100%', background: 'var(--studio-bg-sidebar)' }}
    >
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        css={{ padding: `${spacing.sm} ${spacing.md}`, flexShrink: 0 }}
      >
        <Text variant="tiny" color="muted">Explorer</Text>
        <Tooltip content="Refresh file tree">
          <IconButton variant="ghost" size="xs" onClick={onRefresh} aria-label="Refresh">
            <RefreshCw />
          </IconButton>
        </Tooltip>
      </Flex>

      {/* Search */}
      <Box css={{ padding: `0 ${spacing.sm} ${spacing.sm}` }}>
        <Flex
          align="center"
          css={{
            gap: spacing.xs,
            padding: `${spacing.xs} ${spacing.sm}`,
            borderRadius: radii.md,
            background: 'var(--studio-bg-surface)',
            border: '1px solid transparent',
            transition: 'border-color 0.12s ease',
            '&:focus-within': { borderColor: 'var(--studio-border-hover)' },
          }}
        >
          <Search size={12} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--studio-text-primary)', fontSize: '12px', fontFamily: 'inherit', minWidth: 0,
            }}
          />
          {searchQuery && (
            <Box
              as="button"
              onClick={() => onSearchChange('')}
              css={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '16px', height: '16px', borderRadius: '50%',
                border: 'none', background: 'var(--studio-bg-hover)',
                color: 'var(--studio-text-muted)', cursor: 'pointer', flexShrink: 0, padding: 0,
                '&:hover': { color: 'var(--studio-text-primary)' },
              }}
            >
              <X size={9} />
            </Box>
          )}
        </Flex>
      </Box>

      {/* File tree */}
      <Box css={{ flex: 1, overflowY: 'auto', paddingTop: '2px' }}>
        {data.length > 0 ? (
          data.map((item) => (
            <TreeNode
              key={item.id}
              item={item}
              depth={0}
              selectedFile={activeTab}
              changedFiles={changedFiles}
              onSelectFile={onSelectFile}
              defaultOpen={!searchQuery && item.isDir}
            />
          ))
        ) : (
          <Flex align="center" justify="center" css={{ height: '100px' }}>
            <Text variant="caption" color="muted">
              {searchQuery ? 'No files match your search' : 'No files'}
            </Text>
          </Flex>
        )}
      </Box>

      {/* Footer */}
      {tree && (
        <Flex
          align="center"
          gap={2}
          css={{ padding: `${spacing.xs} ${spacing.md}`, borderTop: '1px solid var(--studio-border)' }}
        >
          <Text variant="caption" color="muted">{itemCount} items</Text>
          {modifiedCount > 0 && <Badge variant="warning" size="sm">{modifiedCount} modified</Badge>}
        </Flex>
      )}
    </Flex>
  )
}
