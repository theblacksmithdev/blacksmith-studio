import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { FileViewer } from './components/file-viewer/index'
import { useFiles } from '@/hooks/use-files'
import { useFileStore } from '@/stores/file-store'
import { ExplorerPanel } from './components/file-browser/explorer-panel'
import { EmptyViewer } from './components/file-browser/empty-viewer'

export default function FilesPage() {
  const { tree, fetchFileTree, fetchFileContent } = useFiles()
  const { activeTab, openTabs, changedFiles } = useFileStore()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <Box css={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      <ExplorerPanel
        tree={tree}
        activeTab={activeTab}
        changedFiles={changedFiles}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={() => fetchFileTree()}
        onSelectFile={fetchFileContent}
      />

      <Box css={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {openTabs.length > 0 && activeTab ? (
          <FileViewer />
        ) : (
          <EmptyViewer />
        )}
      </Box>
    </Box>
  )
}
