import { useState } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { Play, Square, PanelRight } from 'lucide-react'
import { useRunnerStore, selectServices, selectIsAnyActive, isServiceActive } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { useUiStore } from '@/stores/ui-store'
import { getServiceIcon, StatusDot } from './runner-primitives'
import { RunnerLogs } from './logs'
import { PreviewPanel } from '@/components/shared/preview-panel'
import { SplitPanel } from '@/components/shared/layout'
import { Text, IconButton, Tooltip, Badge, spacing, radii } from '@/components/shared/ui'

function ServiceListPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const services = useRunnerStore(selectServices)
  const anyActive = useRunnerStore(selectIsAnyActive)
  const { start, stop, startAll, stopAll } = useRunner()

  return (
    <Flex direction="column" css={{ height: '100%', background: 'var(--studio-bg-sidebar)' }}>
      <Flex align="center" justify="space-between" css={{ padding: `${spacing.sm} ${spacing.md}`, flexShrink: 0 }}>
        <Text variant="tiny" color="muted">Services</Text>
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
              </Flex>
            </Flex>
          )
        })}

        {services.length === 0 && (
          <Flex align="center" justify="center" css={{ padding: spacing['3xl'] }}>
            <Text variant="caption" color="muted">No services detected</Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

export function RunnerPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const previewOpen = useUiStore((s) => s.previewOpen)
  const setPreviewOpen = useUiStore((s) => s.setPreviewOpen)

  const mainContent = (
    <Flex direction="column" css={{ height: '100%' }}>
      <Flex align="center" justify="flex-end" css={{ padding: spacing.sm, flexShrink: 0 }}>
        <Tooltip content={previewOpen ? 'Close preview' : 'Open preview'}>
          <IconButton
            variant={previewOpen ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewOpen(!previewOpen)}
            aria-label="Toggle preview"
          >
            <PanelRight />
          </IconButton>
        </Tooltip>
      </Flex>
      <Box css={{ flex: 1, minHeight: 0 }}>
        <RunnerLogs externalFilter={selectedService} />
      </Box>
    </Flex>
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
