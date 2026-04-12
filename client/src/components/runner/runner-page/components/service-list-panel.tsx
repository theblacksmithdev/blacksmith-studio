import { useMemo } from 'react'
import { Flex } from '@chakra-ui/react'
import { Play, Square, Plus } from 'lucide-react'
import { useRunnerStore, selectServices, selectIsAnyActive, isServiceActive, type RunnerService } from '@/stores/runner-store'
import { useRunnerConfigs } from '@/hooks/use-runner-configs'
import { getServiceIcon, StatusDot } from '../../runner-primitives'
import { RunnerConfigDrawer } from '../../config-drawer'
import { DiagnoseDrawer } from '../../logs/components'
import { useActiveService, useServiceActions } from '../hooks'
import { ServiceMenu } from './service-menu'
import { Text, IconButton, Tooltip, Badge, Skeleton, ConfirmDialog, spacing, radii } from '@/components/shared/ui'

export function ServiceListPanel() {
  const { activeId, selectService, isSelected } = useActiveService()
  const { configs, isLoading: configsLoading } = useRunnerConfigs()
  const liveServices = useRunnerStore(selectServices)
  const anyActive = useRunnerStore(selectIsAnyActive)

  const {
    modalConfig, setModalConfig,
    deleteTarget, setDeleteTarget,
    diagnoseDrawer, setDiagnoseDrawer,
    handleSave, handleDelete, handleDiagnose,
    start, stop, startAll, stopAll,
  } = useServiceActions()

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

  const isAllSelected = activeId === null

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
          onClick={() => selectService(null)}
          css={{
            padding: `${spacing.sm} ${spacing.sm}`,
            borderRadius: radii.md,
            border: 'none',
            background: isAllSelected ? 'var(--studio-bg-hover)' : 'transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
            width: '100%',
            transition: 'background 0.1s ease',
            '&:hover': { background: 'var(--studio-bg-surface)' },
          }}
        >
          <Text variant="bodySmall" css={{ fontWeight: isAllSelected ? 500 : 400, flex: 1 }}>All Logs</Text>
          {services.length > 0 && <Badge variant="default" size="sm">{services.length}</Badge>}
        </Flex>

        {/* Services */}
        {services.map((svc) => {
          const Icon = getServiceIcon(svc.icon)
          const active = isServiceActive(svc.status)
          const selected = isSelected(svc.id)
          const config = configs.find((c) => c.id === svc.id)

          return (
            <Flex
              key={svc.id}
              align="center"
              gap={spacing.sm}
              onClick={() => selectService(svc.id)}
              css={{
                padding: `${spacing.sm} ${spacing.sm}`,
                borderRadius: radii.md,
                background: selected ? 'var(--studio-bg-hover)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background 0.1s ease',
                '&:hover': {
                  background: selected ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
                  '& .svc-actions': { opacity: 1 },
                },
              }}
            >
              <StatusDot status={svc.status} size={6} />
              <Icon size={13} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />

              <Flex direction="column" css={{ flex: 1, minWidth: 0 }}>
                <Text variant="bodySmall" css={{ fontWeight: selected ? 500 : 400 }}>
                  {svc.name}
                </Text>
                <Text variant="tiny" color="muted">
                  {svc.status === 'running' && svc.port ? `localhost:${svc.port}` : svc.status}
                </Text>
              </Flex>

              <Flex className="svc-actions" gap={spacing.xs} css={{ opacity: 0, transition: 'opacity 0.1s ease' }}>
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

                <ServiceMenu
                  onViewDetails={() => { if (config) setModalConfig(config as any) }}
                  onDiagnose={() => handleDiagnose(svc.id)}
                  onDelete={() => setDeleteTarget({ id: svc.id, name: svc.name })}
                />
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

      {/* Config drawer */}
      {modalConfig && (
        <RunnerConfigDrawer
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

      {/* AI Diagnose drawer */}
      {diagnoseDrawer && (
        <DiagnoseDrawer
          sessionId={diagnoseDrawer.sessionId}
          initialPrompt={diagnoseDrawer.prompt}
          title={diagnoseDrawer.title}
          onClose={() => setDiagnoseDrawer(null)}
        />
      )}
    </Flex>
  )
}
