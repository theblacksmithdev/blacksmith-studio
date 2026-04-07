import styled from '@emotion/styled'
import { Globe, ExternalLink, Loader, Play, Server } from 'lucide-react'
import { useRunnerStore, isServiceActive } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { StatusDot, MONO_FONT } from './runner-primitives'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--studio-bg-sidebar);
`

const EmptyInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--studio-text-muted);
  max-width: 240px;
  text-align: center;
`

const EmptyText = styled.div`
  font-size: 13px;
  line-height: 1.5;
`

const StartActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin-top: 4px;
`

const StartBtn = styled.button`
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
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

const StartBtnSecondary = styled.button`
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
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover {
    background: var(--studio-bg-surface);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

const UrlBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
  background: var(--studio-bg-sidebar);
`

const UrlText = styled.span`
  font-size: 11px;
  color: var(--studio-text-tertiary);
  font-family: ${MONO_FONT};
  flex: 1;
`

const ExtLink = styled.a`
  color: var(--studio-text-muted);
  display: flex;
  transition: color 0.12s ease;

  &:hover {
    color: var(--studio-text-secondary);
  }
`

const Frame = styled.div`
  flex: 1;
`

function PreviewEmpty() {
  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const backendStatus = useRunnerStore((s) => s.backendStatus)
  const { start } = useRunner()

  const frontendActive = isServiceActive(frontendStatus)
  const backendActive = isServiceActive(backendStatus)

  if (frontendStatus === 'starting') {
    return (
      <Empty>
        <EmptyInner>
          <Loader size={20} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
          <EmptyText>Starting frontend...</EmptyText>
        </EmptyInner>
      </Empty>
    )
  }

  return (
    <Empty>
      <EmptyInner>
        <Globe size={22} />
        <EmptyText>Start the dev servers to preview your app here.</EmptyText>
        <StartActions>
          <StartBtn onClick={() => start('all')} disabled={frontendActive && backendActive}>
            <Play size={13} />
            Start All Servers
          </StartBtn>
          {!frontendActive && (
            <StartBtnSecondary onClick={() => start('frontend')}>
              <StatusDot status={frontendStatus} size={5} />
              Start Frontend Only
            </StartBtnSecondary>
          )}
          {!backendActive && (
            <StartBtnSecondary onClick={() => start('backend')}>
              <StatusDot status={backendStatus} size={5} />
              Start Backend Only
            </StartBtnSecondary>
          )}
        </StartActions>
      </EmptyInner>
    </Empty>
  )
}

export function RunnerPreview() {
  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const frontendPort = useRunnerStore((s) => s.frontendPort)

  const url = frontendPort ? `http://localhost:${frontendPort}` : null

  if (frontendStatus !== 'running' || !url) {
    return <PreviewEmpty />
  }

  return (
    <Wrap>
      <UrlBar>
        <Globe size={12} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
        <UrlText>{url}</UrlText>
        <ExtLink href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={12} />
        </ExtLink>
      </UrlBar>
      <Frame>
        <iframe
          src={url}
          title="Preview"
          style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
        />
      </Frame>
    </Wrap>
  )
}
