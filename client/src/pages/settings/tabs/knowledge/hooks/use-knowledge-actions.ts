import { useState } from 'react'
import { useKnowledgeListQuery } from '@/api/hooks/knowledge'

export type KnowledgeModalState =
  | null
  | { type: 'create' }
  | { type: 'edit'; name: string }
  | { type: 'delete'; name: string }

/**
 * Page-level knowledge state — doc list and modal state.
 * Create/save/remove are handled inside the modal/drawer components.
 */
export function useKnowledgeActions() {
  const { data: docs = [] } = useKnowledgeListQuery()
  const [modal, setModal] = useState<KnowledgeModalState>(null)

  const closeModal = () => setModal(null)

  return {
    docs,
    modal,
    setModal,
    closeModal,
  }
}
