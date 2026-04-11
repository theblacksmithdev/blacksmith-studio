import { useState, useEffect, useCallback, useRef } from 'react'
import styled from '@emotion/styled'
import { Terminal, X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '@/api'
import { useUiStore } from '@/stores/ui-store'
import { XtermInstance } from './xterm-instance'

const MIN_HEIGHT = 140
const MAX_HEIGHT_RATIO = 0.75
const DEFAULT_HEIGHT = 280

/* ── Styled ── */

const Wrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--studio-border);
  overflow: hidden;
`

const ResizeHandle = styled.div`
  height: 5px;
  cursor: row-resize;
  flex-shrink: 0;
  position: relative;
  background: transparent;
  transition: background 0.12s ease;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 3px;
    border-radius: 1.5px;
    background: transparent;
    transition: background 0.15s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &:hover::after {
    background: var(--studio-border-hover);
  }

  &:active::after {
    background: var(--studio-accent);
  }
`

const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 0 6px 0 12px;
  height: 35px;
  background: var(--studio-bg-sidebar);
  user-select: none;
`

const HeaderLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--studio-text-muted);
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
  gap: 6px;
  padding: 4px 10px;
  height: 25px;
  border-radius: 5px;
  border: none;
  background: ${(p) => (p.active ? 'var(--studio-bg-hover)' : 'transparent')};
  color: ${(p) => (p.active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  font-size: 12px;
  font-weight: ${(p) => (p.active ? 500 : 400)};
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-secondary);
  }

  &:hover .tab-close {
    opacity: 0.5;
  }
`

const TabClose = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  opacity: 0;
  transition: all 0.1s ease;

  &:hover {
    opacity: 1 !important;
    background: var(--studio-bg-surface);
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1px;
  margin-left: auto;
  flex-shrink: 0;
`

const IconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  background: #1a1a1a;
  overflow: hidden;
`

/* ── Component ── */

interface TermTab {
  id: string
  label: string
}

export function TerminalPanel() {
  const isOpen = useUiStore((s) => s.terminalOpen)
  const setOpen = useUiStore((s) => s.setTerminalOpen)
  const [tabs, setTabs] = useState<TermTab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [height, setHeight] = useState(DEFAULT_HEIGHT)
  const dragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  // Spawn first terminal on open
  useEffect(() => {
    if (isOpen && tabs.length === 0) {
      spawnTab()
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
      const id = await api.terminal.spawn()
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

  // ── Resize ──

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startY.current = e.clientY
    startH.current = height
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [height])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const delta = startY.current - e.clientY
      const maxH = window.innerHeight * MAX_HEIGHT_RATIO
      setHeight(Math.min(maxH, Math.max(MIN_HEIGHT, startH.current + delta)))
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  if (!isOpen) return null

  return (
    <Wrapper style={{ height }}>
      <ResizeHandle onMouseDown={onMouseDown} />

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
          <IconBtn onClick={spawnTab} title="New terminal (split)">
            <Plus size={13} />
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
        {activeTab && <XtermInstance key={activeTab} terminalId={activeTab} />}
      </Body>
    </Wrapper>
  )
}
