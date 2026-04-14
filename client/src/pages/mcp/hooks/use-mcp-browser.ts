import { useState, useMemo, useCallback } from 'react'
import { useMcpServersQuery, useAddMcpServer } from '@/api/hooks/mcp'
import { PRESETS, type McpPreset } from '../components/presets'
import type { McpServerConfig, McpServerEntry } from '@/api/modules/mcp'

export function useMcpBrowser() {
  const { data: servers = [] } = useMcpServersQuery()
  const addMutation = useAddMcpServer()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editor, setEditor] = useState<{ preset?: McpPreset; custom?: boolean } | null>(null)

  const installedNames = useMemo(() => new Set(servers.map((s) => s.name)), [servers])
  const installedCount = useMemo(() => PRESETS.filter((p) => installedNames.has(p.name)).length, [installedNames])

  const filtered = useMemo(() => PRESETS.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.name.includes(q)
    }
    return true
  }), [category, search])

  const handleAdd = useCallback(async (name: string, config: McpServerConfig) => {
    await addMutation.mutateAsync({ name, config })
    setEditor(null)
  }, [addMutation])

  const editorServer: McpServerEntry | undefined = editor?.preset
    ? { name: editor.preset.name, transport: 'command' in editor.preset.config ? 'stdio' : 'http', config: editor.preset.config, enabled: true, status: 'unknown' }
    : undefined

  return {
    search,
    setSearch,
    category,
    setCategory,
    filtered,
    installedNames,
    installedCount,
    editor,
    setEditor,
    editorServer,
    handleAdd,
  }
}
