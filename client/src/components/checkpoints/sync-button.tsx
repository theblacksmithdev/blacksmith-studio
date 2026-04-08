import { useState } from 'react'
import styled from '@emotion/styled'
import { Button, Flex, Text } from '@chakra-ui/react'
import { ArrowUpDown, Check, AlertCircle, Cloud, CloudOff } from 'lucide-react'
import { useGitSyncStatus, useGit } from '@/hooks/use-git'

const SyncInfo = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  margin-left: 4px;
`

export function SyncButton() {
  const { data: syncStatus, isLoading } = useGitSyncStatus()
  const { sync, invalidateAll } = useGit()
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)

  if (isLoading) return null

  // No remote configured
  if (syncStatus && !syncStatus.hasRemote) {
    return (
      <Button
        size="sm"
        variant="ghost"
        disabled
        css={{
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid var(--studio-border)',
          background: 'transparent',
          color: 'var(--studio-text-muted)',
          fontSize: '12px',
          cursor: 'not-allowed',
          opacity: 0.5,
        }}
      >
        <CloudOff size={13} />
        <span style={{ marginLeft: '6px' }}>No remote</span>
      </Button>
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
    <Button
      size="sm"
      variant="ghost"
      onClick={handleSync}
      disabled={syncing}
      css={{
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid var(--studio-border)',
        background: 'transparent',
        color: result === 'success'
          ? 'var(--studio-accent)'
          : result === 'error'
          ? '#e04040'
          : 'var(--studio-text-secondary)',
        fontSize: '12px',
        transition: 'all 0.15s ease',
        '&:hover': { background: 'var(--studio-bg-hover)' },
        '&:disabled': { opacity: 0.7 },
      }}
    >
      {syncing ? (
        <>
          <ArrowUpDown size={13} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ marginLeft: '6px' }}>Syncing...</span>
        </>
      ) : result === 'success' ? (
        <>
          <Check size={13} />
          <span style={{ marginLeft: '6px' }}>Synced</span>
        </>
      ) : result === 'error' ? (
        <>
          <AlertCircle size={13} />
          <span style={{ marginLeft: '6px' }}>Sync failed</span>
        </>
      ) : isSynced ? (
        <>
          <Cloud size={13} />
          <span style={{ marginLeft: '6px' }}>Synced</span>
        </>
      ) : (
        <>
          <ArrowUpDown size={13} />
          <span style={{ marginLeft: '6px' }}>Sync</span>
          {(ahead > 0 || behind > 0) && (
            <SyncInfo>
              {ahead > 0 && `${ahead}\u2191`}
              {ahead > 0 && behind > 0 && ' '}
              {behind > 0 && `${behind}\u2193`}
            </SyncInfo>
          )}
        </>
      )}
    </Button>
  )
}
