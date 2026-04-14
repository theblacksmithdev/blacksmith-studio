import { Flex } from '@chakra-ui/react'
import { FolderCog, Eye, Server } from 'lucide-react'
import { SettingsSection } from '@/pages/settings/components/settings-section'
import { SettingRow } from '@/pages/settings/components/setting-row'
import { SettingInput } from '@/pages/settings/components/setting-input'
import { SettingTextarea } from '@/pages/settings/components/setting-textarea'
import { useSettings } from '@/hooks/use-settings'
import { NodeVersionPicker } from './node-version-picker'

const DEFAULTS: Record<string, string> = {
  'project.displayName': '',
  'project.ignoredPatterns': 'node_modules,.git,__pycache__,venv,dist,.env,.blacksmith-studio',
  'preview.frontendPath': '/',
  'preview.backendPath': '/api/docs/',
  'runner.nodePath': '',
}

export function WorkspaceSettings() {
  const s = useSettings()

  const handleReset = () => {
    for (const [key, value] of Object.entries(DEFAULTS)) {
      s.set(key, value)
    }
  }

  return (
    <Flex direction="column" gap="28px">
      <SettingsSection
        title="Project"
        description="Identity and file browser configuration."
        onReset={handleReset}
      >
        <SettingRow
          label="Display name"
          description={<Flex align="center" gap="4px"><FolderCog size={11} /> Shown in the title bar. Defaults to the folder name.</Flex>}
        >
          <SettingInput
            value={s.displayName}
            placeholder="My Project"
            onChange={(v) => s.set('project.displayName', v)}
          />
        </SettingRow>
        <SettingRow
          label="Ignored patterns"
          description="Comma-separated files and folders hidden from the code browser."
          fullWidth
        >
          <SettingTextarea
            value={s.ignoredPatterns}
            placeholder="node_modules, .git, __pycache__, venv, dist, .env"
            rows={3}
            mono
            onChange={(v) => s.set('project.ignoredPatterns', v)}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title="Dev Environment"
        description="Runtime and preview configuration for dev services."
      >
        <SettingRow
          label="Node.js version"
          description={<Flex align="center" gap="4px"><Server size={11} /> Node binary for dev servers. Empty = system default.</Flex>}
          fullWidth
        >
          <NodeVersionPicker
            value={s.nodePath}
            onChange={(v) => s.set('runner.nodePath', v)}
          />
        </SettingRow>
        <SettingRow
          label="Frontend preview"
          description={<Flex align="center" gap="4px"><Eye size={11} /> URL path appended to the frontend dev server.</Flex>}
        >
          <SettingInput value={s.frontendPath} placeholder="/" onChange={(v) => s.set('preview.frontendPath', v)} />
        </SettingRow>
        <SettingRow
          label="Backend API"
          description={<Flex align="center" gap="4px"><Eye size={11} /> URL path for API docs preview.</Flex>}
        >
          <SettingInput value={s.backendPath} placeholder="/api/docs" onChange={(v) => s.set('preview.backendPath', v)} />
        </SettingRow>
      </SettingsSection>
    </Flex>
  )
}
