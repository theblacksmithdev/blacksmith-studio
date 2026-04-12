import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex, SimpleGrid } from '@chakra-ui/react'
import { Blocks } from 'lucide-react'
import { useMcp } from '@/hooks/use-mcp'
import { PRESETS, CATEGORIES, type McpPreset } from '@/pages/settings/components/mcp-library/presets'
import { McpServerModal } from './components/mcp-server-modal'
import { LibraryHeader, LibraryCategoryTabs, LibraryPresetCard, LibraryEmptySearch } from '@/components/shared/library-browser'
import type { McpServerConfig, McpServerEntry } from '@/api/modules/mcp'

export default function McpBrowserPage() {
  const navigate = useNavigate()
  const { servers, add } = useMcp()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editor, setEditor] = useState<{ preset?: McpPreset; custom?: boolean } | null>(null)

  const installedNames = new Set(servers.map((s) => s.name))
  const installedCount = PRESETS.filter((p) => installedNames.has(p.name)).length

  const filtered = PRESETS.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.name.includes(q)
    }
    return true
  })

  const handleAdd = async (name: string, config: McpServerConfig) => {
    await add({ name, config })
    setEditor(null)
  }

  if (editor) {
    const server: McpServerEntry | undefined = editor.preset
      ? { name: editor.preset.name, transport: 'command' in editor.preset.config ? 'stdio' : 'http', config: editor.preset.config, enabled: true, status: 'unknown' }
      : undefined
    return <McpServerModal server={server} onSave={handleAdd} onClose={() => setEditor(null)} />
  }

  return (
    <Flex direction="column" css={{ height: '100%', background: 'var(--studio-bg-main)' }}>
      <LibraryHeader
        icon={<Blocks size={16} style={{ color: 'var(--studio-text-muted)' }} />}
        title="MCP Servers"
        installedCount={installedCount}
        search={search}
        onSearchChange={setSearch}
        resultCount={filtered.length}
        totalCount={PRESETS.length}
        customLabel="Custom Server"
        onBack={() => navigate(-1)}
        onAddCustom={() => setEditor({ custom: true })}
      />
      <LibraryCategoryTabs
        categories={CATEGORIES}
        getCategoryCount={(id) => id === 'all' ? PRESETS.length : PRESETS.filter((p) => p.category === id).length}
        active={category}
        onChange={setCategory}
      />
      <Flex direction="column" css={{ flex: 1, overflowY: 'auto', padding: '18px 24px 32px' }}>
        {filtered.length === 0 ? (
          <LibraryEmptySearch customLabel="Add Custom Server" onAddCustom={() => setEditor({ custom: true })} />
        ) : (
          <SimpleGrid columns={3} gap="12px" css={{ maxWidth: '960px', margin: '0 auto', width: '100%', minChildWidth: '260px' }}>
            {filtered.map((preset) => (
              <LibraryPresetCard
                key={preset.name}
                icon={preset.icon}
                label={preset.label}
                name={preset.name}
                description={preset.description}
                category={preset.category}
                installed={installedNames.has(preset.name)}
                hint={preset.envHint}
                onClick={() => setEditor({ preset })}
              />
            ))}
          </SimpleGrid>
        )}
      </Flex>
    </Flex>
  )
}
