import { useState, useCallback } from 'react'
import { useSkills } from '@/hooks/use-skills'
import type { SkillEntry } from '@/api/modules/skills'

export type SkillModalState =
  | null
  | { type: 'edit'; skill: SkillEntry }
  | { type: 'delete'; name: string }

export function useSkillsActions() {
  const { skills, update, remove } = useSkills()
  const [modal, setModal] = useState<SkillModalState>(null)

  const handleUpdate = useCallback(async (name: string, description: string, content: string) => {
    await update({ name, description, content })
    setModal(null)
  }, [update])

  const handleRemove = useCallback(async () => {
    if (modal?.type === 'delete') {
      await remove(modal.name)
      setModal(null)
    }
  }, [modal, remove])

  return { skills, modal, setModal, handleUpdate, handleRemove }
}
