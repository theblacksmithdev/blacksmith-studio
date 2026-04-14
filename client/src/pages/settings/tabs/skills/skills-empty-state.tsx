import { Flex } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Wand2, Plus, ArrowRight } from 'lucide-react'
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

const SecondaryLink = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.12s ease;
  &:hover { color: var(--studio-text-primary); }
`

interface SkillsEmptyStateProps {
  onBrowse: () => void
}

export function SkillsEmptyState({ onBrowse }: SkillsEmptyStateProps) {
  return (
    <Wrap>
      <IconWrap><Wand2 size={24} /></IconWrap>
      <Flex direction="column" gap="6px" align="center">
        <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
          Teach Claude new skills
        </Text>
        <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', maxWidth: '340px', lineHeight: 1.6 }}>
          Skills are reusable prompts that Claude can invoke with a slash command. Create project-specific workflows like deploying, running tests, or generating boilerplate.
        </Text>
      </Flex>
      <Flex direction="column" align="center" gap="10px">
        <PrimaryBtn onClick={onBrowse}>
          <Plus size={13} /> Browse Library
        </PrimaryBtn>
        <SecondaryLink onClick={onBrowse}>
          Or create a custom skill <ArrowRight size={11} />
        </SecondaryLink>
      </Flex>
    </Wrap>
  )
}
