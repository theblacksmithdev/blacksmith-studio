import type { DiffLine } from './use-parsed-diff'

export const LINE_HEIGHT = 20
export const FONT = "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace"

export const lineNumStyle: React.CSSProperties = {
  width: '44px',
  minWidth: '44px',
  padding: '0 8px',
  textAlign: 'right',
  fontSize: '11px',
  userSelect: 'none',
  verticalAlign: 'top',
  lineHeight: `${LINE_HEIGHT}px`,
}

export interface LineStyles {
  bg: string
  numColor: string
  gutterColor: string
  textColor: string
}

export function getLineStyles(type: DiffLine['type']): LineStyles {
  switch (type) {
    case 'add': return {
      bg: 'rgba(46, 160, 67, 0.08)',
      numColor: 'rgba(46, 160, 67, 0.6)',
      gutterColor: 'var(--studio-green)',
      textColor: 'var(--studio-text-primary)',
    }
    case 'remove': return {
      bg: 'rgba(248, 81, 73, 0.08)',
      numColor: 'rgba(248, 81, 73, 0.6)',
      gutterColor: 'var(--studio-error)',
      textColor: 'var(--studio-text-primary)',
    }
    case 'context': return {
      bg: 'transparent',
      numColor: 'var(--studio-text-muted)',
      gutterColor: 'transparent',
      textColor: 'var(--studio-text-tertiary)',
    }
    case 'header': return {
      bg: 'var(--studio-bg-surface)',
      numColor: 'var(--studio-text-muted)',
      gutterColor: 'transparent',
      textColor: 'var(--studio-text-muted)',
    }
  }
}
