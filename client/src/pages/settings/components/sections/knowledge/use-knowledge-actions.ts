import { useState, useCallback } from 'react'
import { api } from '@/api'
import { useKnowledgeListQuery, useCreateKnowledge, useSaveKnowledge, useRemoveKnowledge } from '@/api/hooks/knowledge'
import { useActiveProjectId } from '@/api/hooks/_shared'
import type { KnowledgeDocContent } from '@/api/modules/knowledge'

export type KnowledgeModalState =
  | null
  | { type: 'create' }
  | { type: 'edit'; doc: KnowledgeDocContent }
  | { type: 'delete'; name: string }

export function useKnowledgeActions() {
  const { data: docs = [] } = useKnowledgeListQuery()
  const createMutation = useCreateKnowledge()
  const saveMutation = useSaveKnowledge()
  const removeMutation = useRemoveKnowledge()
  const projectId = useActiveProjectId()
  const [modal, setModal] = useState<KnowledgeModalState>(null)
  const [newName, setNewName] = useState('')
  const [editContent, setEditContent] = useState('')

  const openDoc = useCallback(async (name: string) => {
    if (!projectId) return
    const doc = await api.knowledge.get(projectId, name)
    if (doc) {
      setEditContent(doc.content)
      setModal({ type: 'edit', doc })
    }
  }, [projectId])

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return
    await createMutation.mutateAsync(newName.trim())
    setNewName('')
    setModal(null)
  }, [newName, createMutation])

  const handleSave = useCallback(async () => {
    if (modal?.type === 'edit') {
      await saveMutation.mutateAsync({ name: modal.doc.name, content: editContent })
      setModal(null)
    }
  }, [modal, editContent, saveMutation])

  const handleRemove = useCallback(async () => {
    if (modal?.type === 'delete') {
      await removeMutation.mutateAsync(modal.name)
      setModal(null)
    }
  }, [modal, removeMutation])

  const closeModal = useCallback(() => {
    setModal(null)
    setNewName('')
  }, [])

  return {
    docs, modal, setModal,
    newName, setNewName,
    editContent, setEditContent,
    openDoc, handleCreate, handleSave, handleRemove, closeModal,
  }
}
