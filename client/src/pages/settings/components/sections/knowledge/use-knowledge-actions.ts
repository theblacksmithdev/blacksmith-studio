import { useState, useCallback } from 'react'
import { useKnowledge } from '@/hooks/use-knowledge'
import type { KnowledgeDocContent } from '@/api/modules/knowledge'

export type KnowledgeModalState =
  | null
  | { type: 'create' }
  | { type: 'edit'; doc: KnowledgeDocContent }
  | { type: 'delete'; name: string }

export function useKnowledgeActions() {
  const { docs, getDoc, create, save, remove } = useKnowledge()
  const [modal, setModal] = useState<KnowledgeModalState>(null)
  const [newName, setNewName] = useState('')
  const [editContent, setEditContent] = useState('')

  const openDoc = useCallback(async (name: string) => {
    const doc = await getDoc(name)
    if (doc) {
      setEditContent(doc.content)
      setModal({ type: 'edit', doc })
    }
  }, [getDoc])

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return
    await create(newName.trim())
    setNewName('')
    setModal(null)
  }, [newName, create])

  const handleSave = useCallback(async () => {
    if (modal?.type === 'edit') {
      await save({ name: modal.doc.name, content: editContent })
      setModal(null)
    }
  }, [modal, editContent, save])

  const handleRemove = useCallback(async () => {
    if (modal?.type === 'delete') {
      await remove(modal.name)
      setModal(null)
    }
  }, [modal, remove])

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
