import styled from '@emotion/styled'
import { Globe, ExternalLink, Loader } from 'lucide-react'
import { useRunnerStore } from '@/stores/runner-store'
import { MONO_FONT } from './runner-primitives'

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
  gap: 10px;
  color: var(--studio-text-muted);
`

const EmptyText = styled.div`
  font-size: 13px;
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

export function RunnerPreview() {
  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const frontendPort = useRunnerStore((s) => s.frontendPort)

  const url = frontendPort ? `http://localhost:${frontendPort}` : null

  if (frontendStatus !== 'running' || !url) {
    return (
      <Empty>
        <EmptyInner>
          {frontendStatus === 'starting' ? (
            <Loader size={20} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : (
            <Globe size={20} />
          )}
          <EmptyText>
            {frontendStatus === 'starting' ? 'Starting frontend...' : 'Start the frontend to see a preview'}
          </EmptyText>
        </EmptyInner>
      </Empty>
    )
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
