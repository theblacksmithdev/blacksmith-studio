import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHours } from 'date-fns'
import { MessageSquare, Network } from 'lucide-react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { Text, VStack, spacing } from '@/components/shared/ui'
import { useActiveProjectId } from '@/api/hooks/_shared'
import { useProjectQuery } from '@/api/hooks/projects'
import { newChatPath, chatPath, agentsPath, agentsConversationPath } from '@/router/paths'
import { useRecentActivity } from './hooks/use-recent-activity'
import { ModeCard } from './components/mode-card'
import { RecentActivity } from './components/recent-activity'
import { NetworkHero } from './components/illustrations/network-hero'
import { ChatIllustration } from './components/illustrations/chat-illustration'
import { AgentIllustration } from './components/illustrations/agent-illustration'

/* ── Animations ── */

const fadeInLeft = keyframes`
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
`

const fadeInRight = keyframes`
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
`

/* ── Layout ── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
`

const ScrollArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  min-height: 0;
`

const SplitContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 960px;
  min-width: 640px;
  gap: ${spacing['4xl']};
  padding: ${spacing['5xl']} ${spacing['3xl']};
  margin: 0 auto;
`

const LeftPanel = styled.div`
  flex: 0 0 42%;
  display: flex;
  flex-direction: column;
  gap: ${spacing['3xl']};
  justify-content: center;
  animation: ${fadeInLeft} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
`

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  position: relative;
  justify-content: center;
  animation: ${fadeInRight} 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
`

const HeroIllustration = styled.div`
  position: absolute;
  top: -40px;
  right: -40px;
  width: 220px;
  height: 380px;
  opacity: 0.12;
  pointer-events: none;
`

/* ── Helpers ── */

function getGreeting(): string {
  const hour = getHours(new Date())
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/* ── Page ── */

export default function HomePage() {
  const navigate = useNavigate()
  const pid = useActiveProjectId()
  const { data: project } = useProjectQuery(pid)
  const { sessions, agentConvs, hasRecent } = useRecentActivity()

  const goChat = useCallback(() => pid && navigate(newChatPath(pid)), [pid, navigate])
  const goAgents = useCallback(() => pid && navigate(agentsPath(pid)), [pid, navigate])
  const goSession = useCallback((id: string) => pid && navigate(chatPath(pid, id)), [pid, navigate])
  const goConversation = useCallback((id: string) => pid && navigate(agentsConversationPath(pid, id)), [pid, navigate])

  return (
    <Page>
      <ScrollArea>
        <SplitContainer>
          {/* ── Left: Greeting + Recent ── */}
          <LeftPanel>
            <VStack gap="md" css={{ alignItems: 'flex-start' }}>
              <Text variant="display">
                {getGreeting()}
                {project && (
                  <>
                    ,<br />
                    <Text as="span" variant="display" color="tertiary">{project.name}</Text>
                  </>
                )}
              </Text>
              <Text variant="body" color="muted" css={{ maxWidth: '320px' }}>
                Choose how you want to build — solo with one AI, or with a full team of specialists.
              </Text>
            </VStack>

            {hasRecent && (
              <RecentActivity
                sessions={sessions}
                agentConvs={agentConvs}
                onSelectSession={goSession}
                onSelectConversation={goConversation}
              />
            )}
          </LeftPanel>

          {/* ── Right: Mode Cards ── */}
          <RightPanel>
            <HeroIllustration>
              <NetworkHero width="100%" height="100%" />
            </HeroIllustration>

            <Text variant="tiny" color="muted">Select a mode</Text>

            <ModeCard
              icon={<MessageSquare />}
              title="AI Chat"
              badge="1 assistant"
              description="One-on-one with Claude. Best for quick tasks, questions, and focused coding sessions."
              features={[
                'Quick questions & debugging',
                'Focused single-file edits',
                'Code generation & explanations',
                'Conversational workflow',
              ]}
              action="Start a chat"
              illustration={<ChatIllustration width="100%" height="100%" />}
              onClick={goChat}
            />

            <ModeCard
              icon={<Network />}
              title="Agent Team"
              badge="12 specialists"
              description="A coordinated AI team — PM, frontend, backend, DB, QA, and security — building together."
              features={[
                'Multi-step feature builds',
                'Full-stack coordination',
                'Automated code review & QA',
                'Complex, multi-file tasks',
              ]}
              action="Launch a team"
              accent
              illustration={<AgentIllustration width="100%" height="100%" />}
              onClick={goAgents}
            />
          </RightPanel>
        </SplitContainer>
      </ScrollArea>
    </Page>
  )
}
