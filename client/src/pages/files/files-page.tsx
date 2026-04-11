import { useState } from 'react'
import { FileViewer } from './components/file-viewer/index'
import { useFiles } from '@/hooks/use-files'
import { useFileStore } from '@/stores/file-store'
import { ExplorerPanel } from './components/file-browser/explorer-panel'
import { EmptyViewer } from './components/file-browser/empty-viewer'
import { SplitPanel } from '@/components/shared/layout'

export default function FilesPage() {
  const { tree, fetchFileTree, fetchFileContent } = useFiles()
  const { activeTab, openTabs, changedFiles } = useFileStore()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <SplitPanel
      left={
        <ExplorerPanel
          tree={tree}
          activeTab={activeTab}
          changedFiles={changedFiles}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => fetchFileTree()}
          onSelectFile={fetchFileContent}
        />
      }
      defaultWidth={240}
      minWidth={180}
      maxWidth={400}
      storageKey="files.explorerWidth"
    >
      {openTabs.length > 0 && activeTab ? (
        <FileViewer />
      ) : (
        <EmptyViewer />
      )}
    </SplitPanel>
  )
}
