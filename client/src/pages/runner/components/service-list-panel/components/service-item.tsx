import { Flex } from '@chakra-ui/react'
import { Play, Square } from 'lucide-react'
import { getServiceIcon, StatusDot } from '@/components/runner/runner-primitives'
import { Text, IconButton, Tooltip, spacing, radii } from '@/components/shared/ui'
import { isServiceActive, RunnerStatus, type RunnerService } from '@/stores/runner-store'
import { ServiceMenu } from './service-menu'
import type { RunnerConfigData } from '@/api/types'

interface ServiceItemProps {
  service: RunnerService
  config?: RunnerConfigData
  selected: boolean
  onSelect: () => void
  onStart: () => void
  onStop: () => void
  onSetup: () => void
  onViewDetails: () => void
  onDiagnose: () => void
  onDelete: () => void
}

export function ServiceItem({
  service: svc,
  config,
  selected,
  onSelect,
  onStart,
  onStop,
  onSetup,
  onViewDetails,
  onDiagnose,
  onDelete,
}: ServiceItemProps) {
  const Icon = getServiceIcon(svc.icon)
  const active = isServiceActive(svc.status)

  return (
    <Flex
      align="center"
      gap={spacing.sm}
      onClick={onSelect}
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
          {svc.status === RunnerStatus.Running && svc.port
            ? `localhost:${svc.port}`
            : svc.status}
        </Text>
      </Flex>

      <Flex className="svc-actions" gap={spacing.xs} css={{ opacity: 0, transition: 'opacity 0.1s ease' }}>
        <Tooltip content={active ? 'Stop' : 'Start'}>
          <IconButton
            variant="ghost"
            size="xs"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); active ? onStop() : onStart() }}
            aria-label={active ? 'Stop' : 'Start'}
          >
            {active ? <Square size={8} fill="currentColor" /> : <Play size={10} />}
          </IconButton>
        </Tooltip>

        <ServiceMenu
          hasSetupCommand={!!config?.setupCommand}
          onSetup={onSetup}
          onViewDetails={onViewDetails}
          onDiagnose={onDiagnose}
          onDelete={onDelete}
        />
      </Flex>
    </Flex>
  )
}
