import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Network, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/api'
import { useSessions } from '@/hooks/use-sessions'
import { useProjectStore } from '@/stores/project-store'
import { newChatPath, chatPath, agentsPath, agentsConversationPath } from '@/router/paths'
import {
  Page, Content, Stack,
  HeroWrap, Greeting, ProjectName, Subtitle, ModeLabel,
  CardsRow, Card, CardGlow, CardHeader, CardIcon, CardTitleGroup,
  CardTitle, CardBadge, CardBody, CardDesc,
  CardFeatures, Feature, FeatureDot, CardFooter, CardAction,
  Divider, RecentSection, SectionLabel,
  RecentList, RecentItem, RecentIcon, RecentBody,
  RecentTitle, RecentMeta, RecentArrow, Sep, TypeBadge,
} from './styles'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function ProjectHome() {
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.activeProject)
  const { sessions } = useSessions({ limit: 3 })
  const [agentConvs, setAgentConvs] = useState<any[]>([])

  useEffect(() => {
    api.agents.listConversations()
      .then((convs) => setAgentConvs(convs.slice(0, 3)))
      .catch(() => {})
  }, [])

  const pid = project?.id
  const hasRecent = sessions.length > 0 || agentConvs.length > 0

  return (
    <Page>
      <Content>
        <Stack>
          {/* ── Hero ── */}
          <HeroWrap>
            <Greeting>
              {getGreeting()}
              {project && <>, <ProjectName>{project.name}</ProjectName></>}
            </Greeting>
            <Subtitle>
              Choose how you want to build — solo with one AI, or with a full team of specialists.
            </Subtitle>
          </HeroWrap>

          {/* ── Mode cards ── */}
          <ModeLabel>Select a mode</ModeLabel>

          <CardsRow>
            {/* ── AI Chat ── */}
            <Card onClick={() => pid && navigate(newChatPath(pid))}>
              <CardGlow className="card-glow" variant="chat" />
              <CardHeader>
                <CardIcon className="card-icon" variant="chat">
                  <MessageSquare size={18} />
                </CardIcon>
                <CardTitleGroup>
                  <CardTitle>AI Chat</CardTitle>
                  <CardBadge variant="chat">1 assistant</CardBadge>
                </CardTitleGroup>
              </CardHeader>
              <CardBody>
                <CardDesc>
                  One-on-one with Claude. Best for quick tasks, questions, and focused coding sessions.
                </CardDesc>
              </CardBody>
              <CardFeatures>
                <Feature><FeatureDot variant="chat" /> Quick questions & debugging</Feature>
                <Feature><FeatureDot variant="chat" /> Focused single-file edits</Feature>
                <Feature><FeatureDot variant="chat" /> Code generation & explanations</Feature>
                <Feature><FeatureDot variant="chat" /> Conversational workflow</Feature>
              </CardFeatures>
              <CardFooter>
                <CardAction>
                  Start a chat
                  <span className="card-arrow"><ArrowRight size={14} /></span>
                </CardAction>
              </CardFooter>
            </Card>

            {/* ── Agent Team ── */}
            <Card onClick={() => pid && navigate(agentsPath(pid))}>
              <CardGlow className="card-glow" variant="team" />
              <CardHeader>
                <CardIcon className="card-icon" variant="team">
                  <Network size={18} />
                </CardIcon>
                <CardTitleGroup>
                  <CardTitle>Agent Team</CardTitle>
                  <CardBadge variant="team">12 specialists</CardBadge>
                </CardTitleGroup>
              </CardHeader>
              <CardBody>
                <CardDesc>
                  A coordinated AI team — PM, frontend, backend, DB, QA, and security — building together.
                </CardDesc>
              </CardBody>
              <CardFeatures>
                <Feature><FeatureDot variant="team" /> Multi-step feature builds</Feature>
                <Feature><FeatureDot variant="team" /> Full-stack coordination</Feature>
                <Feature><FeatureDot variant="team" /> Automated code review & QA</Feature>
                <Feature><FeatureDot variant="team" /> Complex, multi-file tasks</Feature>
              </CardFeatures>
              <CardFooter>
                <CardAction>
                  Launch a team
                  <span className="card-arrow"><ArrowRight size={14} /></span>
                </CardAction>
              </CardFooter>
            </Card>
          </CardsRow>

          {/* ── Recent activity ── */}
          {hasRecent && (
            <>
              <Divider />
              <RecentSection>
                <SectionLabel>Pick up where you left off</SectionLabel>
                <RecentList>
                  {sessions.map((s) => (
                    <RecentItem
                      key={`chat-${s.id}`}
                      onClick={() => pid && navigate(chatPath(pid, s.id))}
                    >
                      <RecentIcon variant="chat">
                        <MessageSquare size={14} />
                      </RecentIcon>
                      <RecentBody>
                        <RecentTitle>{s.lastPrompt || s.name}</RecentTitle>
                        <RecentMeta>
                          <TypeBadge variant="chat">Chat</TypeBadge>
                          <Sep>&middot;</Sep>
                          {formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}
                        </RecentMeta>
                      </RecentBody>
                      <RecentArrow className="recent-arrow">
                        <ArrowRight size={13} />
                      </RecentArrow>
                    </RecentItem>
                  ))}
                  {agentConvs.map((c) => (
                    <RecentItem
                      key={`agent-${c.id}`}
                      onClick={() => pid && navigate(agentsConversationPath(pid, c.id))}
                    >
                      <RecentIcon variant="team">
                        <Network size={14} />
                      </RecentIcon>
                      <RecentBody>
                        <RecentTitle>{c.title}</RecentTitle>
                        <RecentMeta>
                          <TypeBadge variant="team">Team</TypeBadge>
                          <Sep>&middot;</Sep>
                          {c.messageCount} messages
                          <Sep>&middot;</Sep>
                          {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                        </RecentMeta>
                      </RecentBody>
                      <RecentArrow className="recent-arrow">
                        <ArrowRight size={13} />
                      </RecentArrow>
                    </RecentItem>
                  ))}
                </RecentList>
              </RecentSection>
            </>
          )}
        </Stack>
      </Content>
    </Page>
  )
}
