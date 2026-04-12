import { memo, useCallback } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { VirtualList, spacing } from '@/components/shared/ui'
import type { DiffLine, ParsedDiff } from '../hooks'
import { getLineStyles, lineNumStyle, LINE_HEIGHT, FONT } from '../hooks'

const DiffRow = memo(function DiffRow({ line, index }: { line: DiffLine; index: number }) {
  const s = getLineStyles(line.type)

  if (line.type === 'header') {
    return (
      <Flex
        align="center"
        css={{
          padding: `6px ${spacing.md}`,
          background: s.bg,
          color: s.textColor,
          fontFamily: FONT,
          fontSize: '11px',
          fontWeight: 500,
          borderTop: index > 0 ? '1px solid var(--studio-border)' : undefined,
          borderBottom: '1px solid var(--studio-border)',
        }}
      >
        {line.content}
      </Flex>
    )
  }

  return (
    <Flex
      css={{
        background: s.bg,
        fontFamily: FONT,
        fontSize: '12px',
        lineHeight: `${LINE_HEIGHT}px`,
        '&:hover': { opacity: 0.85 },
      }}
    >
      {/* Old line number */}
      <Box css={{ ...lineNumStyle, color: s.numColor, borderRight: '1px solid var(--studio-border)' }}>
        {line.oldNum ?? ''}
      </Box>
      {/* New line number */}
      <Box css={{ ...lineNumStyle, color: s.numColor }}>
        {line.newNum ?? ''}
      </Box>
      {/* Gutter */}
      <Box css={{
        width: '18px', minWidth: '18px', textAlign: 'center',
        color: s.gutterColor, fontWeight: 700, fontSize: '11px',
        userSelect: 'none',
        lineHeight: `${LINE_HEIGHT}px`,
        borderRight: '1px solid var(--studio-border)',
      }}>
        {line.type === 'add' ? '+' : line.type === 'remove' ? '\u2212' : ''}
      </Box>
      {/* Content */}
      <Box css={{
        flex: 1,
        padding: `0 ${spacing.md} 0 ${spacing.sm}`,
        whiteSpace: 'pre',
        color: s.textColor,
        lineHeight: `${LINE_HEIGHT}px`,
        overflow: 'hidden',
      }}>
        {line.content || ' '}
      </Box>
    </Flex>
  )
})

interface DiffTableProps {
  parsed: ParsedDiff
}

export function DiffTable({ parsed }: DiffTableProps) {
  const renderItem = useCallback((line: DiffLine, index: number) => (
    <DiffRow line={line} index={index} />
  ), [])

  return (
    <VirtualList
      items={parsed.lines}
      estimateSize={LINE_HEIGHT}
      renderItem={renderItem}
      overscan={30}
    />
  )
}
