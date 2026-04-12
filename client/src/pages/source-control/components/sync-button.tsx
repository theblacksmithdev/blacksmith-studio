import { useState } from 'react'
import { ArrowUpDown, Check, AlertCircle, Cloud, CloudOff } from 'lucide-react'
import { useGitSyncStatus, useGit } from '@/hooks/use-git'
import { Button, Badge, Tooltip } from '@/components/shared/ui'

export function SyncButton() {
  const { data: syncStatus, isLoading } = useGitSyncStatus()
  const { sync, invalidateAll } = useGit()
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)

  if (isLoading) return null

  if (syncStatus && !syncStatus.hasRemote) {
    return (
      <Tooltip content="No remote configured">
        <Button variant="secondary" size="sm" disabled>
          <CloudOff size={13} /> No remote
        </Button>
      </Tooltip>
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
  const title = syncing ? 'Syncing...' : isSynced ? 'Up to date' : `${ahead} ahead, ${behind} behind`

  return (
    <Tooltip content={title}>
      <Button variant="secondary" size="sm" onClick={handleSync} disabled={syncing}>
        {syncing ? (
          <><ArrowUpDown size={13} style={{ animation: 'spin 1s linear infinite' }} /> Syncing...</>
        ) : result === 'success' ? (
          <><Check size={13} /> Synced</>
        ) : result === 'error' ? (
          <><AlertCircle size={13} /> Failed</>
        ) : (
          <>
            {isSynced ? <Cloud size={13} /> : <ArrowUpDown size={13} />}
            Push / Pull
            {(ahead > 0 || behind > 0) && (
              <Badge variant="default" size="sm" css={{ fontFamily: "'SF Mono', monospace", fontSize: '10px' }}>
                {ahead > 0 && `\u2191${ahead}`}
                {ahead > 0 && behind > 0 && ' '}
                {behind > 0 && `\u2193${behind}`}
              </Badge>
            )}
          </>
        )}
      </Button>
    </Tooltip>
  )
}
