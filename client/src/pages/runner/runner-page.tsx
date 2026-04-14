import { useMemo } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { PanelRight } from 'lucide-react'
import { useUiStore } from '@/stores/ui-store'
import { PreviewPanel } from '@/components/shared/preview-panel'
import { SplitPanel } from '@/components/shared/layout'
import { IconButton, Tooltip } from '@/components/shared/ui'
import { ServiceListPanel } from './components'

export function RunnerPage() {
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

  const outletContext = useMemo(() => ({ previewToggle }), [previewOpen])

  return (
    <Flex css={{ height: '100%', background: 'var(--studio-bg-main)' }}>
      <SplitPanel
        left={<ServiceListPanel />}
        defaultWidth={220}
        minWidth={180}
        maxWidth={350}
        storageKey="runner.servicesWidth"
      >
        <Flex css={{ height: '100%', flex: 1, minWidth: 0 }}>
          <Box css={{ height: '100%', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Outlet context={outletContext} />
          </Box>
          {previewOpen && (
            <Box css={{ width: '45%', maxWidth: '600px', minWidth: '280px', borderLeft: '1px solid var(--studio-border)' }}>
              <PreviewPanel onClose={() => setPreviewOpen(false)} />
            </Box>
          )}
        </Flex>
      </SplitPanel>
    </Flex>
  )
}
