import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import {
  Globe,
  Server,
  Play,
  ExternalLink,
  AlertTriangle,
  RotateCw,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import { useRunnerStore, selectIsAnyActive, type RunnerStatus } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { StatusDot, MONO_FONT } from '../runner-primitives'

/* ── Shared layout ── */

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--studio-bg-sidebar);
`

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 280px;
  text-align: center;
  padding: 32px 24px;
`

const IconCircle = styled.div<{ variant?: 'default' | 'error' | 'warning' }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ variant }) =>
    variant === 'error'
      ? 'var(--studio-error-subtle)'
      : variant === 'warning'
        ? 'rgba(245,158,11,0.08)'
        : 'var(--studio-bg-surface)'};
  color: ${({ variant }) =>
    variant === 'error'
      ? 'var(--studio-error)'
      : variant === 'warning'
        ? 'var(--studio-warning)'
        : 'var(--studio-text-muted)'};
  border: 1px solid ${({ variant }) =>
    variant === 'error'
      ? 'var(--studio-error-subtle)'
      : variant === 'warning'
        ? 'rgba(245,158,11,0.12)'
        : 'var(--studio-border)'};
`

const Title = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.01em;
`

const Desc = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: var(--studio-text-tertiary);
`

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin-top: 4px;
`

const PrimaryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 9px 16px;
  border-radius: 10px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: default; }
`

const SecondaryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 9px 16px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover {
    background: var(--studio-bg-surface);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
  &:disabled { opacity: 0.5; cursor: default; }
`

const LinkBtn = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 9px 16px;
  border-radius: 10px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  text-decoration: none;

  &:hover { opacity: 0.85; }
`

const CodeBlock = styled.div`
  font-size: 12px;
  line-height: 1.6;
  color: var(--studio-text-secondary);
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  border-radius: 8px;
  padding: 10px 14px;
  font-family: ${MONO_FONT};
  text-align: left;
  width: 100%;
`

/* ── Loading bar ── */

const slide = keyframes`
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(0%); }
  100% { transform: translateX(100%); }
`

const LoadingBarWrap = styled.div`
  position: relative;
  width: 100%;
  height: 2px;
  background: var(--studio-border);
  overflow: hidden;
  flex-shrink: 0;
`

const LoadingBarFill = styled.div`
  position: absolute;
  inset: 0;
  width: 40%;
  background: var(--studio-accent);
  border-radius: 1px;
  animation: ${slide} 1.2s ease-in-out infinite;
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--studio-border);
  border-top-color: var(--studio-accent);
  animation: ${spin} 0.8s linear infinite;
`

const LoadingSubtext = styled.div`
  font-size: 13px;
  color: var(--studio-text-muted);
  font-family: ${MONO_FONT};
`

/* ── State components ── */

export function PreviewLoadingBar() {
  return (
    <LoadingBarWrap>
      <LoadingBarFill />
    </LoadingBarWrap>
  )
}

export function PreviewLoading({ url }: { url: string }) {
  return (
    <Center>
      <Card>
        <Spinner />
        <div>
          <Title>Loading preview</Title>
          <LoadingSubtext style={{ marginTop: 6 }}>{url}</LoadingSubtext>
        </div>
      </Card>
    </Center>
  )
}

export function PreviewBlocked({ url, onRetry }: { url: string; onRetry: () => void }) {
  return (
    <Center>
      <Card>
        <IconCircle variant="warning">
          <ShieldAlert size={22} />
        </IconCircle>
        <div>
          <Title>Embedding blocked</Title>
          <Desc style={{ marginTop: 6 }}>
            The server's security headers prevent this page from loading in a preview.
          </Desc>
        </div>
        <CodeBlock>
          Add a middleware to set<br />
          X-Frame-Options: ALLOWALL<br />
          when STUDIO_EMBED=1
        </CodeBlock>
        <Actions>
          <LinkBtn href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} />
            Open in Browser
          </LinkBtn>
          <SecondaryBtn onClick={onRetry}>
            <RotateCw size={12} />
            Retry
          </SecondaryBtn>
        </Actions>
      </Card>
    </Center>
  )
}

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: ${MONO_FONT};
  background: var(--studio-error-subtle));
  color: var(--studio-error);
  border: 1px solid var(--studio-error-subtle));
`

interface PreviewErrorProps {
  url: string
  title?: string
  message?: string
  statusCode?: number
  onRetry: () => void
}

export function PreviewError({ url, title, message, statusCode, onRetry }: PreviewErrorProps) {
  return (
    <Center>
      <Card>
        <IconCircle variant="error">
          <AlertTriangle size={22} />
        </IconCircle>
        <div>
          <Title>{title || 'Failed to load'}</Title>
          {statusCode && (
            <StatusBadge style={{ marginTop: 8 }}>
              {statusCode}
            </StatusBadge>
          )}
          <Desc style={{ marginTop: 8 }}>
            {message || 'The preview could not connect to the server. It may still be starting up.'}
          </Desc>
        </div>
        <Actions>
          <PrimaryBtn onClick={onRetry}>
            <RotateCw size={12} />
            Retry
          </PrimaryBtn>
          <LinkBtn
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: 'var(--studio-bg-main)', color: 'var(--studio-text-secondary)', border: '1px solid var(--studio-border)' }}
          >
            <ExternalLink size={12} />
            Open in Browser
          </LinkBtn>
        </Actions>
      </Card>
    </Center>
  )
}

export function PreviewStopped({ serviceId, serviceName, status, icon: Icon }: {
  serviceId: string
  serviceName: string
  status: RunnerStatus
  icon: LucideIcon
}) {
  const { start } = useRunner()
  const anyActive = useRunnerStore(selectIsAnyActive)

  if (status === 'starting') {
    return (
      <Center>
        <Card>
          <Spinner />
          <div>
            <Title>Starting {serviceName}</Title>
            <Desc style={{ marginTop: 6 }}>
              Waiting for {serviceName} to be ready...
            </Desc>
          </div>
        </Card>
      </Center>
    )
  }

  return (
    <Center>
      <Card>
        <IconCircle>
          <Icon size={22} />
        </IconCircle>
        <div>
          <Title>{serviceName} is offline</Title>
          <Desc style={{ marginTop: 6 }}>
            Start {serviceName} to see its preview here.
          </Desc>
        </div>
        <Actions>
          <PrimaryBtn onClick={() => start(serviceId)}>
            <Play size={13} />
            Start {serviceName}
          </PrimaryBtn>
          {!anyActive && (
            <SecondaryBtn onClick={() => start()}>
              <StatusDot status="stopped" size={5} />
              Start All Servers
            </SecondaryBtn>
          )}
        </Actions>
      </Card>
    </Center>
  )
}
