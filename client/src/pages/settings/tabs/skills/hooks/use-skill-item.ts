import { useCallback } from "react";
import { useRemoveSkill } from "@/api/hooks/skills";
import type { SkillEntry } from "@/api/modules/skills";

/**
 * Per-skill actions — remove.
 * Used inside each SkillRow so the page hook stays clean.
 */
export function useSkillItem(skill: SkillEntry) {
  const removeMutation = useRemoveSkill();

  const remove = useCallback(() => {
    removeMutation.mutate(skill.name);
  }, [removeMutation, skill.name]);

  return {
    remove,
    isRemoving: removeMutation.isPending,
  };
}
