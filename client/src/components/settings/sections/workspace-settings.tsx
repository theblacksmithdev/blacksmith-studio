import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingInput } from '../setting-input'
import { SettingTextarea } from '../setting-textarea'
import { useSettings } from '@/hooks/use-settings'

const DEFAULTS = {
  'project.displayName': '',
  'project.ignoredPatterns': 'node_modules,.git,__pycache__,venv,dist,.env,.blacksmith-studio',
  'preview.frontendPath': '/',
  'preview.backendPath': '/api/docs/',
}

export function WorkspaceSettings() {
  const s = useSettings()

  const handleReset = () => {
    for (const [key, value] of Object.entries(DEFAULTS)) {
      s.set(key, value)
    }
  }

  return (
    <SettingsSection
      title="Workspace"
      description="Project identity, file browser, and preview configuration."
      onReset={handleReset}
    >
      <SettingRow label="Display name" description="Shown in the title bar. Defaults to the folder name.">
        <SettingInput
          value={s.displayName}
          placeholder="My Project"
          onChange={(v) => s.set('project.displayName', v)}
        />
      </SettingRow>
      <SettingRow
        label="Ignored patterns"
        description="Comma-separated list of files and folders to hide from the code browser."
        fullWidth
      >
        <SettingTextarea
          value={s.ignoredPatterns}
          placeholder="node_modules, .git, __pycache__, venv, dist, .env"
          onChange={(v) => s.set('project.ignoredPatterns', v)}
        />
      </SettingRow>
      <SettingRow
        label="Frontend preview path"
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
        description="URL path for API docs. e.g. /api/docs, /swagger, /redoc."
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
