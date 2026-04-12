import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { runnerConfigSchema, type RunnerConfigFormData } from '../schema'
import type { RunnerConfigData } from '@/api/types'

function configToDefaults(config: RunnerConfigData): RunnerConfigFormData {
  return {
    name: config.name,
    command: config.command,
    setupCommand: config.setupCommand || '',
    cwd: config.cwd || '.',
    port: config.port ? String(config.port) : '',
    readyPattern: config.readyPattern || '',
    previewUrl: config.previewUrl || '',
    icon: config.icon || 'terminal',
    env: Object.entries(config.env || {}).map(([key, value]) => ({ key, value })),
  }
}

export function toPayload(data: RunnerConfigFormData): Partial<RunnerConfigData> {
  const env: Record<string, string> = {}
  for (const e of data.env) {
    if (e.key.trim()) env[e.key.trim()] = e.value
  }
  return {
    name: data.name.trim(),
    command: data.command.trim(),
    setupCommand: data.setupCommand?.trim() || null,
    cwd: data.cwd?.trim() || '.',
    port: data.port ? parseInt(data.port, 10) || null : null,
    readyPattern: data.readyPattern?.trim() || null,
    previewUrl: data.previewUrl?.trim() || null,
    icon: data.icon || 'terminal',
    env,
  }
}

export function useConfigForm(config?: RunnerConfigData | null) {
  const form = useForm<RunnerConfigFormData>({
    resolver: zodResolver(runnerConfigSchema),
    mode: 'onChange',
    defaultValues: config ? configToDefaults(config) : {
      name: '', command: '', setupCommand: '', cwd: '.', port: '',
      readyPattern: '', previewUrl: '', icon: 'terminal', env: [],
    },
  })

  const envArray = useFieldArray({ control: form.control, name: 'env' })

  return { form, envArray }
}
