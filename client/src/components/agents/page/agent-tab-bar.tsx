import { type ReactNode } from 'react'
import styled from '@emotion/styled'

export type AgentTab = 'agents' | 'preview' | 'artifacts'

interface TabDef {
  id: AgentTab
  icon: ReactNode
  label: string
  badge?: ReactNode
}

const Bar = styled.div`
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
  background: var(--studio-bg-sidebar);
  height: 38px;
`

const Tab = styled.button<{ active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 100%;
  border: none;
  background: transparent;
  color: ${(p) => (p.active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.12s ease;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 14px;
    right: 14px;
    height: 2px;
    border-radius: 1px;
    background: ${(p) => (p.active ? 'var(--studio-accent)' : 'transparent')};
    transition: background 0.12s ease;
  }

  &:hover {
    color: ${(p) => (p.active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)')};
  }

  & svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`

interface AgentTabBarProps {
  tabs: TabDef[]
  active: AgentTab
  onChange: (tab: AgentTab) => void
}

export function AgentTabBar({ tabs, active, onChange }: AgentTabBarProps) {
  return (
    <Bar>
      {tabs.map((tab) => (
        <Tab key={tab.id} active={active === tab.id} onClick={() => onChange(tab.id)}>
          {tab.icon}
          {tab.label}
          {tab.badge}
        </Tab>
      ))}
    </Bar>
  )
}
