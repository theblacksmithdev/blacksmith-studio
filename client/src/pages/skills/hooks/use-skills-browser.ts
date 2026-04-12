import { useState, useMemo, useCallback } from 'react'
import { useSkills } from '@/hooks/use-skills'
import { SKILL_PRESETS, type SkillPreset } from '../components/presets'

export function useSkillsBrowser() {
  const { skills, add } = useSkills()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editor, setEditor] = useState<{ preset?: SkillPreset; custom?: boolean } | null>(null)

  const installedNames = useMemo(() => new Set(skills.map((s) => s.name)), [skills])
  const installedCount = useMemo(() => SKILL_PRESETS.filter((p) => installedNames.has(p.name)).length, [installedNames])

  const filtered = useMemo(() => SKILL_PRESETS.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.name.includes(q)
    }
    return true
  }), [category, search])

  const handleAdd = useCallback(async (name: string, description: string, content: string) => {
    await add({ name, description, content })
    setEditor(null)
  }, [add])

  return {
    search, setSearch,
    category, setCategory,
    editor, setEditor,
    filtered,
    installedNames,
    installedCount,
    handleAdd,
  }
}
