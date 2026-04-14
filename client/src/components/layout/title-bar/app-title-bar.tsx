import { useState } from 'react'
import { Settings } from 'lucide-react'
import { TitleBarShell, TitleText, NavBtn } from './title-bar-shell'
import { Tooltip } from '@/components/shared/tooltip'
import { GlobalSettingsDrawer } from './global-settings'

export function AppTitleBar() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <TitleBarShell
        center={<TitleText>Blacksmith Studio</TitleText>}
        trailing={
          <Tooltip content="Settings">
            <NavBtn onClick={() => setSettingsOpen(true)}>
              <Settings size={14} />
            </NavBtn>
          </Tooltip>
        }
      />
      {settingsOpen && <GlobalSettingsDrawer onClose={() => setSettingsOpen(false)} />}
    </>
  )
}
