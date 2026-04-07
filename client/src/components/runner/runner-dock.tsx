import { useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import {
  Server,
  Globe,
  Square,
  Play,
  Terminal,
  X,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import {
  useRunnerStore,
  selectIsAnyActive,
  selectIsAnyStarting,
  isServiceActive,
  type RunnerStatus,
  type LogEntry,
} from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { useProjectStore } from '@/stores/project-store'
import { useUiStore } from '@/stores/ui-store'
import { runPath } from '@/router/paths'
import { StatusDot, getLineColor, MONO_FONT } from './runner-primitives'

/* ── Animations ── */

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
`

const panelIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

/* ── FAB ── */

const Fab = styled.button`
  position: fixed;
  bottom: 20px;
  right: 24px;
  z-index: 900;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--studio-border-hover);
  background: var(--studio-bg-sidebar);
  color: var(--studio-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    var(--studio-shadow),
    0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  animation: ${scaleIn} 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: scale(1.08);
    box-shadow:
      var(--studio-shadow),
      0 6px 24px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: scale(0.96);
  }
`

const FabBadge = styled.span<{ starting: boolean }>`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--studio-accent);
  border: 2px solid var(--studio-bg-sidebar);
  ${({ starting }) =>
    starting ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
`

/* ── Floating Panel ── */

const Panel = styled.div`
  position: fixed;
  bottom: 20px;
  right: 24px;
  z-index: 900;
  width: 380px;
  max-height: calc(100vh - 80px);
  border-radius: 16px;
  background: var(--studio-bg-sidebar);
  border: 1px solid var(--studio-border-hover);
  box-shadow:
    var(--studio-shadow),
    0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${panelIn} 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`

/* ── Panel header ── */

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`

const PanelTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--studio-text-primary);
  flex: 1;
  letter-spacing: -0.01em;
`

const HeaderAction = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

/* ── Service cards ── */

const Services = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  flex-shrink: 0;
`

const ServiceRow = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${({ active }) => (active ? 'var(--studio-border-hover)' : 'var(--studio-border)')};
  background: ${({ active }) => (active ? 'var(--studio-bg-surface)' : 'var(--studio-bg-main)')};
  transition: all 0.12s ease;
`

const ServiceIcon = styled.div<{ active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  background: var(--studio-bg-sidebar);
  flex-shrink: 0;
`

const ServiceBody = styled.div`
  flex: 1;
  min-width: 0;
`

const ServiceLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
`

const ServiceMeta = styled.div`
  font-size: 11px;
  color: var(--studio-text-muted);
  margin-top: 1px;
  font-family: ${MONO_FONT};
`

const ServiceToggle = styled.button<{ active: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  color: ${({ active }) => (active ? 'var(--studio-text-secondary)' : 'var(--studio-accent)')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
  }
`

/* ── Logs ── */

const LogsSection = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--studio-border);
`

const LogsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  flex-shrink: 0;
`

const LogsLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--studio-text-muted);
  flex: 1;
`

const LogsCount = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
`

const ClearBtn = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    color: var(--studio-text-secondary);
    background: var(--studio-bg-surface);
  }
`

const LogsBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2px 0 6px;
  font-family: ${MONO_FONT};
  font-size: 11px;
  line-height: 17px;
  max-height: 240px;
`

const LogLine = styled.div`
  display: flex;
  gap: 8px;
  padding: 1px 14px;

  &:hover {
    background: var(--studio-bg-surface);
  }
`

const LogSource = styled.span`
  width: 38px;
  flex-shrink: 0;
  color: var(--studio-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 9px;
  padding-top: 2px;
  letter-spacing: 0.03em;
`

const LogText = styled.span`
  color: var(--studio-text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
`

const EmptyLogs = styled.div`
  padding: 20px 16px;
  text-align: center;
  color: var(--studio-text-muted);
  font-size: 11px;
`

/* ── Footer ── */

const PanelFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--studio-border);
  flex-shrink: 0;
`

const StopAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  flex: 1;
  justify-content: center;

  &:hover {
    opacity: 0.85;
  }
`

const OpenPageBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover {
    background: var(--studio-bg-surface);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`

/* ── Sub-components ── */

function DockLogLine({ entry }: { entry: LogEntry }) {
  return (
    <LogLine>
      <LogSource>{entry.source === 'backend' ? 'djng' : 'vite'}</LogSource>
      <LogText style={{ color: getLineColor(entry.line) }}>{entry.line}</LogText>
    </LogLine>
  )
}

function ServiceCard({ label, icon: Icon, status, port, onToggle }: {
  label: string
  icon: typeof Server
  status: RunnerStatus
  port: number | null
  onToggle: () => void
}) {
  const active = isServiceActive(status)
  return (
    <ServiceRow active={active}>
      <ServiceIcon active={active}>
        <Icon size={14} />
      </ServiceIcon>
      <ServiceBody>
        <ServiceLabel>
          <StatusDot status={status} size={5} />
          {label}
        </ServiceLabel>
        <ServiceMeta>
          {port && status === 'running' ? `localhost:${port}` : status === 'starting' ? 'Starting...' : 'Stopped'}
        </ServiceMeta>
      </ServiceBody>
      <ServiceToggle active={active} onClick={onToggle} title={active ? `Stop ${label}` : `Start ${label}`}>
        {active ? <Square size={10} /> : <Play size={10} />}
      </ServiceToggle>
    </ServiceRow>
  )
}

/* ── Main component ── */

export function RunnerDock() {
  const open = useUiStore((s) => s.runnerPanelOpen)
  const setOpen = useUiStore((s) => s.setRunnerPanelOpen)

  const logsEndRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const backendStatus = useRunnerStore((s) => s.backendStatus)
  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const backendPort = useRunnerStore((s) => s.backendPort)
  const frontendPort = useRunnerStore((s) => s.frontendPort)
  const logs = useRunnerStore((s) => s.logs)
  const clearLogs = useRunnerStore((s) => s.clearLogs)
  const anyActive = useRunnerStore(selectIsAnyActive)
  const anyStarting = useRunnerStore(selectIsAnyStarting)
  const { start, stop } = useRunner()
  const activeProject = useProjectStore((s) => s.activeProject)

  // Auto-scroll logs
  useEffect(() => {
    if (open) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, open])

  // Don't render on the run page or when nothing is active
  const isOnRunPage = location.pathname.endsWith('/run')
  if (isOnRunPage || !anyActive) return null

  const recentLogs = logs.slice(-100)

  const activeCount =
    (isServiceActive(backendStatus) ? 1 : 0) +
    (isServiceActive(frontendStatus) ? 1 : 0)

  /* ── FAB (closed state) ── */
  if (!open) {
    return (
      <Fab onClick={() => setOpen(true)} title={`${activeCount} server${activeCount > 1 ? 's' : ''} running`}>
        <Terminal size={18} />
        <FabBadge starting={anyStarting} />
      </Fab>
    )
  }

  /* ── Floating panel (open state) ── */
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Dev Servers</PanelTitle>
        <HeaderAction onClick={() => setOpen(false)} title="Close">
          <X size={15} />
        </HeaderAction>
      </PanelHeader>

      <Services>
        <ServiceCard
          label="Backend"
          icon={Server}
          status={backendStatus}
          port={backendPort}
          onToggle={() => (isServiceActive(backendStatus) ? stop('backend') : start('backend'))}
        />
        <ServiceCard
          label="Frontend"
          icon={Globe}
          status={frontendStatus}
          port={frontendPort}
          onToggle={() => (isServiceActive(frontendStatus) ? stop('frontend') : start('frontend'))}
        />
      </Services>

      <LogsSection>
        <LogsHeader>
          <LogsLabel>Output</LogsLabel>
          <LogsCount>{recentLogs.length} lines</LogsCount>
          <ClearBtn onClick={clearLogs} title="Clear logs">
            <Trash2 size={11} />
          </ClearBtn>
        </LogsHeader>
        <LogsBody>
          {recentLogs.length === 0 ? (
            <EmptyLogs>Waiting for output...</EmptyLogs>
          ) : (
            recentLogs.map((entry, i) => <DockLogLine key={i} entry={entry} />)
          )}
          <div ref={logsEndRef} />
        </LogsBody>
      </LogsSection>

      <PanelFooter>
        <StopAllBtn onClick={() => stop('all')}>
          <Square size={10} />
          Stop All
        </StopAllBtn>
        <OpenPageBtn onClick={() => { activeProject && navigate(runPath(activeProject.id)); setOpen(false) }}>
          <ExternalLink size={12} />
          Full View
        </OpenPageBtn>
      </PanelFooter>
    </Panel>
  )
}
