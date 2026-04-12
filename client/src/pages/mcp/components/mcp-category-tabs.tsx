import { Flex } from '@chakra-ui/react'
import styled from '@emotion/styled'
import type { McpPreset } from '@/pages/settings/components/mcp-library/presets'

const Tab = styled.button<{ active: boolean }>`
  padding: 5px 14px;
  border-radius: 20px;
  border: none;
  font-size: 13px;
  font-weight: ${(p) => (p.active ? 500 : 400)};
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  background: ${(p) => (p.active ? 'var(--studio-accent)' : 'transparent')};
  color: ${(p) => (p.active ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)')};
  white-space: nowrap;

  &:hover {
    ${(p) => !p.active && 'color: var(--studio-text-secondary); background: var(--studio-bg-surface);'}
  }
`

const Count = styled.span`
  font-size: 11px;
  margin-left: 4px;
  opacity: 0.6;
`

interface McpCategoryTabsProps {
  categories: { id: string; label: string }[]
  presets: McpPreset[]
  active: string
  onChange: (id: string) => void
}

export function McpCategoryTabs({ categories, presets, active, onChange }: McpCategoryTabsProps) {
  return (
    <Flex justify="center" css={{ padding: '14px 24px' }}>
      <Flex gap="4px" css={{ flexWrap: 'wrap' }}>
        {categories.map((cat) => {
          const count = cat.id === 'all'
            ? presets.length
            : presets.filter((p) => p.category === cat.id).length
          return (
            <Tab key={cat.id} active={active === cat.id} onClick={() => onChange(cat.id)}>
              {cat.label}<Count>{count}</Count>
            </Tab>
          )
        })}
      </Flex>
    </Flex>
  )
}
