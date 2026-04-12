import { useState } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { PanelRight } from 'lucide-react'
import { useUiStore } from '@/stores/ui-store'
import { RunnerLogs } from '../logs'
import { PreviewPanel } from '@/components/shared/preview-panel'
import { SplitPanel } from '@/components/shared/layout'
import { IconButton, Tooltip } from '@/components/shared/ui'
import { ServiceListPanel } from './components'

export function RunnerPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const previewOpen = useUiStore((s) => s.previewOpen)
  const setPreviewOpen = useUiStore((s) => s.setPreviewOpen)

  const previewToggle = (
    <Tooltip content={previewOpen ? 'Close preview' : 'Open preview'}>
      <IconButton
        variant={previewOpen ? 'default' : 'ghost'}
        size="xs"
        onClick={() => setPreviewOpen(!previewOpen)}
        aria-label="Toggle preview"
      >
        <PanelRight />
      </IconButton>
    </Tooltip>
  )

  const mainContent = (
    <Box css={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <RunnerLogs externalFilter={selectedService} toolbarTrailing={previewToggle} />
    </Box>
  )

  const rightContent = previewOpen ? (
    <SplitPanel
      left={mainContent}
      defaultWidth={500}
      minWidth={300}
      maxWidth={900}
      storageKey="runner.previewSplit"
    >
      <PreviewPanel onClose={() => setPreviewOpen(false)} />
    </SplitPanel>
  ) : mainContent

  return (
    <Flex css={{ height: '100%', background: 'var(--studio-bg-main)' }}>
      <SplitPanel
        left={<ServiceListPanel selectedId={selectedService} onSelect={setSelectedService} />}
        defaultWidth={220}
        minWidth={180}
        maxWidth={350}
        storageKey="runner.servicesWidth"
      >
        {rightContent}
      </SplitPanel>
    </Flex>
  )
}
