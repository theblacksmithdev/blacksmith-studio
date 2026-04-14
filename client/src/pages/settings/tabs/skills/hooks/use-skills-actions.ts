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

  const handleUpdate = useCallback((name: string, description: string, content: string) => {
    updateMutation.mutate({ name, description, content }, {
      onSuccess() {
        setModal(null)
      },
    })
  }, [updateMutation])

  const handleRemove = useCallback(() => {
    if (modal?.type === 'delete') {
      removeMutation.mutate(modal.name, {
        onSuccess() {
          setModal(null)
        },
      })
    }
  }, [modal, removeMutation])

  return { skills, modal, setModal, handleUpdate, handleRemove }
}
