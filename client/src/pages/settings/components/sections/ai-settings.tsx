import { Sparkles, Zap, Feather } from 'lucide-react'
import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingInput } from '../setting-input'
import { SettingTextarea } from '../setting-textarea'
import { SegmentedControl } from '../segmented-control'
import { useSettings } from '@/hooks/use-settings'

const MODEL_OPTIONS = [
  { value: 'sonnet', label: 'Sonnet', icon: <Zap /> },
  { value: 'opus', label: 'Opus', icon: <Sparkles /> },
  { value: 'haiku', label: 'Haiku', icon: <Feather /> },
] as const

const PERMISSION_OPTIONS = [
  { value: 'bypassPermissions', label: 'Auto-approve' },
  { value: 'auto', label: 'Smart' },
  { value: 'default', label: 'Ask each time' },
] as const

export function AiSettings() {
  const s = useSettings()

  return (
    <SettingsSection
      title="AI & Prompting"
      description="Control how Claude processes your requests and generates code."
    >
      <SettingRow label="Model" description="The Claude model used for code generation.">
        <SegmentedControl
          value={s.model}
          options={[...MODEL_OPTIONS]}
          onChange={(v) => s.set('ai.model', v)}
        />
      </SettingRow>
      <SettingRow label="Permissions" description="How Claude handles file edits and shell commands.">
        <SegmentedControl
          value={s.permissionMode}
          options={[...PERMISSION_OPTIONS]}
          onChange={(v) => s.set('ai.permissionMode', v)}
        />
      </SettingRow>
      <SettingRow label="Budget limit" description="Max USD per prompt. Leave empty for unlimited.">
        <SettingInput
          value={s.maxBudget ?? ''}
          type="number"
          placeholder="No limit"
          prefix="$"
          suffix="per prompt"
          onChange={(v) => s.set('ai.maxBudget', v === '' || v === 0 ? null : v)}
        />
      </SettingRow>
      <SettingRow
        label="Custom instructions"
        description="Project-specific rules appended to every prompt — coding style, preferred libraries, patterns to follow."
        fullWidth
      >
        <SettingTextarea
          value={s.customInstructions}
          placeholder="e.g. Always use Tailwind for styling. Prefer functional components. Use snake_case for Python variables."
          rows={6}
          mono
          onChange={(v) => s.set('ai.customInstructions', v)}
        />
      </SettingRow>
    </SettingsSection>
  )
}
