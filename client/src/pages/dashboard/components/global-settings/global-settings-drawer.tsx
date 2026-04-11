import styled from '@emotion/styled'
import { Drawer } from '@/components/shared/ui'
import { useGlobalSettings } from '@/hooks/use-global-settings'
import { NodeSection } from './sections/node-section'

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  margin: -20px;
`

interface GlobalSettingsDrawerProps {
  onClose: () => void
}

export function GlobalSettingsDrawer({ onClose }: GlobalSettingsDrawerProps) {
  const gs = useGlobalSettings()

  return (
    <Drawer title="Global Settings" subtitle="Defaults for all projects. Override per-project in workspace settings." onClose={onClose} size="480px">
      <ScrollArea>
        <NodeSection value={gs.nodePath} onChange={(v) => gs.set('runner.nodePath', v)} />
      </ScrollArea>
    </Drawer>
  )
}
