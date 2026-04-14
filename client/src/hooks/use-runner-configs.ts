import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '@/api'
import { useProjectKeys } from './use-project-keys'
import type { RunnerConfigData } from '@/api/types'

/** Fetch runner configs for the active project (from DB). */
export function useRunnerConfigs() {
  const keys = useProjectKeys()
  const { projectId } = useParams<{ projectId: string }>()

  const query = useQuery({
    queryKey: keys.runnerConfigs,
    queryFn: () => api.runner.getConfigs(projectId!),
    enabled: !!projectId,
  })

  return {
    configs: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

/** Trigger smart detection + seed for the active project. */
export function useDetectRunners() {
  const keys = useProjectKeys()
  const qc = useQueryClient()
  const { projectId } = useParams<{ projectId: string }>()

  return useMutation({
    mutationFn: () => api.runner.detectRunners(projectId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs })
    },
  })
}

/** Add a new runner config. */
export function useAddRunnerConfig() {
  const keys = useProjectKeys()
  const qc = useQueryClient()
  const { projectId } = useParams<{ projectId: string }>()

  return useMutation({
    mutationFn: (data: Partial<RunnerConfigData>) => api.runner.addConfig(projectId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs })
    },
  })
}

/** Update an existing runner config. */
export function useUpdateRunnerConfig() {
  const keys = useProjectKeys()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RunnerConfigData> }) =>
      api.runner.updateConfig(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs })
    },
  })
}

/** Remove a runner config. */
export function useRemoveRunnerConfig() {
  const keys = useProjectKeys()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.runner.removeConfig(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs })
    },
  })
}
