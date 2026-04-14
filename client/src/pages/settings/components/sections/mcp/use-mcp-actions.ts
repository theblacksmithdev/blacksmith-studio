import { useState, useCallback } from 'react'
import { useMcpServersQuery, useUpdateMcpServer, useRemoveMcpServer, useToggleMcpServer, useTestMcpServer } from '@/api/hooks/mcp'
import type { McpServerConfig, McpServerEntry } from '@/api/modules/mcp'

export type McpModalState =
  | null
  | { type: 'edit'; server: McpServerEntry }
  | { type: 'delete'; name: string }

export function useMcpActions() {
  const { data: servers = [] } = useMcpServersQuery()
  const updateMutation = useUpdateMcpServer()
  const removeMutation = useRemoveMcpServer()
  const toggleMutation = useToggleMcpServer()
  const testMutation = useTestMcpServer()
  const [modal, setModal] = useState<McpModalState>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; error?: string }>>({})

  const handleUpdate = useCallback(async (name: string, config: McpServerConfig) => {
    await updateMutation.mutateAsync({ name, config })
    setModal(null)
  }, [updateMutation])

  const handleRemove = useCallback(async () => {
    if (modal?.type === 'delete') {
      await removeMutation.mutateAsync(modal.name)
      setModal(null)
    }
  }, [modal, removeMutation])

  const handleTest = useCallback(async (name: string) => {
    setTesting(name)
    setTestResults((prev) => { const next = { ...prev }; delete next[name]; return next })
    try {
      const result = await testMutation.mutateAsync(name)
      setTestResults((prev) => ({ ...prev, [name]: result }))
    } catch (err: any) {
      const message = err?.message || String(err) || 'Connection failed'
      setTestResults((prev) => ({ ...prev, [name]: { ok: false, error: message } }))
    }
    setTesting(null)
    setTimeout(() => {
      setTestResults((prev) => {
        if (prev[name]?.ok) {
          const next = { ...prev }; delete next[name]; return next
        }
        return prev
      })
    }, 5000)
  }, [testMutation])

  const toggle = useCallback(async (data: { name: string; enabled: boolean }) => {
    await toggleMutation.mutateAsync(data)
  }, [toggleMutation])

  const clearTestResult = useCallback((name: string) => {
    setTestResults((prev) => { const next = { ...prev }; delete next[name]; return next })
  }, [])

  return {
    servers,
    modal, setModal,
    testing, testResults, clearTestResult,
    handleUpdate, handleRemove, handleTest,
    toggle,
  }
}
