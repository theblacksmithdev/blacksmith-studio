import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import {
  Network, Plus, MessageSquare, Trash2, ArrowRight,
  Monitor, Server, Database, Palette, TestTube, Shield,
} from 'lucide-react'
import { api } from '@/api'
import { useProjectStore } from '@/stores/project-store'
import { agentsNewPath, agentsConversationPath } from '@/router/paths'

/* ── Layout ── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
`

const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  min-height: 0;
`

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 620px;
  padding: 40px 24px;
  margin: 0 auto;
`

/* ── Hero ── */

const HeroWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const HeroIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(16, 163, 127, 0.15), rgba(16, 163, 127, 0.04));
  border: 1px solid rgba(16, 163, 127, 0.15);
  color: var(--studio-green);
  margin-bottom: 4px;
`

const HeroTitle = styled.h1`
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--studio-text-primary);
  text-align: center;
  line-height: 1.2;
`

const HeroSub = styled.p`
  font-size: 14px;
  color: var(--studio-text-muted);
  text-align: center;
  line-height: 1.5;
  max-width: 360px;
`

/* ── Agent Roster ── */

const RosterWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 4px 0;
`

const RosterChip = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  font-size: 10px;
  font-weight: 500;
  color: var(--studio-text-tertiary);
`

/* ── New Button ── */

const NewBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 24px;
  border-radius: 12px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;

  &:hover { opacity: 0.85; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`

/* ── Quick Actions ── */

const ActionsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
`

const ActionChip = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 13px;
  font-weight: 450;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;

  .arrow {
    opacity: 0;
    transform: translateX(-2px);
    transition: all 0.15s ease;
    color: var(--studio-text-tertiary);
    display: flex;
  }

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
    background: var(--studio-bg-surface);
    .arrow { opacity: 1; transform: translateX(0); }
  }
`

/* ── Divider + Section ── */

const Divider = styled.div`
  width: 40px;
  height: 1px;
  background: var(--studio-border);
  margin: 4px 0;
  opacity: 0.6;
`

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  width: 100%;
  text-align: left;
`

/* ── Conversation Card ── */

const ConvCard = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-surface);
  }
`

const ConvIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-bg-surface);
  color: var(--studio-text-tertiary);
  flex-shrink: 0;
`

const DeleteBtn = styled.button`
  padding: 6px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  flex-shrink: 0;
  opacity: 0;

  ${ConvCard}:hover & { opacity: 1; }
  &:hover { background: rgba(239, 68, 68, 0.08); color: var(--studio-error); }
`

const Sep = styled.span`
  font-size: 9px;
  color: var(--studio-border-hover);
`

/* ── Data ── */

const quickActions = [
  { label: 'Build a feature', prompt: 'Help me build a new full-stack feature with models, API, and UI.' },
  { label: 'Add a page', prompt: 'Create a new page with components, routing, and state management.' },
  { label: 'Build an API', prompt: 'Create new Django REST API endpoints with serializers and views.' },
  { label: 'Fix a bug', prompt: 'Help me investigate and fix a bug in my project.' },
  { label: 'Write tests', prompt: 'Write tests for my existing code.' },
  { label: 'Review code', prompt: 'Review recent code changes for quality and security.' },
]

const roster = [
  { icon: Monitor, label: 'Frontend' },
  { icon: Server, label: 'Backend' },
  { icon: Database, label: 'Database' },
  { icon: Palette, label: 'UI/UX' },
  { icon: TestTube, label: 'QA' },
  { icon: Shield, label: 'Security' },
]

function timeAgo(d: string): string {
  const ms = Date.now() - new Date(d).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/* ── Component ── */

export function ConversationsList() {
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.activeProject)
  const [convs, setConvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.agents.listConversations()
      .then(setConvs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const goNew = () => { if (project) navigate(agentsNewPath(project.id)) }
  const goConv = (id: string) => { if (project) navigate(agentsConversationPath(project.id, id)) }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await api.agents.deleteConversation(id)
    setConvs((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <Page>
      <Content>
        <Stack>
          <HeroWrap>
            <HeroIcon><Network size={22} /></HeroIcon>
            <HeroTitle>Agent Team</HeroTitle>
            <HeroSub>
              Your AI engineering team — PM, engineers, designers, QA — coordinated to build features together.
            </HeroSub>
          </HeroWrap>

          <RosterWrap>
            {roster.map(({ icon: Icon, label }) => (
              <RosterChip key={label}><Icon size={10} />{label}</RosterChip>
            ))}
          </RosterWrap>

          <NewBtn onClick={goNew}>
            <Plus size={15} />
            New conversation
          </NewBtn>

          <ActionsWrap>
            {quickActions.map(({ label }) => (
              <ActionChip key={label} onClick={goNew}>
                {label}
                <span className="arrow"><ArrowRight size={12} /></span>
              </ActionChip>
            ))}
          </ActionsWrap>

          {!loading && convs.length > 0 && (
            <>
              <Divider />
              <SectionLabel>Recent</SectionLabel>
              <VStack gap="4px" align="stretch" w="100%">
                {convs.map((c) => (
                  <ConvCard key={c.id} onClick={() => goConv(c.id)}>
                    <ConvIcon><MessageSquare size={15} /></ConvIcon>
                    <Box css={{ flex: 1, minWidth: 0 }}>
                      <Text css={{
                        fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {c.title}
                      </Text>
                      <Flex gap="5px" mt="2px" align="center">
                        <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)' }}>{c.messageCount} messages</Text>
                        <Sep>·</Sep>
                        <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)' }}>{timeAgo(c.updatedAt)}</Text>
                      </Flex>
                    </Box>
                    <DeleteBtn onClick={(e) => handleDelete(e, c.id)}><Trash2 size={13} /></DeleteBtn>
                  </ConvCard>
                ))}
              </VStack>
            </>
          )}
        </Stack>
      </Content>
    </Page>
  )
}
