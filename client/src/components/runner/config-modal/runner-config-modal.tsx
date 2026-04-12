import { useState, useEffect } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { Terminal } from 'lucide-react'
import { Modal, ModalFooterSpacer, Button, Input, Text, spacing, radii } from '@/components/shared/ui'
import type { RunnerConfigData } from '@/api/types'

type ConfigFormData = {
  name: string
  command: string
  cwd: string
  port: string
  portArg: string
  readyPattern: string
  previewUrl: string
  icon: string
  env: string
}

const EMPTY_FORM: ConfigFormData = {
  name: '',
  command: '',
  cwd: '.',
  port: '',
  portArg: '',
  readyPattern: '',
  previewUrl: '',
  icon: 'terminal',
  env: '',
}

function configToForm(config: RunnerConfigData): ConfigFormData {
  return {
    name: config.name,
    command: config.command,
    cwd: config.cwd || '.',
    port: config.port ? String(config.port) : '',
    portArg: config.portArg || '',
    readyPattern: config.readyPattern || '',
    previewUrl: config.previewUrl || '',
    icon: config.icon || 'terminal',
    env: Object.keys(config.env || {}).length > 0
      ? Object.entries(config.env).map(([k, v]) => `${k}=${v}`).join('\n')
      : '',
  }
}

function formToPayload(form: ConfigFormData): Partial<RunnerConfigData> {
  const env: Record<string, string> = {}
  if (form.env.trim()) {
    for (const line of form.env.split('\n')) {
      const idx = line.indexOf('=')
      if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
    }
  }

  return {
    name: form.name.trim(),
    command: form.command.trim(),
    cwd: form.cwd.trim() || '.',
    port: form.port ? parseInt(form.port, 10) || null : null,
    portArg: form.portArg.trim() || null,
    readyPattern: form.readyPattern.trim() || null,
    previewUrl: form.previewUrl.trim() || null,
    icon: form.icon || 'terminal',
    env,
  }
}

interface Field {
  label: string
  key: keyof ConfigFormData
  placeholder: string
  hint?: string
  multiline?: boolean
}

const FIELDS: Field[] = [
  { label: 'Name', key: 'name', placeholder: 'Frontend' },
  { label: 'Command', key: 'command', placeholder: 'npm run dev -- --port {port}', hint: 'Use {port} as a placeholder for the resolved port' },
  { label: 'Working directory', key: 'cwd', placeholder: '.', hint: 'Relative to project root' },
  { label: 'Default port', key: 'port', placeholder: '3000' },
  { label: 'Ready pattern', key: 'readyPattern', placeholder: 'Local:|ready|listening', hint: 'Regex matched against stdout to detect "running"' },
  { label: 'Preview URL', key: 'previewUrl', placeholder: 'http://localhost:{port}/', hint: '{port} is replaced at runtime' },
  { label: 'Environment variables', key: 'env', placeholder: 'FORCE_COLOR=0\nNODE_ENV=development', hint: 'One KEY=VALUE per line', multiline: true },
]

interface RunnerConfigModalProps {
  config?: RunnerConfigData | null
  onSave: (data: Partial<RunnerConfigData>) => void
  onClose: () => void
}

export function RunnerConfigModal({ config, onSave, onClose }: RunnerConfigModalProps) {
  const isEdit = !!config
  const [form, setForm] = useState<ConfigFormData>(config ? configToForm(config) : EMPTY_FORM)

  const update = (key: keyof ConfigFormData, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const canSave = form.name.trim().length > 0 && form.command.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    onSave(formToPayload(form))
    onClose()
  }

  return (
    <Modal
      title={isEdit ? 'Edit Service' : 'Add Service'}
      onClose={onClose}
      width="480px"
      headerExtra={<Terminal size={16} style={{ color: 'var(--studio-text-muted)' }} />}
      footer={
        <>
          <ModalFooterSpacer />
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={!canSave}>
            {isEdit ? 'Save' : 'Add Service'}
          </Button>
        </>
      }
    >
      <Flex direction="column" gap={spacing.lg}>
        {FIELDS.map((field) => (
          <Box key={field.key}>
            <Text variant="bodySmall" css={{ fontWeight: 500, marginBottom: spacing.xs, color: 'var(--studio-text-secondary)' }}>
              {field.label}
            </Text>
            {field.multiline ? (
              <textarea
                value={form[field.key]}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                style={{
                  width: '100%',
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: radii.md,
                  border: '1px solid var(--studio-border)',
                  background: 'var(--studio-bg-inset)',
                  color: 'var(--studio-text-primary)',
                  fontSize: '13px',
                  fontFamily: "'SF Mono', monospace",
                  lineHeight: 1.5,
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            ) : (
              <Input
                size="sm"
                value={form[field.key]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                css={field.key === 'command' ? { fontFamily: "'SF Mono', monospace" } : {}}
              />
            )}
            {field.hint && (
              <Text variant="tiny" color="muted" css={{ marginTop: spacing.xs }}>
                {field.hint}
              </Text>
            )}
          </Box>
        ))}
      </Flex>
    </Modal>
  )
}
