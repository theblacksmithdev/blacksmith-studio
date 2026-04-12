import { Flex } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { BookOpen, Plus } from 'lucide-react'
import { Text } from '@/components/shared/ui'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 44px 24px;
  text-align: center;
  border-radius: 10px;
  border: 1px dashed var(--studio-border);
  background: var(--studio-bg-inset);
`

const IconWrap = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--studio-text-muted);
`

const PrimaryBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.12s ease;
  &:hover { opacity: 0.85; }
`

interface KnowledgeEmptyStateProps {
  onCreate: () => void
}

export function KnowledgeEmptyState({ onCreate }: KnowledgeEmptyStateProps) {
  return (
    <Wrap>
      <IconWrap><BookOpen size={24} /></IconWrap>
      <Flex direction="column" gap="6px" align="center">
        <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
          Give Claude context
        </Text>
        <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', maxWidth: '340px', lineHeight: 1.6 }}>
          Add markdown documents that Claude reads on every conversation — project requirements, architecture decisions, API specs, and coding conventions.
        </Text>
      </Flex>
      <PrimaryBtn onClick={onCreate}>
        <Plus size={13} /> Create Document
      </PrimaryBtn>
    </Wrap>
  )
}
