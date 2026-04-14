import { Flex } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Blocks, Plus, ArrowRight } from 'lucide-react'
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

interface McpEmptyStateProps {
  onBrowse: () => void
}

export function McpEmptyState({ onBrowse }: McpEmptyStateProps) {
  return (
    <Wrap>
      <IconWrap><Blocks size={24} /></IconWrap>
      <Flex direction="column" gap="6px" align="center">
        <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
          Extend Claude with MCP
        </Text>
        <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', maxWidth: '340px', lineHeight: 1.6 }}>
          Connect external tools, databases, and APIs through the Model Context Protocol. Give Claude the ability to read files, query databases, call APIs, and more.
        </Text>
      </Flex>
      <Flex direction="column" align="center" gap="10px">
        <PrimaryBtn onClick={onBrowse}>
          <Plus size={13} /> Browse Library
        </PrimaryBtn>
        <SecondaryLink onClick={onBrowse}>
          Or add a custom server <ArrowRight size={11} />
        </SecondaryLink>
      </Flex>
    </Wrap>
  )
}
