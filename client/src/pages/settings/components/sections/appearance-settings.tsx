import { Monitor, Sun, Moon } from 'lucide-react'
import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingInput } from '../setting-input'
import { SettingToggle } from '../setting-toggle'
import { SegmentedControl } from '../segmented-control'
import { useSettings } from '@/hooks/use-settings'

const THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: <Monitor /> },
  { value: 'light', label: 'Light', icon: <Sun /> },
  { value: 'dark', label: 'Dark', icon: <Moon /> },
] as const

export function AppearanceSettings() {
  const s = useSettings()

  return (
    <SettingsSection
      title="Appearance"
      description="Customize the look and feel of the interface."
    >
      <SettingRow label="Theme" description="Follow your system or choose manually.">
        <SegmentedControl
          value={s.theme}
          options={[...THEME_OPTIONS]}
          onChange={(v) => s.set('appearance.theme', v)}
        />
      </SettingRow>
      <SettingRow label="Font size" description="Base font size in pixels (12–20).">
        <SettingInput
          value={s.fontSize}
          type="number"
          suffix="px"
          onChange={(v) => s.set('appearance.fontSize', v)}
        />
      </SettingRow>
      <SettingRow label="Collapse sidebar on launch" description="Start with the sidebar minimized.">
        <SettingToggle
          value={s.sidebarCollapsed}
          onChange={(v) => s.set('appearance.sidebarCollapsed', v)}
        />
      </SettingRow>
    </SettingsSection>
  )
}
