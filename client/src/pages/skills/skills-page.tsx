import { useNavigate } from 'react-router-dom'
import { Flex, SimpleGrid } from '@chakra-ui/react'
import { Wand2 } from 'lucide-react'
import { LibraryHeader, LibraryCategoryTabs, LibraryPresetCard, LibraryEmptySearch } from '@/components/shared/library-browser'
import { useSkillsBrowser } from './hooks'
import { SkillEditorModal, SKILL_PRESETS, SKILL_CATEGORIES } from './components'

export function SkillsBrowserPage() {
  const navigate = useNavigate()
  const {
    search, setSearch,
    category, setCategory,
    editor, setEditor,
    filtered,
    installedNames,
    installedCount,
    handleAdd,
  } = useSkillsBrowser()

  const editorSkill = editor?.preset
    ? { name: editor.preset.name, description: editor.preset.description, content: editor.preset.content }
    : undefined

  return (
    <Flex direction="column" css={{ height: '100%', background: 'var(--studio-bg-main)' }}>
      <LibraryHeader
        icon={<Wand2 size={16} style={{ color: 'var(--studio-text-muted)' }} />}
        title="Skills Library"
        installedCount={installedCount}
        search={search}
        onSearchChange={setSearch}
        resultCount={filtered.length}
        totalCount={SKILL_PRESETS.length}
        customLabel="Create Skill"
        onBack={() => navigate(-1)}
        onAddCustom={() => setEditor({ custom: true })}
      />
      <LibraryCategoryTabs
        categories={SKILL_CATEGORIES}
        getCategoryCount={(id) => id === 'all' ? SKILL_PRESETS.length : SKILL_PRESETS.filter((p) => p.category === id).length}
        active={category}
        onChange={setCategory}
      />
      <Flex direction="column" css={{ flex: 1, overflowY: 'auto', padding: '18px 24px 32px' }}>
        {filtered.length === 0 ? (
          <LibraryEmptySearch customLabel="Create Skill" onAddCustom={() => setEditor({ custom: true })} />
        ) : (
          <SimpleGrid columns={3} gap="12px" css={{ maxWidth: '960px', margin: '0 auto', width: '100%', minChildWidth: '260px' }}>
            {filtered.map((preset) => (
              <LibraryPresetCard
                key={preset.name}
                icon={preset.icon}
                label={preset.label}
                name={`/${preset.name}`}
                description={preset.description}
                category={preset.category}
                installed={installedNames.has(preset.name)}
                onClick={() => setEditor({ preset })}
              />
            ))}
          </SimpleGrid>
        )}
      </Flex>

      {editor && (
        <SkillEditorModal skill={editorSkill} onSave={handleAdd} onClose={() => setEditor(null)} />
      )}
    </Flex>
  )
}
