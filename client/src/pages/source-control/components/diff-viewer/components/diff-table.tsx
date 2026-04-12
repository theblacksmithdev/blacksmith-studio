import { Box } from '@chakra-ui/react'
import { spacing } from '@/components/shared/ui'
import type { ParsedDiff } from '../hooks'
import { getLineStyles, lineNumStyle, LINE_HEIGHT, FONT } from '../hooks'

interface DiffTableProps {
  parsed: ParsedDiff
}

export function DiffTable({ parsed }: DiffTableProps) {
  return (
    <Box css={{
      flex: 1,
      overflow: 'auto',
      '&::-webkit-scrollbar': { width: '6px', height: '6px' },
      '&::-webkit-scrollbar-thumb': { background: 'rgba(128,128,128,0.15)', borderRadius: '3px' },
      '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(128,128,128,0.25)' },
    }}>
      <Box
        as="table"
        css={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: FONT,
          fontSize: '12px',
          lineHeight: `${LINE_HEIGHT}px`,
        }}
      >
        <tbody>
          {parsed.lines.map((line, i) => {
            const s = getLineStyles(line.type)

            if (line.type === 'header') {
              return (
                <tr key={i}>
                  <td
                    colSpan={4}
                    style={{
                      padding: `6px ${spacing.md}`,
                      background: s.bg,
                      color: s.textColor,
                      fontSize: '11px',
                      fontWeight: 500,
                      borderTop: i > 0 ? '1px solid var(--studio-border)' : undefined,
                      borderBottom: '1px solid var(--studio-border)',
                    }}
                  >
                    {line.content}
                  </td>
                </tr>
              )
            }

            return (
              <tr
                key={i}
                style={{ background: s.bg }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                <td style={{ ...lineNumStyle, color: s.numColor, borderRight: '1px solid var(--studio-border)' }}>
                  {line.oldNum ?? ''}
                </td>
                <td style={{ ...lineNumStyle, color: s.numColor }}>
                  {line.newNum ?? ''}
                </td>
                <td style={{
                  width: '18px', minWidth: '18px', textAlign: 'center',
                  color: s.gutterColor, fontWeight: 700, fontSize: '11px',
                  userSelect: 'none', verticalAlign: 'top',
                  lineHeight: `${LINE_HEIGHT}px`,
                  borderRight: '1px solid var(--studio-border)',
                }}>
                  {line.type === 'add' ? '+' : line.type === 'remove' ? '\u2212' : ''}
                </td>
                <td style={{
                  padding: `0 ${spacing.md} 0 ${spacing.sm}`,
                  whiteSpace: 'pre',
                  color: s.textColor,
                  lineHeight: `${LINE_HEIGHT}px`,
                }}>
                  {line.content || ' '}
                </td>
              </tr>
            )
          })}
        </tbody>
      </Box>
    </Box>
  )
}
