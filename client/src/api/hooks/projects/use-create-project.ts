import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import type { ProjectCreateInput } from "@/api/types";

/**
 * Kicks off project creation (scaffolding via CLI).
 * Returns `{ started: true }` immediately — listen for push events
 * via `api.projects.onCreateOutput/onCreateDone/onCreateError` for progress.
 */
export function useCreateProject() {
  return useMutation({
    mutationFn: (input: ProjectCreateInput) => api.projects.create(input),
  });
}
