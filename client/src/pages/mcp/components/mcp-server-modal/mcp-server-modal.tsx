import { useState } from 'react'
import { Flex } from '@chakra-ui/react'
import { Blocks } from 'lucide-react'
import { Modal, ModalPrimaryButton, ModalFooterSpacer, Button } from '@/components/shared/ui'
import { SegmentedControl } from '@/pages/settings/components/segmented-control'
import { FormField, FormInput } from './form-field'
import { KvEditor } from './kv-editor'
import type { McpServerConfig, McpServerEntry } from '@/api/modules/mcp'

type Transport = 'stdio' | 'http'

const TRANSPORT_OPTIONS = [
  { value: 'stdio', label: 'stdio (local)' },
  { value: 'http', label: 'HTTP / SSE' },
] as const

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
  const [envPairs, setEnvPairs] = useState<{ key: string; value: string }[]>(
    Object.entries((server?.config as any)?.env ?? {}).map(([key, value]) => ({ key, value: value as string }))
  )
  const [headerPairs, setHeaderPairs] = useState<{ key: string; value: string }[]>(
    Object.entries((server?.config as any)?.headers ?? {}).map(([key, value]) => ({ key, value: value as string }))
  )

  const canSave = name.trim() && (transport === 'stdio' ? command.trim() : url.trim())

  const handleSave = () => {
    if (!canSave) return

    let config: McpServerConfig
    if (transport === 'stdio') {
      config = {
        command: command.trim(),
        ...(args.trim() ? { args: args.trim().split(/\s+/) } : {}),
        ...(envPairs.length > 0 ? { env: Object.fromEntries(envPairs.filter((p) => p.key.trim()).map((p) => [p.key, p.value])) } : {}),
      }
    } else {
      config = {
        url: url.trim(),
        ...(headerPairs.length > 0 ? { headers: Object.fromEntries(headerPairs.filter((p) => p.key.trim()).map((p) => [p.key, p.value])) } : {}),
      }
    }

    onSave(name.trim(), config)
  }

  return (
    <Modal
      title={isEdit ? 'Edit MCP Server' : 'Add MCP Server'}
      onClose={onClose}
      width="500px"
      headerExtra={
        <Flex css={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          color: 'var(--studio-text-muted)',
        }}>
          <Blocks size={14} />
        </Flex>
      }
      footer={
        <>
          <ModalFooterSpacer />
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <ModalPrimaryButton disabled={!canSave} onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Add Server'}
          </ModalPrimaryButton>
        </>
      }
    >
      <Flex direction="column" gap="16px">
        <FormField label="Server Name">
          <FormInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. github, filesystem"
            disabled={isEdit}
          />
        </FormField>

        <FormField label="Transport">
          <SegmentedControl
            value={transport}
            options={[...TRANSPORT_OPTIONS]}
            onChange={(v) => setTransport(v as Transport)}
          />
        </FormField>

        {transport === 'stdio' ? (
          <>
            <FormField label="Command">
              <FormInput value={command} onChange={(e) => setCommand(e.target.value)} placeholder="e.g. npx, node, python" />
            </FormField>
            <FormField label="Arguments" hint="Space-separated arguments passed to the command">
              <FormInput value={args} onChange={(e) => setArgs(e.target.value)} placeholder="e.g. -y @modelcontextprotocol/server-github" />
            </FormField>
            <FormField label="Environment Variables">
              <KvEditor pairs={envPairs} onChange={setEnvPairs} keyPlaceholder="KEY" valuePlaceholder="Value" addLabel="Add variable" />
            </FormField>
          </>
        ) : (
          <>
            <FormField label="Server URL">
              <FormInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g. http://localhost:3001/sse" />
            </FormField>
            <FormField label="Headers">
              <KvEditor pairs={headerPairs} onChange={setHeaderPairs} keyPlaceholder="Header" valuePlaceholder="Value" addLabel="Add header" />
            </FormField>
          </>
        )}
      </Flex>
    </Modal>
  )
}
