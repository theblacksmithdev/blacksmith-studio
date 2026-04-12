import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex, SimpleGrid } from '@chakra-ui/react'
import { Wand2 } from 'lucide-react'
import { useSkills } from '@/hooks/use-skills'
import { SKILL_PRESETS, SKILL_CATEGORIES, type SkillPreset } from '@/pages/settings/components/skills-library/presets'
import { SkillEditorModal } from '@/pages/settings/components/skills-library'
import { LibraryHeader, LibraryCategoryTabs, LibraryPresetCard, LibraryEmptySearch } from '@/components/shared/library-browser'
import type { SkillEntry } from '@/api/modules/skills'

export default function SkillsBrowserPage() {
  const navigate = useNavigate()
  const { skills, add } = useSkills()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editor, setEditor] = useState<{ preset?: SkillPreset; custom?: boolean } | null>(null)

  const installedNames = new Set(skills.map((s) => s.name))
  const installedCount = SKILL_PRESETS.filter((p) => installedNames.has(p.name)).length

  const filtered = SKILL_PRESETS.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.name.includes(q)
    }
    return true
  })

  const handleAdd = async (name: string, description: string, content: string) => {
    await add({ name, description, content })
    setEditor(null)
  }

  if (editor) {
    const skill: SkillEntry | undefined = editor.preset
      ? { name: editor.preset.name, description: editor.preset.description, content: editor.preset.content }
      : undefined
    return <SkillEditorModal skill={skill} onSave={handleAdd} onClose={() => setEditor(null)} />
  }

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
    </Flex>
  )
}
