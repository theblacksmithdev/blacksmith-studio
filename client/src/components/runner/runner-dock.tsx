import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import {
  Server,
  Globe,
  Square,
  ChevronUp,
  ChevronDown,
  Terminal,
  Minus,
  Play,
} from 'lucide-react'
import {
  useRunnerStore,
  selectIsAnyActive,
  selectIsAnyStarting,
  isServiceActive,
  type LogEntry,
} from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'
import { useProjectStore } from '@/stores/project-store'
import { runPath } from '@/router/paths'
import { StatusDot, PortLabel, getLineColor, MONO_FONT } from './runner-primitives'

type DockView = 'fab' | 'bar' | 'expanded'

/* ── Animations ── */

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
`

/* ── FAB (collapsed floating button) ── */

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
    border-color: var(--studio-border-hover);
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

/* ── Bar + Expanded panel ── */

const Panel = styled.div<{ expanded: boolean }>`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
  display: flex;
  flex-direction: column;
  width: ${({ expanded }) => (expanded ? '680px' : 'auto')};
  max-width: calc(100vw - 120px);
  border-radius: ${({ expanded }) => (expanded ? '16px' : '14px')};
  background: var(--studio-bg-sidebar);
  border: 1px solid var(--studio-border-hover);
  box-shadow:
    var(--studio-shadow),
    0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  overflow: hidden;
  animation: ${slideUp} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              border-radius 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`

const DockBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px 8px 14px;
  cursor: default;
  user-select: none;
`

const ServicePill = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)')};
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)')};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  white-space: nowrap;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`

const DockAction = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-tertiary);
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const StopAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }
`

const LogsPanel = styled.div`
  border-top: 1px solid var(--studio-border);
  max-height: 240px;
  overflow-y: auto;
  font-family: ${MONO_FONT};
  font-size: 11px;
  line-height: 17px;
  background: var(--studio-bg-inset);
  padding: 6px 0;
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
  width: 44px;
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

const Spacer = styled.div`
  flex: 1;
`

const Separator = styled.div`
  width: 1px;
  height: 16px;
  background: var(--studio-border);
  flex-shrink: 0;
  margin: 0 2px;
`

const EmptyLogs = styled.div`
  padding: 16px;
  text-align: center;
  color: var(--studio-text-muted);
  font-size: 11px;
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

/* ── Main component ── */

export function RunnerDock() {
  const [view, setView] = useState<DockView>('bar')
  const logsEndRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const backendStatus = useRunnerStore((s) => s.backendStatus)
  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const backendPort = useRunnerStore((s) => s.backendPort)
  const frontendPort = useRunnerStore((s) => s.frontendPort)
  const logs = useRunnerStore((s) => s.logs)
  const anyActive = useRunnerStore(selectIsAnyActive)
  const anyStarting = useRunnerStore(selectIsAnyStarting)
  const { start, stop } = useRunner()
  const activeProject = useProjectStore((s) => s.activeProject)

  // Reset to bar when servers start, hide when they stop
  useEffect(() => {
    if (anyActive) {
      setView((v) => (v === 'fab' ? 'bar' : v))
    }
  }, [anyActive])

  // Auto-scroll logs when expanded
  useEffect(() => {
    if (view === 'expanded') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, view])

  // Don't render on the run page or when nothing is active
  const isOnRunPage = location.pathname.endsWith('/run')
  if (isOnRunPage || !anyActive) return null

  const recentLogs = logs.slice(-80)

  // Count active services for FAB label
  const activeCount =
    (isServiceActive(backendStatus) ? 1 : 0) +
    (isServiceActive(frontendStatus) ? 1 : 0)

  /* ── FAB view ── */
  if (view === 'fab') {
    return (
      <Fab onClick={() => setView('bar')} title={`${activeCount} server${activeCount > 1 ? 's' : ''} running`}>
        <Terminal size={18} />
        <FabBadge starting={anyStarting} />
      </Fab>
    )
  }

  /* ── Bar / Expanded view ── */
  const isExpanded = view === 'expanded'

  return (
    <Panel expanded={isExpanded}>
      <DockBar>
        <ServicePill
          active={backendStatus === 'running'}
          onClick={() => (isServiceActive(backendStatus) ? stop('backend') : start('backend'))}
        >
          <StatusDot status={backendStatus} />
          <Server size={12} />
          Backend
          {backendPort && backendStatus === 'running' && <PortLabel>:{backendPort}</PortLabel>}
        </ServicePill>

        <ServicePill
          active={frontendStatus === 'running'}
          onClick={() => (isServiceActive(frontendStatus) ? stop('frontend') : start('frontend'))}
        >
          <StatusDot status={frontendStatus} />
          <Globe size={12} />
          Frontend
          {frontendPort && frontendStatus === 'running' && <PortLabel>:{frontendPort}</PortLabel>}
        </ServicePill>

        <Spacer />

        <StopAllBtn onClick={() => stop('all')}>
          <Square size={10} />
          Stop All
        </StopAllBtn>

        <Separator />

        {/* Toggle logs */}
        <DockAction
          onClick={() => setView(isExpanded ? 'bar' : 'expanded')}
          title={isExpanded ? 'Collapse logs' : 'Show logs'}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </DockAction>

        {/* Open full run page */}
        <DockAction
          onClick={() => activeProject && navigate(runPath(activeProject.id))}
          title="Open Run page"
        >
          <Play size={14} />
        </DockAction>

        {/* Collapse to FAB */}
        <DockAction onClick={() => setView('fab')} title="Minimize">
          <Minus size={14} />
        </DockAction>
      </DockBar>

      {isExpanded && (
        <LogsPanel>
          {recentLogs.length === 0 ? (
            <EmptyLogs>Waiting for output...</EmptyLogs>
          ) : (
            recentLogs.map((entry, i) => <DockLogLine key={i} entry={entry} />)
          )}
          <div ref={logsEndRef} />
        </LogsPanel>
      )}
    </Panel>
  )
}
