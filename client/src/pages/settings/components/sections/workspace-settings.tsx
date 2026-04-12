import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { SettingsSection } from '../settings-section'
import { SettingRow } from '../setting-row'
import { SettingInput } from '../setting-input'
import { SettingTextarea } from '../setting-textarea'
import { useSettings } from '@/hooks/use-settings'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { Text } from '@/components/shared/ui'
import type { NodeInstallation } from '@/api/types'

const DEFAULTS = {
  'project.displayName': '',
  'project.ignoredPatterns': 'node_modules,.git,__pycache__,venv,dist,.env,.blacksmith-studio',
  'preview.frontendPath': '/',
  'preview.backendPath': '/api/docs/',
  'runner.nodePath': '',
}

const NodeSelect = styled.select`
  min-width: 0;
  flex: 1;
  padding: 7px 28px 7px 10px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: border-color 0.12s ease;

  &:hover { border-color: var(--studio-border-hover); }
  &:focus { border-color: var(--studio-border-hover); box-shadow: var(--studio-ring-focus); }
`

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-secondary);
  }
`

const CustomPathInput = styled.input`
  padding: 7px 10px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  outline: none;
  width: 100%;
  transition: border-color 0.12s ease;

  &:focus { border-color: var(--studio-border-hover); box-shadow: var(--studio-ring-focus); }
`

const Warning = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 8px 10px;
  border-radius: 7px;
  background: rgba(234, 179, 8, 0.06);
  border: 1px solid rgba(234, 179, 8, 0.15);
`

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
        <SettingRow label="Display name" description="Shown in the title bar. Defaults to the folder name.">
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
          description="Node binary used to run dev servers. Leave empty for system default."
          fullWidth
        >
          <NodeVersionPicker
            value={s.nodePath}
            onChange={(v) => s.set('runner.nodePath', v)}
          />
        </SettingRow>
        <SettingRow label="Frontend preview path" description="URL path appended to the frontend dev server.">
          <SettingInput
            value={s.frontendPath}
            placeholder="/"
            onChange={(v) => s.set('preview.frontendPath', v)}
          />
        </SettingRow>
        <SettingRow label="Backend API path" description="URL path for API docs preview.">
          <SettingInput
            value={s.backendPath}
            placeholder="/api/docs"
            onChange={(v) => s.set('preview.backendPath', v)}
          />
        </SettingRow>
      </SettingsSection>
    </Flex>
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
    <Flex direction="column" gap="8px" css={{ width: '100%' }}>
      <Flex gap="8px" align="center">
        <NodeSelect
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
        >
          <option value="">System default</option>
          {installations.map((n: NodeInstallation) => (
            <option key={n.path} value={n.path}>{n.label}</option>
          ))}
          <option value="__custom__">Custom path...</option>
        </NodeSelect>
        <RefreshBtn onClick={() => refetch()} title="Rescan Node installations">
          <RefreshCw size={13} style={isLoading ? { animation: 'spin 1s linear infinite' } : undefined} />
        </RefreshBtn>
      </Flex>

      {showCustom && (
        <CustomPathInput
          type="text"
          placeholder="/path/to/node"
          defaultValue={value}
          onBlur={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onChange((e.target as HTMLInputElement).value) }}
          autoFocus
        />
      )}

      {isBelowMinimum && (
        <Warning>
          <TriangleAlert size={13} style={{ flexShrink: 0, marginTop: 1, color: 'rgb(234, 179, 8)' }} />
          <Text css={{ fontSize: '12px', color: 'var(--studio-text-secondary)', lineHeight: '1.4' }}>
            Node {selectedVersion} is below the minimum (v{MIN_NODE_MAJOR}). Dev servers may fail to start.
          </Text>
        </Warning>
      )}
    </Flex>
  )
}
