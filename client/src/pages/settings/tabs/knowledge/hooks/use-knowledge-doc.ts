import { useState, useEffect, useCallback } from "react";
import {
  useKnowledgeQuery,
  useSaveKnowledge,
  useRemoveKnowledge,
} from "@/api/hooks/knowledge";

/**
 * Manages a single knowledge document — query, edit, save, remove.
 */
export function useKnowledgeDoc(name: string | undefined) {
  const { data: doc } = useKnowledgeQuery(name);
  const saveMutation = useSaveKnowledge();
  const removeMutation = useRemoveKnowledge();
  const [editContent, setEditContent] = useState("");

  // Sync edit content when doc loads or changes
  useEffect(() => {
    if (doc) setEditContent(doc.content);
  }, [doc]);

  const save = useCallback(
    (onSuccess?: () => void) => {
      if (!name) return;
      saveMutation.mutate({ name, content: editContent }, { onSuccess });
    },
    [name, editContent, saveMutation],
  );

  const remove = useCallback(
    (onSuccess?: () => void) => {
      if (!name) return;
      removeMutation.mutate(name, { onSuccess });
    },
    [name, removeMutation],
  );

  return {
    doc,
    editContent,
    setEditContent,
    save,
    remove,
    isSaving: saveMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
