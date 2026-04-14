import { useState, useEffect, useCallback, useRef } from 'react'
import styled from '@emotion/styled'
import { useParams } from 'react-router-dom'
import { Terminal, X, Plus, Trash2, ChevronDown, Search, SquareTerminal } from 'lucide-react'
import type { SearchAddon } from '@xterm/addon-search'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui-store'
import { XtermInstance } from './xterm-instance'
import { TerminalSearch } from './terminal-search'

/* ── Styled ── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #0a0a0a;
`

const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 8px 0 14px;
  height: 38px;
  background: #0a0a0a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  user-select: none;
`

const HeaderLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-right: 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
`

const TabStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`

const Tab = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: ${(p) => (p.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
  color: ${(p) => (p.active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)')};
  font-size: 12px;
  font-weight: ${(p) => (p.active ? 500 : 400)};
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.7);
  }

  &:hover .tab-close {
    opacity: 0.4;
  }
`

const TabIcon = styled.span<{ active?: boolean }>`
  display: flex;
  color: ${(p) => (p.active ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.25)')};
`

const TabClose = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.1s ease;

  &:hover {
    opacity: 1 !important;
    background: rgba(255, 255, 255, 0.1);
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1px;
  margin-left: auto;
  flex-shrink: 0;
`

const IconBtn = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: ${(p) => (p.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
  color: ${(p) => (p.active ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)')};
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
  }
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  background: #0a0a0a;
  overflow: hidden;
`

/* ── Component ── */

interface TermTab {
  id: string
  label: string
}

export function TerminalPanel() {
  const { projectId } = useParams<{ projectId: string }>()
  const isOpen = useUiStore((s) => s.terminalOpen)
  const setOpen = useUiStore((s) => s.setTerminalOpen)
  const [tabs, setTabs] = useState<TermTab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchAddonRef = useRef<SearchAddon | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Spawn first terminal on open — guard with ref to prevent StrictMode double-spawn
  const spawningRef = useRef(false)
  useEffect(() => {
    if (isOpen && tabs.length === 0 && !spawningRef.current) {
      spawningRef.current = true
      spawnTab().finally(() => { spawningRef.current = false })
    }
  }, [isOpen])

  // Listen for terminal exits
  useEffect(() => {
    const unsub = api.terminal.onExit((event) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== event.id)
        if (activeTab === event.id) {
          setActiveTab(next.length > 0 ? next[next.length - 1].id : null)
        }
        if (next.length === 0) setOpen(false)
        return next
      })
    })
    return unsub
  }, [activeTab, setOpen])

  const spawnTab = useCallback(async () => {
    try {
      const id = await api.terminal.spawn({ projectId: projectId! })
      const num = tabs.length + 1
      setTabs((prev) => [...prev, { id, label: `zsh ${num}` }])
      setActiveTab(id)
    } catch (err: any) {
      console.error('Failed to spawn terminal:', err)
    }
  }, [tabs.length])

  const killTab = useCallback(async (id: string) => {
    await api.terminal.kill(id)
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (activeTab === id) {
        setActiveTab(next.length > 0 ? next[next.length - 1].id : null)
      }
      if (next.length === 0) setOpen(false)
      return next
    })
  }, [activeTab, setOpen])

  // Cmd+F to toggle search
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        e.stopPropagation()
        setSearchOpen((v) => !v)
      }
    }
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [])

  if (!isOpen) return null

  return (
    <Wrapper ref={wrapperRef}>
      <Header>
        <HeaderLabel>
          <Terminal size={12} />
          Terminal
        </HeaderLabel>

        <TabStrip>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              active={tab.id === activeTab}
              onClick={() => setActiveTab(tab.id)}
            >
              <TabIcon active={tab.id === activeTab}>
                <SquareTerminal size={12} />
              </TabIcon>
              {tab.label}
              <TabClose
                className="tab-close"
                onClick={(e) => { e.stopPropagation(); killTab(tab.id) }}
              >
                <X size={9} />
              </TabClose>
            </Tab>
          ))}
        </TabStrip>

        <Actions>
          <IconBtn
            active={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            title="Search (⌘F)"
          >
            <Search size={13} />
          </IconBtn>
          <IconBtn onClick={spawnTab} title="New terminal">
            <Plus size={14} />
          </IconBtn>
          <IconBtn
            onClick={() => {
              tabs.forEach((t) => api.terminal.kill(t.id))
              setTabs([])
              setActiveTab(null)
              setOpen(false)
            }}
            title="Kill all"
          >
            <Trash2 size={12} />
          </IconBtn>
          <IconBtn onClick={() => setOpen(false)} title="Hide terminal">
            <ChevronDown size={14} />
          </IconBtn>
        </Actions>
      </Header>

      <Body>
        {searchOpen && (
          <TerminalSearch
            searchAddon={searchAddonRef.current}
            onClose={() => setSearchOpen(false)}
          />
        )}
        {activeTab && (
          <XtermInstance
            key={activeTab}
            terminalId={activeTab}
            searchAddonRef={searchAddonRef}
          />
        )}
      </Body>
    </Wrapper>
  )
}
