import { useState, useCallback } from 'react'
import { useSkillsListQuery, useUpdateSkill, useRemoveSkill } from '@/api/hooks/skills'
import type { SkillEntry } from '@/api/modules/skills'

export type SkillModalState =
  | null
  | { type: 'edit'; skill: SkillEntry }
  | { type: 'delete'; name: string }

export function useSkillsActions() {
  const { data: skills = [] } = useSkillsListQuery()
  const updateMutation = useUpdateSkill()
  const removeMutation = useRemoveSkill()
  const [modal, setModal] = useState<SkillModalState>(null)

  const handleUpdate = useCallback(async (name: string, description: string, content: string) => {
    await updateMutation.mutateAsync({ name, description, content })
    setModal(null)
  }, [updateMutation])

  const handleRemove = useCallback(async () => {
    if (modal?.type === 'delete') {
      await removeMutation.mutateAsync(modal.name)
      setModal(null)
    }
  }, [modal, removeMutation])

  return { skills, modal, setModal, handleUpdate, handleRemove }
}
