import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Flex } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { Alert } from '@/components/shared/ui'
import type { NodeInstallation } from '@/api/types'

const Select = styled.select`
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

  &:hover { border-color: var(--studio-border-hover); color: var(--studio-text-secondary); }
`

const PathInput = styled.input`
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

const MIN_NODE_MAJOR = 18

interface NodeVersionPickerProps {
  value: string
  onChange: (v: string) => void
}

export function NodeVersionPicker({ value, onChange }: NodeVersionPickerProps) {
  const [showCustom, setShowCustom] = useState(false)

  const { data: installations = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.nodeInstallations,
    queryFn: () => api.runner.detectNode(),
    staleTime: 60_000,
  })

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
        <Select
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
        </Select>
        <RefreshBtn onClick={() => refetch()} title="Rescan Node installations">
          <RefreshCw size={13} style={isLoading ? { animation: 'spin 1s linear infinite' } : undefined} />
        </RefreshBtn>
      </Flex>

      {showCustom && (
        <PathInput
          type="text"
          placeholder="/path/to/node"
          defaultValue={value}
          onBlur={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onChange((e.target as HTMLInputElement).value) }}
          autoFocus
        />
      )}

      {isBelowMinimum && (
        <Alert variant="warning" icon={<TriangleAlert size={13} />}>
          Node {selectedVersion} is below the minimum (v{MIN_NODE_MAJOR}). Dev servers may fail to start.
        </Alert>
      )}
    </Flex>
  )
}
