import { useState, useMemo } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { Play, Square, PanelRight, Plus, Pencil, Trash2 } from 'lucide-react'
import { useRunnerStore, selectServices, selectIsAnyActive, isServiceActive, type RunnerService } from '@/stores/runner-store'
import { useRunnerConfigs, useAddRunnerConfig, useUpdateRunnerConfig, useRemoveRunnerConfig } from '@/hooks/use-runner-configs'
import { useRunner } from '@/hooks/use-runner'
import { useUiStore } from '@/stores/ui-store'
import { getServiceIcon, StatusDot } from './runner-primitives'
import { RunnerLogs } from './logs'
import { RunnerConfigModal } from './config-modal'
import { PreviewPanel } from '@/components/shared/preview-panel'
import { SplitPanel } from '@/components/shared/layout'
import { Text, IconButton, Tooltip, Badge, Skeleton, ConfirmDialog, spacing, radii } from '@/components/shared/ui'
import type { RunnerConfigData } from '@/api/types'

function ServiceListPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const { configs, isLoading: configsLoading } = useRunnerConfigs()
  const liveServices = useRunnerStore(selectServices)
  const anyActive = useRunnerStore(selectIsAnyActive)
  const addConfig = useAddRunnerConfig()
  const updateConfig = useUpdateRunnerConfig()
  const removeConfig = useRemoveRunnerConfig()
  const { start, stop, startAll, stopAll } = useRunner()

  const [modalConfig, setModalConfig] = useState<RunnerConfigData | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const services: RunnerService[] = useMemo(() =>
    configs.map((cfg) => {
      const live = liveServices.find((s) => s.id === cfg.id)
      return {
        id: cfg.id,
        name: cfg.name,
        status: live?.status ?? 'stopped',
        port: live?.port ?? null,
        previewUrl: live?.previewUrl ?? null,
        icon: cfg.icon ?? 'terminal',
      }
    }),
    [configs, liveServices],
  )

  const handleSave = (data: Partial<RunnerConfigData>) => {
    if (modalConfig === 'new') {
      addConfig.mutate(data)
    } else if (modalConfig) {
      updateConfig.mutate({ id: modalConfig.id, updates: data })
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (isServiceActive(services.find((s) => s.id === deleteTarget.id)?.status ?? 'stopped')) {
      stop(deleteTarget.id)
    }
    removeConfig.mutate(deleteTarget.id)
    if (selectedId === deleteTarget.id) onSelect(null)
    setDeleteTarget(null)
  }

  return (
    <Flex direction="column" css={{ height: '100%', background: 'var(--studio-bg-sidebar)' }}>
      {/* Header */}
      <Flex align="center" justify="space-between" css={{ padding: `${spacing.sm} ${spacing.md}`, flexShrink: 0 }}>
        <Text variant="tiny" color="muted">Services</Text>
        <Flex align="center" gap={spacing.xs}>
          <Tooltip content="Add service">
            <IconButton variant="ghost" size="sm" onClick={() => setModalConfig('new')} aria-label="Add service">
              <Plus />
            </IconButton>
          </Tooltip>
          {services.length > 0 && (
            <Tooltip content={anyActive ? 'Stop all' : 'Start all'}>
              <IconButton
                variant={anyActive ? 'danger' : 'ghost'}
                size="sm"
                onClick={anyActive ? stopAll : startAll}
                aria-label={anyActive ? 'Stop all' : 'Start all'}
              >
                {anyActive ? <Square size={10} fill="currentColor" /> : <Play size={12} />}
              </IconButton>
            </Tooltip>
          )}
        </Flex>
      </Flex>

      {/* Service list */}
      <Flex direction="column" gap="2px" css={{ flex: 1, overflowY: 'auto', padding: `0 ${spacing.xs} ${spacing.sm}` }}>
        {/* All logs */}
        <Flex
          as="button"
          align="center"
          gap={spacing.sm}
          onClick={() => onSelect(null)}
          css={{
            padding: `${spacing.sm} ${spacing.sm}`,
            borderRadius: radii.md,
            border: 'none',
            background: selectedId === null ? 'var(--studio-bg-hover)' : 'transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
            width: '100%',
            transition: 'background 0.1s ease',
            '&:hover': { background: 'var(--studio-bg-surface)' },
          }}
        >
          <Text variant="bodySmall" css={{ fontWeight: selectedId === null ? 500 : 400, flex: 1 }}>All Logs</Text>
          {services.length > 0 && <Badge variant="default" size="sm">{services.length}</Badge>}
        </Flex>

        {/* Services */}
        {services.map((svc) => {
          const Icon = getServiceIcon(svc.icon)
          const active = isServiceActive(svc.status)
          const isSelected = selectedId === svc.id
          const config = configs.find((c) => c.id === svc.id)

          return (
            <Flex
              as="button"
              key={svc.id}
              align="center"
              gap={spacing.sm}
              onClick={() => onSelect(svc.id)}
              css={{
                padding: `${spacing.sm} ${spacing.sm}`,
                borderRadius: radii.md,
                border: 'none',
                background: isSelected ? 'var(--studio-bg-hover)' : 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                width: '100%',
                transition: 'background 0.1s ease',
                '&:hover': {
                  background: isSelected ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
                  '& .svc-actions': { opacity: 1 },
                },
              }}
            >
              <StatusDot status={svc.status} size={6} />
              <Icon size={13} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />

              <Flex direction="column" css={{ flex: 1, minWidth: 0 }}>
                <Text variant="bodySmall" css={{ fontWeight: isSelected ? 500 : 400 }}>
                  {svc.name}
                </Text>
                <Text variant="tiny" color="muted">
                  {svc.status === 'running' && svc.port ? `localhost:${svc.port}` : svc.status}
                </Text>
              </Flex>

              <Flex className="svc-actions" gap={spacing.xs} css={{ opacity: 0, transition: 'opacity 0.1s ease' }}>
                <Tooltip content="Edit">
                  <IconButton
                    variant="ghost"
                    size="xs"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (config) setModalConfig(config as any) }}
                    aria-label="Edit"
                  >
                    <Pencil />
                  </IconButton>
                </Tooltip>
                <Tooltip content={active ? 'Stop' : 'Start'}>
                  <IconButton
                    variant="ghost"
                    size="xs"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); active ? stop(svc.id) : start(svc.id) }}
                    aria-label={active ? 'Stop' : 'Start'}
                  >
                    {active ? <Square size={8} fill="currentColor" /> : <Play size={10} />}
                  </IconButton>
                </Tooltip>
                <Tooltip content="Remove">
                  <IconButton
                    variant="ghost"
                    size="xs"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setDeleteTarget({ id: svc.id, name: svc.name }) }}
                    aria-label="Remove"
                  >
                    <Trash2 />
                  </IconButton>
                </Tooltip>
              </Flex>
            </Flex>
          )
        })}

        {configsLoading ? (
          <Flex direction="column" gap={spacing.sm} css={{ padding: spacing.md }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="70%" />
          </Flex>
        ) : services.length === 0 ? (
          <Flex direction="column" align="center" gap={spacing.sm} css={{ padding: spacing['3xl'] }}>
            <Text variant="caption" color="muted">No services detected</Text>
            <Flex
              as="button"
              align="center"
              gap={spacing.xs}
              onClick={() => setModalConfig('new')}
              css={{
                padding: `${spacing.xs} ${spacing.md}`,
                borderRadius: radii.md,
                border: '1px dashed var(--studio-border)',
                background: 'transparent',
                color: 'var(--studio-text-muted)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px',
                transition: 'all 0.1s ease',
                '&:hover': { borderColor: 'var(--studio-border-hover)', color: 'var(--studio-text-secondary)' },
              }}
            >
              <Plus size={12} /> Add service
            </Flex>
          </Flex>
        ) : null}
      </Flex>

      {/* Config modal */}
      {modalConfig && (
        <RunnerConfigModal
          config={modalConfig === 'new' ? null : modalConfig}
          onSave={handleSave}
          onClose={() => setModalConfig(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Remove "${deleteTarget.name}"?`}
          description="This will remove the service configuration. You can always add it back later."
          confirmLabel="Remove"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </Flex>
  )
}

export function RunnerPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const previewOpen = useUiStore((s) => s.previewOpen)
  const setPreviewOpen = useUiStore((s) => s.setPreviewOpen)

  const previewToggle = (
    <Tooltip content={previewOpen ? 'Close preview' : 'Open preview'}>
      <IconButton
        variant={previewOpen ? 'default' : 'ghost'}
        size="xs"
        onClick={() => setPreviewOpen(!previewOpen)}
        aria-label="Toggle preview"
      >
        <PanelRight />
      </IconButton>
    </Tooltip>
  )

  const mainContent = (
    <Box css={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <RunnerLogs externalFilter={selectedService} toolbarTrailing={previewToggle} />
    </Box>
  )

  const rightContent = previewOpen ? (
    <SplitPanel
      left={mainContent}
      defaultWidth={500}
      minWidth={300}
      maxWidth={900}
      storageKey="runner.previewSplit"
    >
      <PreviewPanel onClose={() => setPreviewOpen(false)} />
    </SplitPanel>
  ) : mainContent

  return (
    <Flex css={{ height: '100%', background: 'var(--studio-bg-main)' }}>
      <SplitPanel
        left={<ServiceListPanel selectedId={selectedService} onSelect={setSelectedService} />}
        defaultWidth={220}
        minWidth={180}
        maxWidth={350}
        storageKey="runner.servicesWidth"
      >
        {rightContent}
      </SplitPanel>
    </Flex>
  )
}
