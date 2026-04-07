import styled from '@emotion/styled'
import { Splitter } from '@chakra-ui/react'
import { StatusBar } from './status-bar'
import { RunnerLogs } from './logs'
import { useUiStore } from '@/stores/ui-store'
import { useSettings } from '@/hooks/use-settings'
import { PreviewPanel } from '@/components/shared/preview-panel'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--studio-bg-main);
`

const Body = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  margin: 0 16px 16px;
  border-radius: 12px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  overflow: hidden;
`

const LogsColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`

const resizeTriggerCss = {
  width: '6px',
  background: 'transparent',
  borderInlineStart: '1px solid var(--studio-border)',
  cursor: 'col-resize',
  transition: 'border-color 0.15s ease',
  _hover: {
    borderInlineStartWidth: '3px',
    borderColor: 'var(--studio-border-hover)',
  },
}

const PANELS = [
  { id: 'logs', minSize: 25 },
  { id: 'preview', minSize: 20 },
]

export function RunnerPage() {
  const previewOpen = useUiStore((s) => s.previewOpen)
  const setPreviewOpen = useUiStore((s) => s.setPreviewOpen)
  const { runSplit, set: setSetting } = useSettings()

  const handleResizeEnd = (details: { size: number[] }) => {
    const left = Math.round(details.size[0])
    if (left !== runSplit) setSetting('preview.runSplit', left)
  }

  return (
    <Page>
      <StatusBar
        previewOpen={previewOpen}
        onTogglePreview={() => setPreviewOpen(!previewOpen)}
      />

      <Body>
        {previewOpen ? (
          <Splitter.Root
            panels={PANELS}
            defaultSize={[runSplit, 100 - runSplit]}
            orientation="horizontal"
            onResizeEnd={handleResizeEnd}
            css={{ display: 'flex', flex: 1, minHeight: 0 }}
          >
            <Splitter.Panel id="logs">
              <LogsColumn>
                <RunnerLogs />
              </LogsColumn>
            </Splitter.Panel>

            <Splitter.ResizeTrigger id="logs:preview" css={resizeTriggerCss} />

            <Splitter.Panel id="preview">
              <PreviewPanel onClose={() => setPreviewOpen(false)} />
            </Splitter.Panel>
          </Splitter.Root>
        ) : (
          <LogsColumn>
            <RunnerLogs />
          </LogsColumn>
        )}
      </Body>
    </Page>
  )
}
