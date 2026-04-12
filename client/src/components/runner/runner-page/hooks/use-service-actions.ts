import { useState, useCallback } from 'react'
import { api } from '@/api'
import { useRunnerStore } from '@/stores/runner-store'
import { useRunnerConfigs, useAddRunnerConfig, useUpdateRunnerConfig, useRemoveRunnerConfig } from '@/hooks/use-runner-configs'
import { useRunner } from '@/hooks/use-runner'
import { useSessions } from '@/hooks/use-sessions'
import type { RunnerConfigData } from '@/api/types'
import { useActiveService } from './use-active-service'

export interface DiagnoseState {
  sessionId: string
  prompt: string
  title: string
}

export function useServiceActions() {
  const { activeId, selectService } = useActiveService()
  const { configs } = useRunnerConfigs()
  const addConfig = useAddRunnerConfig()
  const updateConfig = useUpdateRunnerConfig()
  const removeConfig = useRemoveRunnerConfig()
  const { start, stop, startAll, stopAll } = useRunner()
  const { createSession } = useSessions()
  const storeLogs = useRunnerStore((s) => s.logs)

  const [modalConfig, setModalConfig] = useState<RunnerConfigData | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [diagnoseDrawer, setDiagnoseDrawer] = useState<DiagnoseState | null>(null)

  const handleSave = useCallback((data: Partial<RunnerConfigData>) => {
    if (modalConfig === 'new') {
      addConfig.mutate(data)
    } else if (modalConfig) {
      updateConfig.mutate({ id: modalConfig.id, updates: data })
    }
  }, [modalConfig, addConfig, updateConfig])

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return
    stop(deleteTarget.id)
    removeConfig.mutate(deleteTarget.id)
    if (activeId === deleteTarget.id) selectService(null)
    setDeleteTarget(null)
  }, [deleteTarget, stop, removeConfig, activeId, selectService])

  const handleDiagnose = useCallback(async (svcId: string) => {
    const config = configs.find((c) => c.id === svcId)
    const recentLogs = storeLogs.filter((l) => l.configId === svcId).slice(-80).map((l) => l.line)

    const prompt = [
      `My dev service "${config?.name ?? 'Unknown'}" has issues. Please diagnose the error from the logs below and fix it.`,
      '',
      config ? [
        '## Service Configuration',
        `- Command: \`${config.command}\``,
        `- Working directory: \`${config.cwd}\``,
        config.port ? `- Port: ${config.port}` : null,
        Object.keys(config.env || {}).length > 0 ? `- Environment: ${JSON.stringify(config.env)}` : null,
      ].filter(Boolean).join('\n') : '',
      '',
      recentLogs.length > 0 ? `## Recent Logs\n\`\`\`\n${recentLogs.join('\n')}\n\`\`\`` : '## Logs\nNo log output available.',
      '',
      'Please:',
      '1. Identify the root cause of the error',
      '2. Fix any code or configuration issues in the project',
      '3. Explain what you changed and why',
    ].join('\n')

    const session = await createSession(`Fix: ${config?.name ?? 'service'} error`)
    if (session?.id) {
      setDiagnoseDrawer({ sessionId: session.id, prompt, title: `Fix: ${config?.name ?? 'Service'} Error` })
    }
  }, [configs, storeLogs, createSession])

  const handleSetup = useCallback((svcId: string) => {
    selectService(svcId)
    api.runner.setup(svcId).catch(() => {})
  }, [selectService])

  return {
    modalConfig, setModalConfig,
    deleteTarget, setDeleteTarget,
    diagnoseDrawer, setDiagnoseDrawer,
    handleSave, handleDelete, handleDiagnose, handleSetup,
    start, stop, startAll, stopAll,
  }
}
