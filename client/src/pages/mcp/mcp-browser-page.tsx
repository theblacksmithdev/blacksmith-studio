import { useNavigate } from 'react-router-dom'
import { Flex, SimpleGrid } from '@chakra-ui/react'
import { Blocks } from 'lucide-react'
import { PRESETS, CATEGORIES } from './components/presets'
import { McpServerModal } from './components/mcp-server-modal'
import { LibraryHeader, LibraryCategoryTabs, LibraryPresetCard, LibraryEmptySearch } from '@/components/shared/library-browser'
import { useMcpBrowser } from './hooks/use-mcp-browser'

export default function McpBrowserPage() {
  const navigate = useNavigate()
  const {
    search, setSearch,
    category, setCategory,
    filtered,
    installedNames,
    installedCount,
    editor, setEditor,
    editorServer,
    handleAdd,
  } = useMcpBrowser()

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

      {editor && (
        <McpServerModal server={editorServer} onSave={handleAdd} onClose={() => setEditor(null)} />
      )}
    </Flex>
  )
}
