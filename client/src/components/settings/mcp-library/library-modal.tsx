import { useState } from 'react'
import { createPortal } from 'react-dom'
import styled from '@emotion/styled'
import { X, Search, Plus } from 'lucide-react'
import type { McpServerConfig, McpServerEntry } from '@/api/modules/mcp'
import { McpServerModal } from '../mcp-server-modal'
import { PRESETS, CATEGORIES } from './presets'
import { ServerListItem } from './server-list-item'

/* ── Styled ── */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.15s ease;
`

const Modal = styled.div`
  width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--studio-bg-surface);
  border-radius: 16px;
  border: 1px solid var(--studio-border);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--studio-border);
  gap: 12px;
`

const Title = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--studio-text-primary);
  flex: 1;
`

const CloseBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover { background: var(--studio-bg-hover); color: var(--studio-text-primary); }
`

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--studio-border);
`

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: var(--studio-text-primary);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  &::placeholder { color: var(--studio-text-muted); }
`

const CategoryBar = styled.div`
  display: flex;
  gap: 4px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--studio-border);
  flex-wrap: wrap;
`

const CategoryBtn = styled.button<{ active: boolean }>`
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'transparent')};
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  font-size: 12px;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  cursor: pointer;
  font-family: inherit;
  transition: all 0.1s ease;
  &:hover { color: var(--studio-text-secondary); }
`

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`

const EmptyMsg = styled.div`
  padding: 24px;
  text-align: center;
  font-size: 12px;
  color: var(--studio-text-tertiary);
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid var(--studio-border);
`

const CustomBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  &:hover { background: var(--studio-bg-surface); border-color: var(--studio-border-hover); color: var(--studio-text-primary); }
`

/* ── Component ── */

interface McpLibraryModalProps {
  existingNames: Set<string>
  onAdd: (name: string, config: McpServerConfig) => void
  onClose: () => void
}

export function McpLibraryModal({ existingNames, onAdd, onClose }: McpLibraryModalProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [configuring, setConfiguring] = useState<typeof PRESETS[number] | null>(null)
  const [showCustom, setShowCustom] = useState(false)

  const filtered = PRESETS.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.name.includes(q)
    }
    return true
  })

  if (configuring) {
    const presetEntry: McpServerEntry = {
      name: configuring.name,
      transport: 'command' in configuring.config ? 'stdio' : 'http',
      config: configuring.config,
      enabled: true,
      status: 'unknown',
    }
    return (
      <McpServerModal
        server={presetEntry}
        onSave={(name, config) => { onAdd(name, config); setConfiguring(null) }}
        onClose={() => setConfiguring(null)}
      />
    )
  }

  if (showCustom) {
    return (
      <McpServerModal
        onSave={(name, config) => { onAdd(name, config); setShowCustom(false) }}
        onClose={() => setShowCustom(false)}
      />
    )
  }

  return createPortal(
    <Overlay>
      <Modal>
        <Header>
          <Title>Add MCP Server</Title>
          <CloseBtn onClick={onClose}><X size={15} /></CloseBtn>
        </Header>

        <SearchBar>
          <Search size={14} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search servers..."
            autoFocus
          />
        </SearchBar>

        <CategoryBar>
          {CATEGORIES.map((cat) => (
            <CategoryBtn key={cat.id} active={category === cat.id} onClick={() => setCategory(cat.id)}>
              {cat.label}
            </CategoryBtn>
          ))}
        </CategoryBar>

        <Body>
          {filtered.map((preset) => (
            <ServerListItem
              key={preset.name}
              preset={preset}
              added={existingNames.has(preset.name)}
              onClick={() => setConfiguring(preset)}
            />
          ))}
          {filtered.length === 0 && <EmptyMsg>No servers match your search.</EmptyMsg>}
        </Body>

        <Footer>
          <CustomBtn onClick={() => setShowCustom(true)}>
            <Plus size={13} />
            Custom Server
          </CustomBtn>
        </Footer>
      </Modal>
    </Overlay>,
    document.body,
  )
}
