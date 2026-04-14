import { Flex } from '@chakra-ui/react'
import { IndentIncrease, WrapText, Map, Hash } from 'lucide-react'
import { SettingsSection } from '@/pages/settings/components/settings-section'
import { SettingRow } from '@/pages/settings/components/setting-row'
import { SettingToggle } from '@/pages/settings/components/setting-toggle'
import { SegmentedControl } from '@/pages/settings/components/segmented-control'
import { useSettings } from '@/hooks/use-settings'

const TAB_SIZE_OPTIONS = [
  { value: '2', label: '2 spaces' },
  { value: '4', label: '4 spaces' },
] as const

export function EditorSettings() {
  const s = useSettings()

  return (
    <SettingsSection
      title="Editor"
      description="Configure the built-in code viewer and editor."
    >
      <SettingRow
        label="Tab size"
        description={<Flex align="center" gap="4px"><IndentIncrease size={11} /> Spaces per indentation level.</Flex>}
      >
        <SegmentedControl
          value={String(s.tabSize)}
          options={[...TAB_SIZE_OPTIONS]}
          onChange={(v) => s.set('editor.tabSize', Number(v))}
        />
      </SettingRow>
      <SettingRow
        label="Word wrap"
        description={<Flex align="center" gap="4px"><WrapText size={11} /> Wrap long lines instead of horizontal scrolling.</Flex>}
      >
        <SettingToggle value={s.wordWrap} onChange={(v) => s.set('editor.wordWrap', v)} />
      </SettingRow>
      <SettingRow
        label="Minimap"
        description={<Flex align="center" gap="4px"><Map size={11} /> Show a minimap overview for large files.</Flex>}
      >
        <SettingToggle value={s.minimap} onChange={(v) => s.set('editor.minimap', v)} />
      </SettingRow>
      <SettingRow
        label="Line numbers"
        description={<Flex align="center" gap="4px"><Hash size={11} /> Display line numbers in the gutter.</Flex>}
      >
        <SettingToggle value={s.lineNumbers} onChange={(v) => s.set('editor.lineNumbers', v)} />
      </SettingRow>
    </SettingsSection>
  )
}
