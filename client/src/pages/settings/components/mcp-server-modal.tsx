import { useState } from 'react'
import { VStack } from '@chakra-ui/react'
import type { McpServerConfig, McpServerEntry } from '@/api/modules/mcp'
import { Modal, PrimaryButton, GhostButton, FooterSpacer } from '@/components/shared/modal'
import { FormField, FormInput, SegmentedControl, KvEditor } from '@/components/shared/form-controls'

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
      width="480px"
      footer={
        <>
          <FooterSpacer />
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton disabled={!canSave} onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Add Server'}
          </PrimaryButton>
        </>
      }
    >
      <VStack gap={4} align="stretch">
        <FormField label="Server Name">
          <FormInput
            value={name}
            onChange={setName}
            placeholder="e.g. github, filesystem"
            disabled={isEdit}
          />
        </FormField>

        <FormField label="Transport">
          <SegmentedControl
            options={[
              { value: 'stdio', label: 'stdio (local)' },
              { value: 'http', label: 'HTTP / SSE' },
            ]}
            value={transport}
            onChange={(v) => setTransport(v as Transport)}
          />
        </FormField>

        {transport === 'stdio' ? (
          <>
            <FormField label="Command">
              <FormInput value={command} onChange={setCommand} placeholder="e.g. npx, node, python" />
            </FormField>
            <FormField label="Arguments" hint="Space-separated arguments">
              <FormInput value={args} onChange={setArgs} placeholder="e.g. -y @modelcontextprotocol/server-github" />
            </FormField>
            <FormField label="Environment Variables">
              <KvEditor
                pairs={envPairs}
                onChange={setEnvPairs}
                keyPlaceholder="KEY"
                valuePlaceholder="Value"
                addLabel="Add variable"
              />
            </FormField>
          </>
        ) : (
          <>
            <FormField label="Server URL">
              <FormInput value={url} onChange={setUrl} placeholder="e.g. http://localhost:3001/sse" />
            </FormField>
            <FormField label="Headers">
              <KvEditor
                pairs={headerPairs}
                onChange={setHeaderPairs}
                keyPlaceholder="Header"
                valuePlaceholder="Value"
                addLabel="Add header"
              />
            </FormField>
          </>
        )}
      </VStack>
    </Modal>
  )
}
