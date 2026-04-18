import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { ArtifactCreateInput } from "@/api/types";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/** Overwrite an artifact's markdown body in place. */
export function useWriteArtifactContent() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.artifacts.writeContent(id, content),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: keys.artifact(vars.id) });
      queryClient.invalidateQueries({
        queryKey: keys.artifactContent(vars.id),
      });
      queryClient.invalidateQueries({ queryKey: keys.artifacts });
    },
  });
}

export function useRenameArtifact() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.artifacts.rename(id, title),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: keys.artifact(vars.id) });
      queryClient.invalidateQueries({ queryKey: keys.artifacts });
    },
  });
}

export function useDeleteArtifact() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: (id: string) => api.artifacts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.artifacts });
    },
  });
}

export function useSetArtifactTags() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      api.artifacts.setTags(id, tags),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: keys.artifact(vars.id) });
      queryClient.invalidateQueries({ queryKey: keys.artifacts });
    },
  });
}

export function useCreateArtifact() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: (input: ArtifactCreateInput) => api.artifacts.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.artifacts });
    },
  });
}

export function useBackfillArtifacts() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: () => api.artifacts.backfill(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.artifacts });
    },
  });
}
