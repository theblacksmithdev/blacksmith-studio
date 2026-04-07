import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingInput } from '../setting-input'
import { useSettings } from '@/hooks/use-settings'

export function PreviewSettings() {
  const s = useSettings()

  return (
    <SettingsSection
      title="Preview"
      description="Configure the preview panel URLs for your frontend app and backend API."
    >
      <SettingRow
        label="Frontend path"
        description="URL path appended to the frontend dev server. Usually just /."
      >
        <SettingInput
          value={s.frontendPath}
          placeholder="/"
          onChange={(v) => s.set('preview.frontendPath', v)}
        />
      </SettingRow>
      <SettingRow
        label="Backend API path"
        description="URL path appended to the backend server for API docs or entry. e.g. /api/docs, /swagger, /redoc."
      >
        <SettingInput
          value={s.backendPath}
          placeholder="/api/docs"
          onChange={(v) => s.set('preview.backendPath', v)}
        />
      </SettingRow>
    </SettingsSection>
  )
}
