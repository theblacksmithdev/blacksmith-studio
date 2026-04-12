import { useState } from 'react'
import styled from '@emotion/styled'
import { ArrowUpDown, Check, AlertCircle, Cloud, CloudOff } from 'lucide-react'
import { useGitSyncStatus, useGit } from '@/hooks/use-git'

const Btn = styled.button<{ variant?: 'success' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  color: ${(p) => {
    if (p.variant === 'success') return 'var(--studio-green)'
    if (p.variant === 'error') return 'var(--studio-error)'
    return 'var(--studio-text-secondary)'
  }};

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
    &:hover { background: transparent; }
  }
`

const Badge = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: var(--studio-text-muted);
  font-family: 'SF Mono', 'Fira Code', monospace;
`

export function SyncButton() {
  const { data: syncStatus, isLoading } = useGitSyncStatus()
  const { sync, invalidateAll } = useGit()
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)

  if (isLoading) return null

  if (syncStatus && !syncStatus.hasRemote) {
    return (
      <Btn disabled title="No remote configured">
        <CloudOff size={13} />
        No remote
      </Btn>
    )
  }

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)
    try {
      const r = await sync.mutateAsync()
      setResult(r.success ? 'success' : 'error')
      invalidateAll()
    } catch {
      setResult('error')
    } finally {
      setSyncing(false)
      setTimeout(() => setResult(null), 3000)
    }
  }

  const { ahead = 0, behind = 0 } = syncStatus ?? {}
  const isSynced = ahead === 0 && behind === 0

  return (
    <Btn
      onClick={handleSync}
      disabled={syncing}
      variant={result ?? undefined}
      title={syncing ? 'Syncing...' : isSynced ? 'Up to date' : `${ahead} ahead, ${behind} behind`}
    >
      {syncing ? (
        <>
          <ArrowUpDown size={13} style={{ animation: 'spin 1s linear infinite' }} />
          Syncing...
        </>
      ) : result === 'success' ? (
        <>
          <Check size={13} />
          Synced
        </>
      ) : result === 'error' ? (
        <>
          <AlertCircle size={13} />
          Failed
        </>
      ) : isSynced ? (
        <>
          <Cloud size={13} />
          Push / Pull
        </>
      ) : (
        <>
          <ArrowUpDown size={13} />
          Push / Pull
          {(ahead > 0 || behind > 0) && (
            <Badge>
              {ahead > 0 && `\u2191${ahead}`}
              {ahead > 0 && behind > 0 && ' '}
              {behind > 0 && `\u2193${behind}`}
            </Badge>
          )}
        </>
      )}
    </Btn>
  )
}
