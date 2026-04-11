import { FolderOpen } from 'lucide-react'
import { Text } from '@/components/shared/ui'

interface FolderButtonProps {
  path: string
  onPick: () => void
  label?: string
}

export function FolderButton({ path, onPick, label }: FolderButtonProps) {
  return (
    <button
      type="button"
      onClick={onPick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 12px', borderRadius: '8px',
        border: '1px solid var(--studio-border)', background: 'var(--studio-bg-surface)',
        cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.12s ease',
        fontFamily: 'inherit',
      }}
    >
      <FolderOpen size={14} style={{ color: path ? 'var(--studio-green)' : 'var(--studio-text-muted)', flexShrink: 0 }} />
      <Text variant="bodySmall" truncate css={{
        flex: 1, display: 'block',
        color: path ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
        fontFamily: path ? "'SF Mono', Menlo, monospace" : 'inherit',
      }}>
        {path || (label ?? 'Choose a folder...')}
      </Text>
      <Text variant="caption" color="tertiary">Browse</Text>
    </button>
  )
}
