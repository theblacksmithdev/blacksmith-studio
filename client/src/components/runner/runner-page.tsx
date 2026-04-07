import { useState } from 'react'
import styled from '@emotion/styled'
import { RunnerControls } from './runner-controls'
import { RunnerLogs } from './runner-logs'
import { RunnerPreview } from './runner-preview'

type Tab = 'output' | 'preview'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--studio-bg-main);
`

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin: 0 20px 20px;
  border-radius: 14px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  overflow: hidden;
`

const TabBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 16px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`

const TabBtn = styled.button<{ active: boolean }>`
  position: relative;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.12s ease;
  font-family: inherit;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 14px;
    right: 14px;
    height: 2px;
    border-radius: 1px;
    background: ${({ active }) => (active ? 'var(--studio-accent)' : 'transparent')};
    transition: background 0.12s ease;
  }

  &:hover {
    color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)')};
  }
`

const TabContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

export function RunnerPage() {
  const [tab, setTab] = useState<Tab>('output')

  return (
    <Page>
      <RunnerControls />

      <Body>
        <TabBar>
          <TabBtn active={tab === 'output'} onClick={() => setTab('output')}>
            Output
          </TabBtn>
          <TabBtn active={tab === 'preview'} onClick={() => setTab('preview')}>
            Preview
          </TabBtn>
        </TabBar>

        <TabContent>
          {tab === 'output' ? <RunnerLogs /> : <RunnerPreview />}
        </TabContent>
      </Body>
    </Page>
  )
}
