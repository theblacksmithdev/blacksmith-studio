import styled from '@emotion/styled'
import { PanelRight } from 'lucide-react'
import { Splitter } from '@chakra-ui/react'
import { RunnerControls } from './controls'
import { RunnerLogs } from './logs'
import { useUiStore } from '@/stores/ui-store'
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
  margin: 0 20px 20px;
  border-radius: 14px;
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

const PreviewToggleBtn = styled.button<{ active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)')};
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
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

  return (
    <Page>
      <RunnerControls
        previewToggle={
          <PreviewToggleBtn
            active={previewOpen}
            onClick={() => setPreviewOpen(!previewOpen)}
            title={previewOpen ? 'Close preview' : 'Open preview'}
          >
            <PanelRight size={15} />
          </PreviewToggleBtn>
        }
      />

      <Body>
        {previewOpen ? (
          <Splitter.Root
            panels={PANELS}
            defaultSize={[55, 45]}
            orientation="horizontal"
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
