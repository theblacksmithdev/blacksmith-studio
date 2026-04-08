import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Box, Text } from '@chakra-ui/react'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingInput } from '../setting-input'
import { SettingTextarea } from '../setting-textarea'
import { useSettings } from '@/hooks/use-settings'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import type { NodeInstallation } from '@/api/types'

const DEFAULTS = {
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
        label="Node.js version"
        description="Node binary used to run the frontend. Leave empty to use the system default."
        fullWidth
      >
        <NodeVersionPicker
          value={s.nodePath}
          onChange={(v) => s.set('runner.nodePath', v)}
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

function NodeVersionPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [showCustom, setShowCustom] = useState(false)

  const { data: installations = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.nodeInstallations,
    queryFn: () => api.runner.detectNode(),
    staleTime: 60_000,
  })

  const MIN_NODE_MAJOR = 18

  const selectedVersion = useMemo(() => {
    if (!value) return null
    const match = installations.find((n: NodeInstallation) => n.path === value)
    if (!match) return null
    const major = parseInt(match.version.replace(/^v/, ''), 10)
    return isNaN(major) ? null : major
  }, [value, installations])

  const isBelowMinimum = selectedVersion !== null && selectedVersion < MIN_NODE_MAJOR

  return (
    <Box css={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', minWidth: 0 }}>
      <Box css={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', minWidth: 0 }}>
        <select
          value={showCustom ? '__custom__' : value}
          onChange={(e) => {
            const v = e.target.value
            if (v === '__custom__') {
              setShowCustom(true)
            } else {
              setShowCustom(false)
              onChange(v)
            }
          }}
          style={{
            minWidth: 0,
            flex: 1,
            padding: '6px 28px 6px 10px',
            borderRadius: '6px',
            border: '1px solid var(--studio-border)',
            background: 'var(--studio-bg-surface)',
            color: 'var(--studio-text-primary)',
            fontSize: '13px',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
          }}
        >
          <option value="">System default</option>
          {installations.map((n: NodeInstallation) => (
            <option key={n.path} value={n.path}>{n.label}</option>
          ))}
          <option value="__custom__">Custom path...</option>
        </select>
        <button
          onClick={() => refetch()}
          title="Rescan Node installations"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            border: '1px solid var(--studio-border)',
            background: 'var(--studio-bg-surface)',
            color: 'var(--studio-text-muted)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <RefreshCw size={13} style={isLoading ? { animation: 'spin 1s linear infinite' } : undefined} />
        </button>
      </Box>

      {showCustom && (
        <input
          type="text"
          placeholder="/path/to/node"
          defaultValue={value}
          onBlur={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onChange((e.target as HTMLInputElement).value) }}
          autoFocus
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid var(--studio-border)',
            background: 'var(--studio-bg-surface)',
            color: 'var(--studio-text-primary)',
            fontSize: '13px',
            fontFamily: 'SF Mono, monospace',
            outline: 'none',
            width: '100%',
          }}
        />
      )}

      {isBelowMinimum && (
        <Box css={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px',
          padding: '8px 10px',
          borderRadius: '6px',
          background: 'rgba(234, 179, 8, 0.08)',
          border: '1px solid rgba(234, 179, 8, 0.2)',
        }}>
          <TriangleAlert size={13} style={{ flexShrink: 0, marginTop: 1, color: 'rgb(234, 179, 8)' }} />
          <Text css={{ fontSize: '12px', color: 'var(--studio-text-secondary)', lineHeight: '1.4' }}>
            Node {selectedVersion} is below the minimum required version (v{MIN_NODE_MAJOR}). Your project may fail to install dependencies or start the dev server.
          </Text>
        </Box>
      )}
    </Box>
  )
}
