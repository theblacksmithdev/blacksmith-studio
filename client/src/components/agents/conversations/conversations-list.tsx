import { useNavigate } from 'react-router-dom'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { Network, Plus, MessageSquare, Trash2, ArrowRight } from 'lucide-react'
import { useAgentConversations } from '@/hooks/use-agent-conversations'
import { useProjectStore } from '@/stores/project-store'
import { agentsNewPath, agentsConversationPath } from '@/router/paths'
import { quickActions, roster, timeAgo } from './helpers'
import {
  Page, Content, Stack,
  HeroWrap, HeroIcon, HeroTitle, HeroSub,
  RosterWrap, RosterChip,
  NewBtn, ActionsWrap, ActionChip,
  Divider, SectionLabel,
  ConvCard, ConvIcon, DeleteBtn, Sep,
} from './styles'

export function ConversationsList() {
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.activeProject)
  const { conversations: convs, isLoading: loading, deleteConversation } = useAgentConversations()

  const goNew = () => { if (project) navigate(agentsNewPath(project.id)) }
  const goConv = (id: string) => { if (project) navigate(agentsConversationPath(project.id, id)) }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteConversation(id)
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
                  <ConvCard key={c.id} className="conv-card" onClick={() => goConv(c.id)}>
                    <ConvIcon><MessageSquare size={15} /></ConvIcon>
                    <Box css={{ flex: 1, minWidth: 0 }}>
                      <Text css={{
                        fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {c.title}
                      </Text>
                      <Flex gap="5px" mt="2px" align="center">
                        <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>{c.messageCount} messages</Text>
                        <Sep>·</Sep>
                        <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>{timeAgo(c.updatedAt)}</Text>
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
