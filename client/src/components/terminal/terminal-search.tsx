import { useState, useCallback, useEffect, useRef } from 'react'
import styled from '@emotion/styled'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import type { SearchAddon } from '@xterm/addon-search'

const Overlay = styled.div`
  position: absolute;
  top: 8px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  animation: termSearchIn 0.12s ease;

  @keyframes termSearchIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`

const Input = styled.input`
  width: 200px;
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  outline: none;
  transition: border-color 0.12s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.15);
  }
`

const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
  }
`

const Count = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 2px;
  white-space: nowrap;
`

interface TerminalSearchProps {
  searchAddon: SearchAddon | null
  onClose: () => void
}

export function TerminalSearch({ searchAddon, onClose }: TerminalSearchProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const findNext = useCallback(() => {
    if (searchAddon && query) searchAddon.findNext(query)
  }, [searchAddon, query])

  const findPrev = useCallback(() => {
    if (searchAddon && query) searchAddon.findPrevious(query)
  }, [searchAddon, query])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      searchAddon?.clearDecorations()
      onClose()
    } else if (e.key === 'Enter') {
      e.shiftKey ? findPrev() : findNext()
    }
  }, [onClose, findNext, findPrev, searchAddon])

  useEffect(() => {
    return () => { searchAddon?.clearDecorations() }
  }, [searchAddon])

  return (
    <Overlay>
      <Search size={12} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginRight: 2 }} />
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          if (e.target.value && searchAddon) searchAddon.findNext(e.target.value)
        }}
        onKeyDown={handleKeyDown}
        placeholder="Find..."
      />
      {query && <Count>{query.length > 0 ? '0/0' : ''}</Count>}
      <Btn onClick={findPrev} title="Previous (Shift+Enter)">
        <ChevronUp size={13} />
      </Btn>
      <Btn onClick={findNext} title="Next (Enter)">
        <ChevronDown size={13} />
      </Btn>
      <Btn onClick={onClose} title="Close (Esc)">
        <X size={12} />
      </Btn>
    </Overlay>
  )
}
