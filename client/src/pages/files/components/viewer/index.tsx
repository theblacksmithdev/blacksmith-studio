import { Box, Flex } from '@chakra-ui/react'
import { TabBar } from './tab-bar'
import { CodeEditor } from './code-editor'
import { StatusBar } from './status-bar'
import { Text } from '@/components/shared/ui'
import { useFileStore } from '@/stores/file-store'

export function FileViewer() {
  const { openTabs, activeTab, changedFiles } = useFileStore()

  const currentTab = openTabs.find((t) => t.path === activeTab)

  if (!currentTab || !activeTab) {
    return null
  }

  const lineCount = (currentTab.content || '').split('\n').length
  const isChanged = changedFiles.has(activeTab)

  return (
    <Box css={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--studio-bg-main)' }}>
      <TabBar />

      {currentTab.content !== null ? (
        <CodeEditor content={currentTab.content} language={currentTab.language} />
      ) : (
        <Flex align="center" justify="center" css={{ flex: 1 }}>
          <Text variant="body" color="muted">Loading...</Text>
        </Flex>
      )}

      <StatusBar
        lineCount={lineCount}
        language={currentTab.language}
        isChanged={isChanged}
      />
    </Box>
  )
}
