import { useCallback } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { TabBar } from './tab-bar'
import { CodeEditor } from './code-editor'
import { StatusBar } from './status-bar'
import { ErrorState } from './error-state'
import { useFileSave } from './hooks'
import { Text } from '@/components/shared/ui'
import { useFileStore } from '@/stores/file-store'

export function FileViewer() {
  const { openTabs, activeTab, changedFiles, updateTabContent } = useFileStore()
  const { save, isSaving } = useFileSave()

  const currentTab = openTabs.find((t) => t.path === activeTab)

  const handleChange = useCallback((value: string) => {
    if (activeTab) updateTabContent(activeTab, value)
  }, [activeTab, updateTabContent])

  const handleSave = useCallback(() => {
    if (activeTab) save(activeTab)
  }, [activeTab, save])

  if (!currentTab || !activeTab) return null

  const hasError = !!currentTab.error
  const lineCount = hasError ? 0 : (currentTab.content || '').split('\n').length
  const isChanged = changedFiles.has(activeTab)

  return (
    <Box css={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--studio-bg-main)' }}>
      <TabBar />

      {hasError ? (
        <ErrorState error={currentTab.error!} filePath={currentTab.path} />
      ) : currentTab.content !== null ? (
        <CodeEditor
          content={currentTab.content}
          language={currentTab.language}
          onChange={handleChange}
          onSave={handleSave}
        />
      ) : (
        <Flex align="center" justify="center" css={{ flex: 1 }}>
          <Text variant="body" color="muted">Loading...</Text>
        </Flex>
      )}

      {!hasError && (
        <StatusBar
          lineCount={lineCount}
          language={currentTab.language}
          isChanged={isChanged}
          saving={isSaving}
        />
      )}
    </Box>
  )
}
