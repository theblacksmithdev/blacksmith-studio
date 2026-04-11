import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { Plus, Pencil, Trash2, Zap, Blocks, ArrowRight, Check, Loader2 } from 'lucide-react'
import { useMcp } from '@/hooks/use-mcp'
import { useProjectStore } from '@/stores/project-store'
import { mcpBrowserPath } from '@/router/paths'
import { McpServerModal } from '../mcp-server-modal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusDot } from '@/components/runner/runner-primitives'
import { MONO_FONT } from '@/components/runner/runner-primitives'
import type { McpServerConfig, McpServerEntry } from '@/api/modules/mcp'

/* ── Styled ── */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
`

const HeaderText = styled.div`
  flex: 1;
`

const Title = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.01em;
  margin-bottom: 4px;
`

const Desc = styled.div`
  font-size: 13px;
  color: var(--studio-text-tertiary);
`

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  margin-top: 2px;
  transition: opacity 0.12s ease;
  &:hover { opacity: 0.85; }
`

const List = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`

const ServerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--studio-border);
  transition: background 0.1s ease;

  &:last-child { border-bottom: none; }
  &:hover {
    background: var(--studio-bg-surface);
    .server-actions { opacity: 1; }
  }
`

const ServerInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ServerName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`

const TransportBadge = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: var(--studio-text-muted);
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  text-transform: uppercase;
  letter-spacing: 0.03em;
`

const ServerMeta = styled.div`
  font-size: 11px;
  color: var(--studio-text-tertiary);
  font-family: ${MONO_FONT};
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ServerError = styled.div`
  font-size: 11px;
  color: var(--studio-error);
  margin-top: 2px;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.1s ease;
  flex-shrink: 0;
`

const IconBtn = styled.button<{ danger?: boolean; disabled?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  transition: all 0.1s ease;

  &:hover {
    ${({ disabled, danger }) => !disabled && `
      background: ${danger ? 'var(--studio-error-subtle)' : 'var(--studio-bg-hover)'};
      color: ${danger ? 'var(--studio-error)' : 'var(--studio-text-primary)'};
    `}
  }
`

const Toggle = styled.button<{ active: boolean }>`
  width: 36px;
  height: 20px;
  border-radius: 10px;
  border: none;
  background: ${({ active }) => (active ? 'var(--studio-accent)' : 'var(--studio-bg-hover)')};
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ active }) => (active ? '18px' : '2px')};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ active }) => (active ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)')};
    transition: left 0.2s ease;
  }
`

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
`

const EmptyIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--studio-text-muted);
`

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--studio-text-primary);
`

const EmptyDesc = styled.div`
  font-size: 13px;
  color: var(--studio-text-tertiary);
  max-width: 300px;
`

const EmptyBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  margin-top: 4px;
  &:hover { background: var(--studio-bg-surface); border-color: var(--studio-border-hover); color: var(--studio-text-primary); }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const TestingIcon = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;
  color: var(--studio-text-muted);
`

const BrowseLink = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 8px 0;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.12s ease;
  &:hover { color: var(--studio-text-primary); }
`

/* ── Helpers ── */

function getServerMeta(entry: McpServerEntry): string {
  if (entry.transport === 'http') return (entry.config as any).url || ''
  const cfg = entry.config as any
  return [cfg.command, ...(cfg.args || [])].join(' ')
}

function getStatusForDot(entry: McpServerEntry): 'running' | 'starting' | 'stopped' {
  if (!entry.enabled) return 'stopped'
  if (entry.status === 'error') return 'stopped'
  return 'running'
}

/* ── Component ── */

type ModalState =
  | null
  | { type: 'edit'; server: McpServerEntry }
  | { type: 'delete'; name: string }

export function McpSettings() {
  const navigate = useNavigate()
  const pid = useProjectStore((s) => s.activeProject?.id)
  const { servers, update, remove, toggle, testConnection } = useMcp()
  const [modal, setModal] = useState<ModalState>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; error?: string }>>({})

  const handleUpdate = async (name: string, config: McpServerConfig) => {
    await update({ name, config })
    setModal(null)
  }

  const handleTest = async (name: string) => {
    setTesting(name)
    setTestResults((prev) => { const next = { ...prev }; delete next[name]; return next })
    try {
      const result = await testConnection(name)
      setTestResults((prev) => ({ ...prev, [name]: result }))
    } catch {
      setTestResults((prev) => ({ ...prev, [name]: { ok: false, error: 'Test failed' } }))
    }
    setTesting(null)
    // Auto-clear success result after 5s
    setTimeout(() => {
      setTestResults((prev) => {
        if (prev[name]?.ok) {
          const next = { ...prev }; delete next[name]; return next
        }
        return prev
      })
    }, 5000)
  }

  return (
    <Wrap>
      <Header>
        <HeaderText>
          <Title>MCP Servers</Title>
          <Desc>Configure Model Context Protocol servers that extend Claude's capabilities.</Desc>
        </HeaderText>
        <AddBtn onClick={() => pid && navigate(mcpBrowserPath(pid))}>
          <Plus size={13} /> Add Server
        </AddBtn>
      </Header>

      {servers.length === 0 ? (
        <Empty>
          <EmptyIcon><Blocks size={20} /></EmptyIcon>
          <EmptyTitle>No MCP servers configured</EmptyTitle>
          <EmptyDesc>MCP servers give Claude access to external tools and data sources.</EmptyDesc>
          <EmptyBtn onClick={() => pid && navigate(mcpBrowserPath(pid))}>
            <Plus size={13} /> Browse Library
          </EmptyBtn>
        </Empty>
      ) : (
        <List>
          {servers.map((entry) => (
            <ServerRow key={entry.name}>
              <StatusDot status={getStatusForDot(entry)} size={6} />

              <ServerInfo>
                <ServerName>
                  {entry.name}
                  <TransportBadge>{entry.transport}</TransportBadge>
                </ServerName>
                <ServerMeta>{getServerMeta(entry)}</ServerMeta>
                {entry.error && <ServerError>{entry.error}</ServerError>}
                {testing === entry.name && (
                  <ServerMeta style={{ color: 'var(--studio-text-muted)', marginTop: '2px' }}>Testing connection...</ServerMeta>
                )}
                {testing !== entry.name && testResults[entry.name] && (
                  <ServerMeta
                    style={{
                      color: testResults[entry.name].ok ? 'var(--studio-green)' : 'var(--studio-error)',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {testResults[entry.name].ok ? 'Connected successfully' : (testResults[entry.name].error || 'Connection failed')}
                    <span
                      onClick={() => setTestResults((prev) => { const next = { ...prev }; delete next[entry.name]; return next })}
                      style={{ cursor: 'pointer', opacity: 0.6, fontSize: '10px' }}
                    >
                      ✕
                    </span>
                  </ServerMeta>
                )}
              </ServerInfo>

              <Actions className="server-actions">
                <IconBtn
                  onClick={() => testing !== entry.name && handleTest(entry.name)}
                  title="Test connection"
                  disabled={testing === entry.name}
                >
                  {testing === entry.name
                    ? <TestingIcon size={13} />
                    : testResults[entry.name]?.ok
                      ? <Check size={13} style={{ color: 'var(--studio-green)' }} />
                      : <Zap size={13} />
                  }
                </IconBtn>
                <IconBtn onClick={() => setModal({ type: 'edit', server: entry })} title="Edit">
                  <Pencil size={13} />
                </IconBtn>
                <IconBtn danger onClick={() => setModal({ type: 'delete', name: entry.name })} title="Remove">
                  <Trash2 size={13} />
                </IconBtn>
              </Actions>

              <Toggle
                active={entry.enabled}
                onClick={() => toggle({ name: entry.name, enabled: !entry.enabled })}
                title={entry.enabled ? 'Disable' : 'Enable'}
              />
            </ServerRow>
          ))}
        </List>
      )}

      {servers.length > 0 && (
        <BrowseLink onClick={() => pid && navigate(mcpBrowserPath(pid))}>
          Browse full library
          <ArrowRight size={13} />
        </BrowseLink>
      )}

      {modal?.type === 'edit' && (
        <McpServerModal
          server={modal.server}
          onSave={handleUpdate}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'delete' && (
        <ConfirmDialog
          title="Remove MCP Server"
          message={`Remove "${modal.name}"?`}
          description="This will remove the server from your project's .mcp.json configuration."
          confirmLabel="Remove"
          onConfirm={async () => { await remove(modal.name); setModal(null) }}
          onCancel={() => setModal(null)}
        />
      )}
    </Wrap>
  )
}
