import { useState } from 'react'
import styled from '@emotion/styled'
import { X, Plus, Trash2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { McpServerConfig, McpServerEntry } from '@/api/modules/mcp'

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
  width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--studio-bg-surface);
  border-radius: 16px;
  border: 1px solid var(--studio-border);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--studio-border);
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

const Body = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-secondary);
`

const Hint = styled.div`
  font-size: 11px;
  color: var(--studio-text-muted);
`

const Input = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-inset);
  color: var(--studio-text-primary);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  &:focus { border-color: var(--studio-border-hover); }
  &::placeholder { color: var(--studio-text-muted); }
`

const SegmentedControl = styled.div`
  display: flex;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  overflow: hidden;
`

const Segment = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 7px 14px;
  border: none;
  background: ${({ active }) => (active ? 'var(--studio-accent)' : 'var(--studio-bg-surface)')};
  color: ${({ active }) => (active ? 'var(--studio-accent-fg)' : 'var(--studio-text-secondary)')};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.1s ease;
`

const KvRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`

const KvInput = styled(Input)`
  flex: 1;
  padding: 6px 10px;
  font-size: 12px;
`

const SmallBtn = styled.button`
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  &:hover { color: var(--studio-error); background: rgba(239,68,68,0.08); }
`

const AddKvBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  padding: 4px 0;
  &:hover { color: var(--studio-text-primary); }
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--studio-border);
  justify-content: flex-end;
`

const CancelBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--studio-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: var(--studio-bg-hover); }
`

const SaveBtn = styled.button`
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: default; }
`

type Transport = 'stdio' | 'http'

interface McpServerModalProps {
  server?: McpServerEntry
  onSave: (name: string, config: McpServerConfig) => void
  onClose: () => void
}

export function McpServerModal({ server, onSave, onClose }: McpServerModalProps) {
  const isEdit = !!server
  const [transport, setTransport] = useState<Transport>(server?.transport ?? 'stdio')
  const [name, setName] = useState(server?.name ?? '')
  const [command, setCommand] = useState((server?.config as any)?.command ?? '')
  const [args, setArgs] = useState((server?.config as any)?.args?.join(' ') ?? '')
  const [url, setUrl] = useState((server?.config as any)?.url ?? '')
  const [envPairs, setEnvPairs] = useState<[string, string][]>(
    Object.entries((server?.config as any)?.env ?? {})
  )
  const [headerPairs, setHeaderPairs] = useState<[string, string][]>(
    Object.entries((server?.config as any)?.headers ?? {})
  )

  const canSave = name.trim() && (
    transport === 'stdio' ? command.trim() : url.trim()
  )

  const handleSave = () => {
    if (!canSave) return

    let config: McpServerConfig
    if (transport === 'stdio') {
      config = {
        command: command.trim(),
        ...(args.trim() ? { args: args.trim().split(/\s+/) } : {}),
        ...(envPairs.length > 0 ? { env: Object.fromEntries(envPairs.filter(([k]) => k.trim())) } : {}),
      }
    } else {
      config = {
        url: url.trim(),
        ...(headerPairs.length > 0 ? { headers: Object.fromEntries(headerPairs.filter(([k]) => k.trim())) } : {}),
      }
    }

    onSave(name.trim(), config)
  }

  return createPortal(
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{isEdit ? 'Edit MCP Server' : 'Add MCP Server'}</Title>
          <CloseBtn onClick={onClose}><X size={15} /></CloseBtn>
        </Header>

        <Body>
          <Field>
            <Label>Server Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. github, filesystem"
              disabled={isEdit}
            />
          </Field>

          <Field>
            <Label>Transport</Label>
            <SegmentedControl>
              <Segment active={transport === 'stdio'} onClick={() => setTransport('stdio')}>
                stdio (local)
              </Segment>
              <Segment active={transport === 'http'} onClick={() => setTransport('http')}>
                HTTP / SSE
              </Segment>
            </SegmentedControl>
          </Field>

          {transport === 'stdio' ? (
            <>
              <Field>
                <Label>Command</Label>
                <Input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="e.g. npx, node, python" />
              </Field>
              <Field>
                <Label>Arguments</Label>
                <Input value={args} onChange={(e) => setArgs(e.target.value)} placeholder="e.g. -y @modelcontextprotocol/server-github" />
                <Hint>Space-separated arguments</Hint>
              </Field>
              <Field>
                <Label>Environment Variables</Label>
                {envPairs.map(([k, v], i) => (
                  <KvRow key={i}>
                    <KvInput placeholder="KEY" value={k} onChange={(e) => { const n = [...envPairs]; n[i] = [e.target.value, v]; setEnvPairs(n) }} />
                    <KvInput placeholder="Value" value={v} onChange={(e) => { const n = [...envPairs]; n[i] = [k, e.target.value]; setEnvPairs(n) }} />
                    <SmallBtn onClick={() => setEnvPairs(envPairs.filter((_, j) => j !== i))}><Trash2 size={12} /></SmallBtn>
                  </KvRow>
                ))}
                <AddKvBtn onClick={() => setEnvPairs([...envPairs, ['', '']])}><Plus size={12} /> Add variable</AddKvBtn>
              </Field>
            </>
          ) : (
            <>
              <Field>
                <Label>Server URL</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g. http://localhost:3001/sse" />
              </Field>
              <Field>
                <Label>Headers</Label>
                {headerPairs.map(([k, v], i) => (
                  <KvRow key={i}>
                    <KvInput placeholder="Header" value={k} onChange={(e) => { const n = [...headerPairs]; n[i] = [e.target.value, v]; setHeaderPairs(n) }} />
                    <KvInput placeholder="Value" value={v} onChange={(e) => { const n = [...headerPairs]; n[i] = [k, e.target.value]; setHeaderPairs(n) }} />
                    <SmallBtn onClick={() => setHeaderPairs(headerPairs.filter((_, j) => j !== i))}><Trash2 size={12} /></SmallBtn>
                  </KvRow>
                ))}
                <AddKvBtn onClick={() => setHeaderPairs([...headerPairs, ['', '']])}><Plus size={12} /> Add header</AddKvBtn>
              </Field>
            </>
          )}
        </Body>

        <Footer>
          <CancelBtn onClick={onClose}>Cancel</CancelBtn>
          <SaveBtn disabled={!canSave} onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Add Server'}
          </SaveBtn>
        </Footer>
      </Modal>
    </Overlay>,
    document.body,
  )
}
