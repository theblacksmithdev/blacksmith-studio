import { useState } from 'react'
import styled from '@emotion/styled'
import { Play, Square, RotateCw, Copy, Check, Server } from 'lucide-react'
import { isServiceActive, type RunnerStatus } from '@/stores/runner-store'
import { StatusDot, MONO_FONT } from './runner-primitives'

type CardVariant = 'default' | 'compact' | 'inline'

const SIZES = {
  default:  { icon: 28, btn: 28, pad: '10px 12px', radius: 10, iconPx: 14, btnPx: 12 },
  compact:  { icon: 24, btn: 24, pad: '8px 10px',  radius: 8,  iconPx: 12, btnPx: 10 },
  inline:   { icon: 0,  btn: 24, pad: '6px 10px',  radius: 8,  iconPx: 12, btnPx: 10 },
}

/* ── Styled ── */

const Card = styled.div<{ active: boolean; variant: CardVariant }>`
  display: flex;
  align-items: center;
  gap: ${({ variant }) => (variant === 'inline' ? '6px' : '10px')};
  padding: ${({ variant }) => SIZES[variant].pad};
  border-radius: ${({ variant }) => SIZES[variant].radius}px;
  border: ${({ variant }) => (variant === 'inline' ? 'none' : `1px solid ${({ active }: any) => active ? 'var(--studio-border-hover)' : 'var(--studio-border)'}`)};
  background: ${({ active, variant }) =>
    variant === 'inline'
      ? 'transparent'
      : active ? 'var(--studio-bg-surface)' : 'var(--studio-bg-main)'};
  transition: all 0.12s ease;

  ${({ variant }) => variant === 'inline' && `
    &:hover {
      background: var(--studio-bg-surface);
    }
  `}
`

const IconWrap = styled.div<{ active: boolean; size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => Math.round(size * 0.29)}px;
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  background: var(--studio-bg-sidebar);
  flex-shrink: 0;
  transition: all 0.12s ease;
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Label = styled.div<{ variant: CardVariant }>`
  font-size: ${({ variant }) => (variant === 'compact' ? '12px' : '13px')};
  font-weight: 500;
  color: var(--studio-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
`

const StatusText = styled.span`
  font-size: 12px;
  font-weight: 450;
  color: var(--studio-text-tertiary);
  text-transform: capitalize;
`

const Meta = styled.div<{ variant: CardVariant }>`
  font-size: ${({ variant }) => (variant === 'compact' ? '10px' : '11px')};
  color: var(--studio-text-muted);
  margin-top: 1px;
  font-family: ${MONO_FONT};
  display: flex;
  align-items: center;
  gap: 6px;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`

const ActionBtn = styled.button<{ size: number; danger?: boolean }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => Math.round(size * 0.25)}px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  color: ${({ danger }) => (danger ? 'var(--studio-text-secondary)' : 'var(--studio-accent)')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
  }
`

const CopyBtn = styled.button`
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.12s ease;

  &:hover {
    color: var(--studio-text-primary);
  }
`

/* ── Component ── */

interface ServiceCardProps {
  label: string
  icon: typeof Server
  status: RunnerStatus
  port: number | null
  url?: string
  variant?: CardVariant
  onToggle: () => void
  onRestart?: () => void
}

export function ServiceCard({
  label,
  icon: Icon,
  status,
  port,
  url,
  variant = 'default',
  onToggle,
  onRestart,
}: ServiceCardProps) {
  const active = isServiceActive(status)
  const sizes = SIZES[variant]
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card active={active} variant={variant}>
      {variant !== 'inline' && sizes.icon > 0 && (
        <IconWrap active={active} size={sizes.icon}>
          <Icon size={sizes.iconPx} />
        </IconWrap>
      )}

      <Body>
        <Label variant={variant}>
          <StatusDot status={status} size={5} />
          {label}
          {variant === 'default' && <StatusText>{status}</StatusText>}
        </Label>
        <Meta variant={variant}>
          {port && status === 'running'
            ? `localhost:${port}`
            : status === 'starting'
              ? 'Starting...'
              : 'Stopped'}
          {url && status === 'running' && (
            <CopyBtn onClick={handleCopy} title="Copy URL">
              {copied ? <Check size={10} /> : <Copy size={10} />}
            </CopyBtn>
          )}
        </Meta>
      </Body>

      <Actions>
        {active && onRestart && (
          <ActionBtn size={sizes.btn} onClick={onRestart} title={`Restart ${label}`}>
            <RotateCw size={sizes.btnPx} />
          </ActionBtn>
        )}
        <ActionBtn size={sizes.btn} danger={active} onClick={onToggle} title={active ? `Stop ${label}` : `Start ${label}`}>
          {active ? <Square size={sizes.btnPx} /> : <Play size={sizes.btnPx} />}
        </ActionBtn>
      </Actions>
    </Card>
  )
}
