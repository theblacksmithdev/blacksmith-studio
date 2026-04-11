import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft, Brain, MessageSquare, Wrench, CheckCircle, AlertCircle,
  Activity, Layers, ChevronDown, ChevronRight, Users, Zap, Hash,
} from 'lucide-react'
import { useAgentStore, type AgentLogEntry } from '@/stores/agent-store'
import { ROLE_ICONS } from '../shared/role-icons'
import type { AgentInfo, AgentRole } from '@/api/types'
import { AGENT_TEAMS } from '@/api/types'
import {
  Root, TopBar, BackBtn, TopBarDivider,
  AgentHeader, AgentIcon, AgentName, AgentStatusText, TopBarStats, StatPill,
  ContentArea, StreamColumn, StreamHeader, StreamTitle, LiveDot,
  StreamBody, EmptyState,
  EventEntry, EventStripe, EventContent, EventTopRow, EventLabel, EventText, EventTime,
  ToolBadge, CollapsibleContent, ToggleBtn,
  InfoPanel, InfoHero, HeroIconWrap, HeroTitle, HeroDesc, HeroBadge, HeroDot,
  InfoSection, InfoSectionLabel, InfoGrid, InfoMetric, MetricValue, MetricLabel,
  TeamCard, TeamHeader, TeamIconWrap, TeamTitle, TeamDesc,
  TeamMemberList, TeamMember, SelfTag, MemberStatusDot,
} from './styles'

interface AgentInnerViewProps {
  agent: AgentInfo
  onBack: () => void
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function statusLabel(status: string): string {
  switch (status) {
    case 'idle': return 'Waiting for tasks'
    case 'thinking': return 'Thinking...'
    case 'executing': return 'Working...'
    case 'done': return 'Completed'
    case 'error': return 'Failed'
    default: return ''
  }
}

function statusBadgeText(status: string): string {
  switch (status) {
    case 'idle': return 'Idle'
    case 'thinking': return 'Thinking'
    case 'executing': return 'Active'
    case 'done': return 'Complete'
    case 'error': return 'Error'
    default: return 'Idle'
  }
}

const EVENT_ICONS: Record<string, typeof Brain> = {
  thinking: Brain,
  message: MessageSquare,
  tool_use: Wrench,
  tool_result: CheckCircle,
  error: AlertCircle,
  done: CheckCircle,
  activity: Activity,
}

const EVENT_LABELS: Record<string, string> = {
  thinking: 'Thinking',
  message: 'Response',
  tool_use: 'Tool Call',
  tool_result: 'Result',
  error: 'Error',
  done: 'Done',
  activity: 'Activity',
}

function LogEntry({ entry }: { entry: AgentLogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const isMono = entry.type === 'tool_result'
  const isToolUse = entry.type === 'tool_use'

  const content = entry.content ?? ''
  const isLong = content.length > 300
  const displayContent = isLong && !expanded ? content.slice(0, 300) + '...' : content

  return (
    <EventEntry $type={entry.type}>
      <EventStripe $type={entry.type} />
      <EventContent>
        <EventTopRow>
          <EventLabel $type={entry.type}>{EVENT_LABELS[entry.type] ?? entry.type}</EventLabel>
          {isToolUse && entry.toolName && (
            <ToolBadge>
              <Wrench size={8} />
              {entry.toolName}
            </ToolBadge>
          )}
          <EventTime className="event-time">{formatTime(entry.timestamp)}</EventTime>
        </EventTopRow>

        {isToolUse && entry.toolInput && (
          <CollapsibleContent $open={expanded}>
            <EventText $mono>
              {JSON.stringify(entry.toolInput, null, 2)}
            </EventText>
          </CollapsibleContent>
        )}

        {!isToolUse && content && (
          <EventText $mono={isMono}>{displayContent}</EventText>
        )}

        {(isLong || (isToolUse && entry.toolInput)) && (
          <ToggleBtn onClick={() => setExpanded(!expanded)}>
            {expanded
              ? <><ChevronDown size={10} /> Show less</>
              : <><ChevronRight size={10} /> {isToolUse ? 'Show input' : 'Show more'}</>
            }
          </ToggleBtn>
        )}
      </EventContent>
    </EventEntry>
  )
}

export function AgentInnerView({ agent, onBack }: AgentInnerViewProps) {
  const activities = useAgentStore((s) => s.activities)
  const agents = useAgentStore((s) => s.agents)
  const activity = activities.get(agent.role)
  const Icon = ROLE_ICONS[agent.role] ?? Layers
  const status = activity?.status ?? 'idle'
  const isActive = status === 'executing' || status === 'thinking'
  const eventLog = activity?.eventLog ?? []
  const history = activity?.history ?? []

  const team = AGENT_TEAMS.find((t) => t.roles.includes(agent.role))

  const teammates = team?.roles.map((role) => {
    const info = agents.find((a) => a.role === role)
    const act = activities.get(role)
    return { role, title: info?.title ?? role, status: act?.status ?? 'idle' }
  }) ?? []

  // Counts
  const toolCalls = eventLog.filter((e) => e.type === 'tool_use').length
  const thinkingCount = eventLog.filter((e) => e.type === 'thinking').length

  // Auto-scroll
  const streamRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = streamRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (isNearBottom) el.scrollTop = el.scrollHeight
  }, [eventLog.length])

  return (
    <Root>
      {/* ── Top bar ── */}
      <TopBar>
        <BackBtn onClick={onBack}>
          <ArrowLeft size={13} />
          Canvas
        </BackBtn>

        <TopBarDivider />

        <AgentHeader>
          <AgentIcon $active={isActive}>
            <Icon size={15} />
          </AgentIcon>
          <div>
            <AgentName>{agent.title}</AgentName>
            <AgentStatusText $status={status}>
              {statusLabel(status)}
            </AgentStatusText>
          </div>
        </AgentHeader>

        <TopBarStats>
          <StatPill><Zap size={10} /><span>{eventLog.length}</span> events</StatPill>
          <StatPill><Wrench size={10} /><span>{toolCalls}</span> tools</StatPill>
        </TopBarStats>
      </TopBar>

      {/* ── Content ── */}
      <ContentArea>
        {/* Stream */}
        <StreamColumn>
          <StreamHeader>
            <LiveDot $active={isActive} />
            <StreamTitle>{isActive ? 'Live stream' : 'Event log'}</StreamTitle>
          </StreamHeader>

          <StreamBody ref={streamRef}>
            {eventLog.length === 0 ? (
              <EmptyState>
                <Activity size={22} />
                No activity yet — events will stream here when this agent starts working.
              </EmptyState>
            ) : (
              eventLog.map((entry) => <LogEntry key={entry.id} entry={entry} />)
            )}
          </StreamBody>
        </StreamColumn>

        {/* Info panel */}
        <InfoPanel>
          {/* Hero */}
          <InfoHero>
            <HeroIconWrap $active={isActive}>
              <Icon size={22} />
            </HeroIconWrap>
            <HeroTitle>{agent.title}</HeroTitle>
            <HeroDesc>{agent.description}</HeroDesc>
            <HeroBadge $status={status}>
              <HeroDot $status={status} />
              {statusBadgeText(status)}
            </HeroBadge>
          </InfoHero>

          {/* Metrics */}
          <InfoSection>
            <InfoSectionLabel>Metrics</InfoSectionLabel>
            <InfoGrid>
              <InfoMetric>
                <MetricValue>{eventLog.length}</MetricValue>
                <MetricLabel>Events</MetricLabel>
              </InfoMetric>
              <InfoMetric>
                <MetricValue>{toolCalls}</MetricValue>
                <MetricLabel>Tool calls</MetricLabel>
              </InfoMetric>
              <InfoMetric>
                <MetricValue>{thinkingCount}</MetricValue>
                <MetricLabel>Thoughts</MetricLabel>
              </InfoMetric>
              <InfoMetric>
                <MetricValue>{history.length}</MetricValue>
                <MetricLabel>Activities</MetricLabel>
              </InfoMetric>
            </InfoGrid>
          </InfoSection>

          {/* Team */}
          {team && (
            <InfoSection>
              <InfoSectionLabel>Department</InfoSectionLabel>
              <TeamCard>
                <TeamHeader>
                  <TeamIconWrap>
                    <Users size={12} />
                  </TeamIconWrap>
                  <TeamTitle>{team.title}</TeamTitle>
                </TeamHeader>
                <TeamDesc>{team.description}</TeamDesc>
                <TeamMemberList>
                  {teammates.map((m) => {
                    const MemberIcon = ROLE_ICONS[m.role as AgentRole] ?? Layers
                    const isSelf = m.role === agent.role
                    return (
                      <TeamMember key={m.role} $isSelf={isSelf}>
                        <MemberIcon size={12} />
                        {m.title}
                        {isSelf && <SelfTag>you</SelfTag>}
                        <MemberStatusDot $status={m.status} />
                      </TeamMember>
                    )
                  })}
                </TeamMemberList>
              </TeamCard>
            </InfoSection>
          )}
        </InfoPanel>
      </ContentArea>
    </Root>
  )
}
