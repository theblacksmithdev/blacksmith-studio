import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, AlertTriangle, Check } from 'lucide-react'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { Text, VStack, HStack, Badge, IconButton, spacing, radii } from '@/components/shared/ui'
import { SettingsSection } from '../settings-section'
import { SettingsRow } from '../settings-row'

interface NodeInstallation {
  path: string
  version: string
  label: string
}

const MIN_NODE_MAJOR = 20

interface NodeSectionProps {
  value: string
  onChange: (v: string) => void
}

export function NodeSection({ value, onChange }: NodeSectionProps) {
  const [showCustom, setShowCustom] = useState(false)

  const { data: installations = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.nodeInstallations,
    queryFn: () => api.runner.detectNode(),
    staleTime: 60_000,
  })

  const selectedInstall = useMemo(() => {
    if (!value) return null
    return installations.find((n: NodeInstallation) => n.path === value) ?? null
  }, [value, installations])

  const selectedMajor = useMemo(() => {
    if (!selectedInstall) return null
    const major = parseInt(selectedInstall.version.replace(/^v/, ''), 10)
    return isNaN(major) ? null : major
  }, [selectedInstall])

  const isBelowMinimum = selectedMajor !== null && selectedMajor < MIN_NODE_MAJOR
  const isGood = selectedMajor !== null && selectedMajor >= MIN_NODE_MAJOR

  return (
    <SettingsSection title="Node.js" description="Runtime for dev servers, CLI tools, and AI agents.">
      <VStack gap="md">
        <SettingsRow label="Version" description="Select or enter a Node.js path.">
          <VStack gap="sm">
            <HStack gap="sm" css={{ width: '100%' }}>
              <select
                value={showCustom ? '__custom__' : value}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '__custom__') { setShowCustom(true) }
                  else { setShowCustom(false); onChange(v) }
                }}
                style={{
                  minWidth: 0, flex: 1,
                  padding: `${spacing.sm} 28px ${spacing.sm} ${spacing.md}`,
                  borderRadius: radii.md,
                  border: '1px solid var(--studio-border)',
                  background: 'var(--studio-bg-surface)',
                  color: 'var(--studio-text-primary)',
                  fontSize: '13px', cursor: 'pointer', outline: 'none',
                  appearance: 'none', fontFamily: 'inherit',
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
              <IconButton variant="default" size="sm" onClick={() => refetch()} aria-label="Rescan">
                <RefreshCw style={isLoading ? { animation: 'spin 1s linear infinite' } : undefined} />
              </IconButton>
            </HStack>

            {showCustom && (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="/path/to/node"
                style={{
                  width: '100%', padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: radii.md,
                  border: '1px solid var(--studio-border)', background: 'var(--studio-bg-inset)',
                  color: 'var(--studio-text-primary)', fontSize: '13px', outline: 'none',
                  fontFamily: "'SF Mono', Menlo, monospace",
                }}
              />
            )}
          </VStack>
        </SettingsRow>

        {/* Status feedback */}
        {isBelowMinimum && (
          <Badge variant="warning" size="md" css={{ width: '100%', padding: `${spacing.sm} ${spacing.md}` }}>
            <AlertTriangle size={13} style={{ flexShrink: 0 }} />
            Node v{selectedMajor} detected. Blacksmith requires v{MIN_NODE_MAJOR}+. Please upgrade.
          </Badge>
        )}

        {isGood && (
          <Badge variant="success" size="md" css={{ width: '100%', padding: `${spacing.sm} ${spacing.md}` }}>
            <Check size={13} style={{ flexShrink: 0 }} />
            {selectedInstall?.version} — applies to all projects.
          </Badge>
        )}

        {!value && (
          <Text variant="caption" color="muted">
            Using system default. Set a specific version if you use nvm or volta.
          </Text>
        )}
      </VStack>
    </SettingsSection>
  )
}
