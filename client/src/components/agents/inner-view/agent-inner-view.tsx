import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ArrowLeft, Brain, Wrench, CheckCircle, AlertCircle,
  Activity, Layers, ChevronDown, ChevronRight, Users, Zap,
  ArrowUp, Loader2, Bot, Sparkles,
} from 'lucide-react'
import { Textarea } from '@chakra-ui/react'
import { useAgentStore, type AgentLogEntry } from '@/stores/agent-store'
import { api } from '@/api'
import { ROLE_ICONS } from '../shared/role-icons'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { Tooltip } from '@/components/shared/tooltip'
import type { AgentInfo, AgentRole } from '@/api/types'
import { AGENT_TEAMS } from '@/api/types'
import {
  Root, TopBar, BackBtn, TopBarDivider,
  AgentHeader, AgentIcon, AgentName, AgentStatusText, TopBarStats, StatPill,
  ContentArea, StreamColumn, StreamHeader, StreamTitle, LiveDot,
  StreamBody, StreamInner, EmptyState, EmptyIcon,
  InputArea, InputWrap, InputCard, InputFooter, InputHint, SendBtn,
  MsgGroup, AgentRow, AgentAvatar, AgentBubble,
  UserRow, UserBubble,
  SystemRow, SystemBubble,
  ToolRow, ToolIcon, ToolCard, ToolHeader, ToolName, ToolTime,
  ToolCodeWrap, ThinkingBubble, ThinkingLabel,
  CollapsibleContent, ToggleBtn,
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

function ChatEntry({ entry, agentRole }: { entry: AgentLogEntry; agentRole: AgentRole }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = ROLE_ICONS[agentRole] ?? Bot

  const content = entry.content ?? ''
  const isLong = content.length > 500
  const displayContent = isLong && !expanded ? content.slice(0, 500) + '...' : content

  if (entry.type === 'thinking') {
    return (
      <MsgGroup>
        <AgentRow>
          <AgentAvatar><Brain size={11} /></AgentAvatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ThinkingLabel>Thinking</ThinkingLabel>
            <ThinkingBubble><MarkdownRenderer content={displayContent} /></ThinkingBubble>
            {isLong && (
              <ToggleBtn onClick={() => setExpanded(!expanded)}>
                {expanded ? <><ChevronDown size={10} /> Less</> : <><ChevronRight size={10} /> More</>}
              </ToggleBtn>
            )}
          </div>
        </AgentRow>
      </MsgGroup>
    )
  }

  if (entry.type === 'message') {
    return (
      <MsgGroup>
        <AgentRow>
          <AgentAvatar><Icon size={11} /></AgentAvatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <AgentBubble><MarkdownRenderer content={displayContent} /></AgentBubble>
            {isLong && (
              <ToggleBtn onClick={() => setExpanded(!expanded)}>
                {expanded ? <><ChevronDown size={10} /> Less</> : <><ChevronRight size={10} /> More</>}
              </ToggleBtn>
            )}
          </div>
        </AgentRow>
      </MsgGroup>
    )
  }

  if (entry.type === 'tool_use') {
    const inputJson = entry.toolInput ? JSON.stringify(entry.toolInput, null, 2) : ''
    return (
      <MsgGroup>
        <ToolRow>
          <ToolIcon><Wrench size={10} /></ToolIcon>
          <ToolCard>
            <ToolHeader>
              <ToolName>{entry.toolName ?? 'Tool'}</ToolName>
              <ToolTime>{formatTime(entry.timestamp)}</ToolTime>
            </ToolHeader>
            {inputJson && (
              <>
                <CollapsibleContent $open={expanded}>
                  <ToolCodeWrap>
                    <MarkdownRenderer content={'```json\n' + inputJson + '\n```'} />
                  </ToolCodeWrap>
                </CollapsibleContent>
                <ToggleBtn onClick={() => setExpanded(!expanded)}>
                  {expanded ? <><ChevronDown size={10} /> Hide input</> : <><ChevronRight size={10} /> Show input</>}
                </ToggleBtn>
              </>
            )}
          </ToolCard>
        </ToolRow>
      </MsgGroup>
    )
  }

  if (entry.type === 'tool_result') {
    const resultContent = content.length > 500 && !expanded ? content.slice(0, 500) + '\n...' : content
    // Detect if result looks like code/structured output
    const looksLikeCode = content.includes('\n') && (content.includes('  ') || content.includes('{') || content.includes('function'))
    const rendered = looksLikeCode
      ? '```\n' + resultContent + '\n```'
      : resultContent
    return (
      <MsgGroup>
        <ToolRow>
          <ToolIcon $result><CheckCircle size={10} /></ToolIcon>
          <ToolCard>
            <ToolCodeWrap>
              <MarkdownRenderer content={rendered} />
            </ToolCodeWrap>
            {content.length > 500 && (
              <ToggleBtn onClick={() => setExpanded(!expanded)}>
                {expanded ? <><ChevronDown size={10} /> Less</> : <><ChevronRight size={10} /> Full output</>}
              </ToggleBtn>
            )}
          </ToolCard>
        </ToolRow>
      </MsgGroup>
    )
  }

  if (entry.type === 'error') {
    return (
      <MsgGroup>
        <SystemRow>
          <SystemBubble $error><AlertCircle size={9} />{content}</SystemBubble>
        </SystemRow>
      </MsgGroup>
    )
  }

  return (
    <MsgGroup>
      <SystemRow>
        <SystemBubble>
          {entry.type === 'done' ? <CheckCircle size={9} /> : <Activity size={9} />}
          {content}
        </SystemBubble>
      </SystemRow>
    </MsgGroup>
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

  const toolCalls = eventLog.filter((e) => e.type === 'tool_use').length
  const thinkingCount = eventLog.filter((e) => e.type === 'thinking').length

  // Chat input
  const [inputVal, setInputVal] = useState('')
  const [userMessages, setUserMessages] = useState<{ id: string; content: string; timestamp: string }[]>([])

  const handleSend = useCallback(() => {
    const text = inputVal.trim()
    if (!text || isActive) return
    setUserMessages((prev) => [...prev, { id: crypto.randomUUID(), content: text, timestamp: new Date().toISOString() }])
    setInputVal('')
    api.agents.execute({ prompt: text, role: agent.role })
  }, [inputVal, isActive, agent.role])

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSend() }
  }, [handleSend])

  const canSend = !!inputVal.trim() && !isActive

  // Merge user messages into event log chronologically
  const allEntries: (AgentLogEntry | { id: string; type: 'user'; content: string; timestamp: string })[] = []
  let userIdx = 0
  for (const entry of eventLog) {
    while (userIdx < userMessages.length && userMessages[userIdx].timestamp <= entry.timestamp) {
      allEntries.push({ ...userMessages[userIdx], type: 'user' })
      userIdx++
    }
    allEntries.push(entry)
  }
  while (userIdx < userMessages.length) {
    allEntries.push({ ...userMessages[userIdx], type: 'user' })
    userIdx++
  }

  // Auto-scroll
  const streamRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = streamRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (isNearBottom) el.scrollTop = el.scrollHeight
  }, [allEntries.length])

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
            <Icon size={14} />
          </AgentIcon>
          <div>
            <AgentName>{agent.title}</AgentName>
            <AgentStatusText $status={status}>{statusLabel(status)}</AgentStatusText>
          </div>
        </AgentHeader>
        <TopBarStats>
          <StatPill><Zap size={10} /><span>{eventLog.length}</span> events</StatPill>
          <StatPill><Wrench size={10} /><span>{toolCalls}</span> tools</StatPill>
        </TopBarStats>
      </TopBar>

      {/* ── Content ── */}
      <ContentArea>
        {/* Chat stream */}
        <StreamColumn>
          <StreamHeader>
            <LiveDot $active={isActive} />
            <StreamTitle>{isActive ? 'Live' : 'Session'}</StreamTitle>
          </StreamHeader>

          <StreamBody ref={streamRef}>
            <StreamInner>
              {allEntries.length === 0 ? (
                <EmptyState>
                  <EmptyIcon><Sparkles size={18} /></EmptyIcon>
                  Send a message or wait for the pipeline to assign work to this agent.
                </EmptyState>
              ) : (
                allEntries.map((entry) => {
                  if (entry.type === 'user') {
                    return (
                      <MsgGroup key={entry.id}>
                        <UserRow><UserBubble>{entry.content}</UserBubble></UserRow>
                      </MsgGroup>
                    )
                  }
                  return <ChatEntry key={entry.id} entry={entry as AgentLogEntry} agentRole={agent.role} />
                })
              )}
            </StreamInner>
          </StreamBody>

          {/* Input */}
          <InputArea>
            <InputWrap>
              <InputCard>
                <Textarea
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={onKey}
                  placeholder={isActive ? `${agent.title} is working...` : `Message ${agent.title}...`}
                  resize="none"
                  rows={2}
                  disabled={isActive}
                  css={{
                    minHeight: '44px', maxHeight: '100px',
                    padding: '10px 14px 4px',
                    background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--studio-text-primary)',
                    fontSize: '13px', lineHeight: '1.5',
                    '&::placeholder': { color: 'var(--studio-text-tertiary)' },
                    '&:focus': { outline: 'none', boxShadow: 'none', borderColor: 'transparent' },
                  }}
                />
                <InputFooter>
                  <InputHint>
                    {isActive
                      ? <><Loader2 size={9} style={{ animation: 'spin 1s linear infinite' }} /> Working</>
                      : <>{'\u2318'}+Return</>
                    }
                  </InputHint>
                  <Tooltip content="Send">
                    <SendBtn $on={canSend} onClick={handleSend}>
                      <ArrowUp size={13} />
                    </SendBtn>
                  </Tooltip>
                </InputFooter>
              </InputCard>
            </InputWrap>
          </InputArea>
        </StreamColumn>

        {/* Info panel */}
        <InfoPanel>
          <InfoHero>
            <HeroIconWrap $active={isActive}><Icon size={20} /></HeroIconWrap>
            <HeroTitle>{agent.title}</HeroTitle>
            <HeroDesc>{agent.description}</HeroDesc>
            <HeroBadge $status={status}>
              <HeroDot $status={status} />
              {statusBadgeText(status)}
            </HeroBadge>
          </InfoHero>

          <InfoSection>
            <InfoSectionLabel>Metrics</InfoSectionLabel>
            <InfoGrid>
              <InfoMetric><MetricValue>{eventLog.length}</MetricValue><MetricLabel>Events</MetricLabel></InfoMetric>
              <InfoMetric><MetricValue>{toolCalls}</MetricValue><MetricLabel>Tool calls</MetricLabel></InfoMetric>
              <InfoMetric><MetricValue>{thinkingCount}</MetricValue><MetricLabel>Thoughts</MetricLabel></InfoMetric>
              <InfoMetric><MetricValue>{history.length}</MetricValue><MetricLabel>Activities</MetricLabel></InfoMetric>
            </InfoGrid>
          </InfoSection>

          {team && (
            <InfoSection>
              <InfoSectionLabel>Department</InfoSectionLabel>
              <TeamCard>
                <TeamHeader>
                  <TeamIconWrap><Users size={11} /></TeamIconWrap>
                  <TeamTitle>{team.title}</TeamTitle>
                </TeamHeader>
                <TeamDesc>{team.description}</TeamDesc>
                <TeamMemberList>
                  {teammates.map((m) => {
                    const MemberIcon = ROLE_ICONS[m.role as AgentRole] ?? Layers
                    const isSelf = m.role === agent.role
                    return (
                      <TeamMember key={m.role} $isSelf={isSelf}>
                        <MemberIcon size={11} />
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
